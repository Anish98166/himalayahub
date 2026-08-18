import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Navbar } from "@/components/layout/Navbar";
import { PiAutoAuth } from "@/components/auth/PiAutoAuth";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HimalayaHub - Nepal's Crypto Super App",
  description:
    "One Wallet for Nepal's Money, Farms, Mountains & Future. Low-cost remittances, digital wallet, AgriChain marketplace, and Tourism Pay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Providers>
          <PiAutoAuth />
          <Navbar />
          <main className="flex-1">{children}</main>
        </Providers>
        <Script
          src="https://sdk.minepi.com/pi-sdk.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
