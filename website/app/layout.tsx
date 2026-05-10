import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "a11y-guard — Accessibility Compliance Linter",
  description:
    "Region-aware accessibility linter that maps every violation to the exact law, jurisdiction, and disability type. Know which law you're breaking — ADA, EAA, Section 508, AODA, DDA and more.",
  keywords: [
    "accessibility",
    "a11y",
    "WCAG",
    "ADA",
    "EAA",
    "Section 508",
    "linter",
    "compliance",
  ],
  openGraph: {
    title: "a11y-guard — Accessibility Compliance Linter",
    description:
      "Region-aware accessibility linter that maps every violation to the exact law, jurisdiction, and disability type.",
    type: "website",
    url: "https://a11y-guard.dev",
    siteName: "a11y-guard",
  },
  twitter: {
    card: "summary_large_image",
    title: "a11y-guard — Accessibility Compliance Linter",
    description:
      "Region-aware accessibility linter that maps every violation to the exact law, jurisdiction, and disability type.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
