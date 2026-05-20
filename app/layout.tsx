import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Printboom — Collage Constructor",
  description: "Create print-ready fashion collages for apparel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
