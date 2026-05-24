"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { t } = useLanguage();

  const features = [
    {
      title: "Remittance",
      desc: "Low-cost, secure money transfers for migrant workers using Stellar blockchain.",
      color: "border-terracotta/20",
      accent: "text-terracotta",
    },
    {
      title: "Digital Wallet",
      desc: "MPC-protected wallets with Stellar and Solana support for all your crypto needs.",
      color: "border-saffron/20",
      accent: "text-saffron",
    },
    {
      title: "AgriChain",
      desc: "Farmer-to-buyer marketplace with full traceability and blockchain verification.",
      color: "border-himalayan-green/20",
      accent: "text-himalayan-green",
    },
    {
      title: "Tourism Pay",
      desc: "Seamless payments for tourists, hotels, guides, and trekking agencies across Nepal.",
      color: "border-rhododendron/20",
      accent: "text-rhododendron",
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-24 md:py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-terracotta/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <h1 className="text-5xl md:text-7xl font-bold text-terracotta mb-6 font-heading">
            {t("app.name")}
          </h1>
          <p className="text-xl md:text-2xl text-foreground/70 max-w-2xl mx-auto mb-10">
            &ldquo;{t("app.tagline")}&rdquo;
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg">{t("auth.register_btn")}</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">{t("auth.login_btn")}</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <Card key={f.title} className={`border ${f.color}`}>
              <CardContent>
                <CardTitle className={f.accent}>{f.title}</CardTitle>
                <CardDescription className="mt-2">{f.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
