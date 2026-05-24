"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AgriProduct } from "@himalayahub/types";

const MOCK_PRODUCTS: AgriProduct[] = [
  {
    id: "1", farmerId: "f1", farmerName: "Ram Bahadur",
    name: "Organic Dailekh Rice", category: "Grains", quantity: 100, unit: "kg",
    price: 120, currency: "NPR", location: "Dailekh", description: "Premium organic rice from the hills of Dailekh.",
    isOrganic: true, createdAt: new Date().toISOString(),
  },
  {
    id: "2", farmerId: "f2", farmerName: "Sita Devi",
    name: "Fresh Ilam Tea", category: "Beverages", quantity: 50, unit: "kg",
    price: 800, currency: "NPR", location: "Ilam", description: "Handpicked orthodox tea from Ilam's famous gardens.",
    isOrganic: true, createdAt: new Date().toISOString(),
  },
  {
    id: "3", farmerId: "f3", farmerName: "Krishna Thapa",
    name: "Mustang Apples", category: "Fruits", quantity: 200, unit: "kg",
    price: 250, currency: "NPR", location: "Mustang", description: "Crisp, sweet apples grown in the trans-Himalayan region.",
    isOrganic: false, createdAt: new Date().toISOString(),
  },
  {
    id: "4", farmerId: "f4", farmerName: "Durga Maya",
    name: "Chitwan Honey", category: "Other", quantity: 30, unit: "liter",
    price: 1500, currency: "NPR", location: "Chitwan", description: "Pure wildflower honey from Chitwan National Park buffer zone.",
    isOrganic: true, createdAt: new Date().toISOString(),
  },
];

export default function AgriChainPage() {
  const { t } = useLanguage();
  const [search, setSearch] = React.useState("");

  const filtered = MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-himalayan-green font-heading">
              {t("agrichain.title")}
            </h1>
            <p className="text-foreground/60 mt-1">{t("agrichain.subtitle")}</p>
          </div>
          <Button style={{ backgroundColor: "#81B29A" }}>{t("agrichain.add_product")}</Button>
        </div>

        <Input
          placeholder={t("agrichain.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-8"
        />

        {filtered.length === 0 ? (
          <p className="text-foreground/50 text-center py-12">{t("agrichain.no_products")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <Card key={product.id} className="border-himalayan-green/10">
                <CardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-himalayan-green/10 flex items-center justify-center text-himalayan-green font-bold text-lg">
                      {product.name.charAt(0)}
                    </div>
                    {product.isOrganic && <Badge variant="success">{t("agrichain.organic")}</Badge>}
                  </div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="mt-1">{product.description}</CardDescription>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/50">{t("agrichain.farmer")}: {product.farmerName}</p>
                      <p className="text-sm text-foreground/50">{t("agrichain.location")}: {product.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-himalayan-green">
                        {product.price} <span className="text-sm font-medium text-foreground/50">{product.currency}</span>
                      </p>
                      <p className="text-xs text-foreground/40">/{product.unit}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4" style={{ backgroundColor: "#81B29A" }}>
                    {t("agrichain.buy")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
