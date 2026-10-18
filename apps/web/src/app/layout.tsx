import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KagazAi",
  description: "Real-time collaborative document editor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
