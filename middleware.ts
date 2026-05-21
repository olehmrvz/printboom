import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
  count: number;
  blockedUntil: number | null;
}

// In-memory store for failed login attempts (self-hosted / dev only)
// For Vercel Edge, use Redis or an external rate-limiting service
const attempts = new Map<string, AttemptRecord>();

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function isBlocked(ip: string): boolean {
  const record = attempts.get(ip);
  if (!record) return false;
  if (record.blockedUntil && Date.now() < record.blockedUntil) return true;
  // Block expired — clear it
  if (record.blockedUntil && Date.now() >= record.blockedUntil) {
    attempts.delete(ip);
  }
  return false;
}

function recordFailure(ip: string) {
  const record = attempts.get(ip) || { count: 0, blockedUntil: null };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = Date.now() + BLOCK_DURATION_MS;
    console.warn(`[ADMIN] IP ${ip} blocked for 15 minutes after ${MAX_ATTEMPTS} failed login attempts`);
  } else {
    console.warn(`[ADMIN] Failed login attempt ${record.count}/${MAX_ATTEMPTS} from IP ${ip}`);
  }
  attempts.set(ip, record);
}

function clearAttempts(ip: string) {
  attempts.delete(ip);
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const ip = getClientIP(request);

    // Check if IP is rate-limited
    if (isBlocked(ip)) {
      console.warn(`[ADMIN] Blocked IP ${ip} tried to access /admin`);
      return new NextResponse(
        JSON.stringify({ error: "Too many failed attempts. Try again in 15 minutes." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(BLOCK_DURATION_MS / 1000)),
          },
        }
      );
    }

    const basicAuth = request.headers.get("authorization");

    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [user, pwd] = atob(authValue).split(":");

      if (user === process.env.ADMIN_USER && pwd === process.env.ADMIN_PASS) {
        clearAttempts(ip);
        return NextResponse.next();
      }
    }

    // Wrong credentials — record failure
    recordFailure(ip);

    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
