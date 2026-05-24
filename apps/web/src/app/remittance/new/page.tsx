"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function NewRemittancePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = React.useState({
    receiver_name: "",
    receiver_phone: "",
    amount: "",
    currency: "USD",
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/remittance", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      alert(t("remittance.success"));
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Failed to send remittance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-lg mx-auto">
        <Card className="p-8">
          <CardContent>
            <CardTitle className="text-terracotta mb-6">{t("remittance.title")}</CardTitle>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label={t("remittance.receiver_name")}
                value={formData.receiver_name}
                onChange={(e) => setFormData({ ...formData, receiver_name: e.target.value })}
                required
              />
              <Input
                label={t("remittance.receiver_phone")}
                value={formData.receiver_phone}
                onChange={(e) => setFormData({ ...formData, receiver_phone: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t("remittance.amount")}
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
                <Select
                  label={t("remittance.currency")}
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  options={[
                    { value: "USD", label: t("remittance.usd") },
                    { value: "NPR", label: t("remittance.npr") },
                    { value: "XLM", label: t("remittance.xlm") },
                  ]}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? t("remittance.processing") : t("remittance.send")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
