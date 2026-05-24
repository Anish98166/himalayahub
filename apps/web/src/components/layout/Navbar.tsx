"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { Avatar } from "@/components/ui/avatar";

export function Navbar() {
  const { t } = useLanguage();

  const navLinks = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/wallets", label: t("nav.wallets") },
    { href: "/remittance/new", label: t("nav.remittance") },
    { href: "/agrichain", label: t("nav.agrichain") },
    { href: "/tourism", label: t("nav.tourism") },
    { href: "/solana", label: "Solana" },
    { href: "/pi-wallet", label: "Pi Wallet" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-terracotta/10 bg-white/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-terracotta">{t("app.name")}</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/60 hover:text-terracotta transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Avatar initials="AT" />
        </div>
      </div>
    </nav>
  );
}
