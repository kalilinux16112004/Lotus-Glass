import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Lotus Enterprises | Premium Architectural Facade & Glazing Solutions Since 2003",
  description:
    "Lotus Enterprises delivers world-class architectural facade solutions including structural glazing, curtain walls, spider glazing, ACP cladding, and skylights. Trusted by architects and builders across India since 2003.",
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
    apple: "/images/favicon.ico",
  },
  keywords: [
    "facade solutions",
    "structural glazing",
    "curtain wall systems",
    "ACP cladding",
    "architectural glass",
    "spider glazing",
    "skylights",
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1a3054" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1a2d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
