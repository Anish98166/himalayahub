import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface WalletCardProps {
  address: string;
  balance: number;
  currency: string;
  chain: string;
}

export const WalletCard = ({ address, balance, currency, chain }: WalletCardProps) => {
  const isStellar = chain === "stellar";

  return (
    <Card className="p-6">
      <CardContent>
        <div className="flex justify-between items-start mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isStellar ? "bg-terracotta/10 text-terracotta" : "bg-himalayan-green/10 text-himalayan-green"
            }`}
          >
            {isStellar ? "✨" : "◎"}
          </div>
          <span className="text-xs font-mono text-foreground/40 uppercase tracking-wider">
            {chain}
          </span>
        </div>
        <p className="text-sm text-foreground/60">Balance</p>
        <h3 className="text-2xl font-bold">
          {balance.toLocaleString()}{" "}
          <span className="text-lg font-medium text-foreground/50">{currency}</span>
        </h3>
        <p className="mt-6 pt-4 border-t border-foreground/5 text-[10px] text-foreground/40 truncate font-mono">
          {address}
        </p>
      </CardContent>
    </Card>
  );
};
