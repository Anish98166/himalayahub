"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/i18n";
import { WalletCard } from "@/components/wallet/WalletCard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const DEMO_WALLETS = [
  { address: "NPR-2025-HUB-XXXX-1234", balance: 15250, currency: "NPR", chain: "stellar" },
  { address: "Pi-Wallet-XKCD-9482-ABCD", balance: 42.5, currency: "π", chain: "pi" },
  { address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", balance: 1.2, currency: "SOL", chain: "solana" },
];

const DEMO_TRANSACTIONS = [
  { id: 1, type: "remittance", label: "Received from Dubai", amount: "+ Rs 25,000", time: "2 hours ago", color: "text-himalayan-green" },
  { id: 2, type: "agrichain", label: "Organic Tomatoes — Dhulikhel", amount: "- Rs 850", time: "5 hours ago", color: "text-rhododendron" },
  { id: 3, type: "tourism", label: "Pokhara Hotel Payment", amount: "- Rs 3,500", time: "Yesterday", color: "text-terracotta" },
  { id: 4, type: "remittance", label: "Sent to Kathmandu", amount: "- Rs 10,000", time: "2 days ago", color: "text-rhododendron" },
];

export default function DashboardPage() {
  const { t } = useLanguage();
  const [isDemo, setIsDemo] = React.useState(false);

  React.useEffect(() => {
    setIsDemo(localStorage.getItem("token") === "demo-jwt-token");
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api("/api/dashboard"),
    enabled: !isDemo,
  });

  if (!isDemo && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-terracotta font-medium">{t("dashboard.loading")}</div>
      </div>
    );
  }

  if (!isDemo && (error || !data)) {
    return (
      <div className="min-h-screen p-12 max-w-6xl mx-auto">
        <Card>
          <CardContent>
            <CardTitle className="text-rhododendron">Error Loading Dashboard</CardTitle>
            <p className="text-foreground/60 mt-2">
              Make sure you&apos;re logged in and the backend is running.
            </p>
            <Link href="/auth/login"><Button className="mt-4">Go to Login</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isDemo) {
    return (
      <div className="min-h-screen p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl font-bold font-heading text-foreground">Namaste, Explorer!</h1>
            <p className="text-foreground/60">demo@himalayahub.com</p>
          </header>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t("dashboard.your_wallets")}</h2>
              <Link href="/wallets">
                <Button variant="ghost" size="sm">{t("dashboard.add_wallet")}</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_WALLETS.map((wallet, index) => (
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

          <section className="mt-12">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            <Card>
              <CardContent className="divide-y divide-foreground/5">
                {DEMO_TRANSACTIONS.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">{tx.label}</p>
                      <p className="text-xs text-foreground/40">{tx.time}</p>
                    </div>
                    <span className={`font-mono font-semibold text-sm ${tx.color}`}>{tx.amount}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold font-heading text-foreground">
            {t("dashboard.greeting")}, {data!.user.full_name.split(" ")[0]}!
          </h1>
          <p className="text-foreground/60">{data!.user.email}</p>
        </header>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{t("dashboard.your_wallets")}</h2>
            <Link href="/wallets">
              <Button variant="ghost" size="sm">{t("dashboard.add_wallet")}</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data!.wallets.map((wallet: any, index: number) => (
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
