import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProviders } from "@/components/AuthProviders";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXTAUTH_URL || "https://aegis.dev";

// Red shield on dark background SVG as data URI for OG image
const OG_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='630' fill='none'%3E%3Crect width='1200' height='630' fill='%230a0a0a'/%3E%3Cpath d='M600 100L800 180v200c0 120-85 200-200 240-115-40-200-120-200-240V180z' fill='%23dc2626' stroke='%23ef4444' stroke-width='4'/%3E%3Cpath d='M560 280l40 40 80-80' stroke='white' stroke-width='12' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Ctext x='600' y='530' text-anchor='middle' fill='white' font-family='system-ui%2C sans-serif' font-size='48' font-weight='bold'%3EAegis%3C/text%3E%3Ctext x='600' y='575' text-anchor='middle' fill='%23a3a3a3' font-family='system-ui%2C sans-serif' font-size='24'%3EAI Agent Observability%3C/text%3E%3C/svg%3E`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Aegis — AI Agent Observability",
  description:
    "Production monitoring for AI agents. Surface silent failures, pull context across traces, improve your agent before users churn.",
  keywords: [
    "AI agent",
    "observability",
    "monitoring",
    "tracing",
    "production",
    "LLM",
  ],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔴</text></svg>",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Aegis — AI Agent Observability",
    description:
      "Production monitoring for AI agents. Surface silent failures, pull context across traces, improve your agent before users churn.",
    type: "website",
    url: SITE_URL,
    siteName: "Aegis",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Aegis — AI Agent Observability",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aegis — AI Agent Observability",
    description:
      "Production monitoring for AI agents. Surface silent failures, pull context across traces, improve your agent before users churn.",
    images: [OG_IMAGE],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Aegis",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description:
    "Production monitoring for AI agents. Surface silent failures, pull context across traces, improve your agent before users churn.",
  url: SITE_URL,
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0",
    highPrice: "299",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Organization",
    name: "Aegis",
    url: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProviders>{children}</AuthProviders>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
