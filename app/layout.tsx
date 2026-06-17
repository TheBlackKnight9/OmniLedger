import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CA OS — Taxpayer & CA Compliance Platform (India)",
  description: "A chartered accountant software platform for India supporting automated compliance seeding, GST, TDS, PF, ROC, and ITR schedules.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", fontSans.variable)}>
      <body className={cn("min-h-screen bg-background font-sans antialiased text-foreground", fontSans.className)}>
        {children}
      </body>
    </html>
  );
}
