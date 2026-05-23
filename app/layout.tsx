import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CookieBanner from "@/components/CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://printboom.vercel.app"),
  title: "Printboom — Конструктор колажів",
  description: "Створюйте готові до друку модні колажі для одягу",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Printboom — Конструктор колажів",
    description: "Створюйте готові до друку модні колажі для одягу",
    url: "https://printboom.vercel.app",
    siteName: "Printboom",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Printboom — Конструктор принтів",
      },
    ],
    locale: "uk_UA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Printboom — Конструктор колажів",
    description: "Створюйте готові до друку модні колажі для одягу",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="antialiased">
        {children}
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
