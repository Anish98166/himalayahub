"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/i18n";
import { WalletCard } from "@/components/wallet/WalletCard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { DashboardData } from "@himalayahub/types";

async function fetchDashboard(): Promise<DashboardData> {
  return api("/api/dashboard");
}

export default function DashboardPage() {
  const { t } = useLanguage();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-terracotta font-medium">{t("dashboard.loading")}</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-12 max-w-6xl mx-auto">
        <Card>
          <CardContent>
            <CardTitle className="text-rhododendron">Error Loading Dashboard</CardTitle>
            <p className="text-foreground/60 mt-2">
              Make sure you're logged in and the backend is running.
            </p>
            <Link href="/auth/login"><Button className="mt-4">Go to Login</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold font-heading text-foreground">
            {t("dashboard.greeting")}, {data.user.full_name.split(" ")[0]}!
          </h1>
          <p className="text-foreground/60">{data.user.email}</p>
        </header>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{t("dashboard.your_wallets")}</h2>
            <Link href="/wallets">
              <Button variant="ghost" size="sm">{t("dashboard.add_wallet")}</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.wallets.map((wallet: any, index: number) => (
              <WalletCard key={index} {...wallet} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold mb-6">{t("dashboard.quick_actions")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/remittance/new"><Button variant="outline" className="w-full">{t("dashboard.send")}</Button></Link>
            <Button variant="outline" className="w-full">{t("dashboard.receive")}</Button>
            <Button variant="outline" className="w-full">{t("dashboard.exchange")}</Button>
            <Button variant="outline" className="w-full">{t("dashboard.history")}</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
