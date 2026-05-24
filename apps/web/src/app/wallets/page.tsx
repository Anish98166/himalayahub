"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function WalletManagementPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const createWallet = async (chain: string) => {
    try {
      await api("/api/wallets", {
        method: "POST",
        body: JSON.stringify({ chain }),
      });
      alert(`${chain} ${t("wallet.created")}`);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Error creating wallet");
    }
  };

  return (
    <div className="min-h-screen p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-terracotta font-heading mb-8">
          {t("wallet.title")}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-terracotta/20">
            <CardContent>
              <CardTitle className="text-terracotta">Stellar (Soroban)</CardTitle>
              <CardDescription className="mt-2">{t("wallet.stellar_desc")}</CardDescription>
              <Button onClick={() => createWallet("stellar")} className="w-full mt-6">
                {t("wallet.create_stellar")}
              </Button>
            </CardContent>
          </Card>
          <Card className="border-himalayan-green/20">
            <CardContent>
              <CardTitle className="text-himalayan-green">Solana</CardTitle>
              <CardDescription className="mt-2">{t("wallet.solana_desc")}</CardDescription>
              <Button
                onClick={() => createWallet("solana")}
                className="w-full mt-6"
                style={{ backgroundColor: "#81B29A" }}
              >
                {t("wallet.create_solana")}
              </Button>
            </CardContent>
          </Card>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-12 text-foreground/50 hover:text-foreground transition-colors underline"
        >
          ← {t("wallet.back")}
        </button>
      </div>
    </div>
  );
}
