import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Xplore Nexus",
    default: "Xplore Nexus — Unified Operations Platform",
  },
  description:
    "Xplore Nexus is an enterprise platform by Xplore Philippines unifying Event Management, Meeting Coordination, and Training Management.",
  keywords: ["event management", "meeting coordination", "training management", "Xplore Philippines"],
  openGraph: {
    type: "website",
    siteName: "Xplore Nexus",
    title: "Xplore Nexus — Unified Operations Platform",
    description:
      "One platform by Xplore Philippines powering your events, meetings, and training at scale.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
