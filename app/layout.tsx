import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CookieBanner from "@/components/CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Printboom — Конструктор колажів",
  description: "Створюйте готові до друку модні колажі для одягу",
  icons: {
    icon: "/favicon.png",
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
