"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MOCK_SERVICES = [
  {
    id: "h1", type: "hotel", name: "Hotel Yak & Yeti",
    location: "Kathmandu", price: 120, currency: "USD",
    desc: "Heritage hotel in the heart of Kathmandu with stunning mountain views.",
  },
  {
    id: "h2", type: "hotel", name: "Tiger Mountain Pokhara Lodge",
    location: "Pokhara", price: 200, currency: "USD",
    desc: "Luxury eco-lodge overlooking the Annapurna range.",
  },
  {
    id: "g1", type: "guide", name: "Experienced Trek Guide - Pemba Sherpa",
    location: "Khumbu Region", price: 35, currency: "USD",
    desc: "Certified trekking guide with 15+ years of Everest region experience.",
  },
  {
    id: "t1", type: "trek", name: "Everest Base Camp Trek",
    location: "Khumbu", price: 1500, currency: "USD",
    desc: "14-day guided trek to Everest Base Camp with all accommodation included.",
  },
  {
    id: "tp1", type: "transport", name: "Kathmandu to Pokhara Private Jeep",
    location: "Kathmandu", price: 80, currency: "USD",
    desc: "Comfortable private jeep transfer with scenic stops along the way.",
  },
  {
    id: "tp2", type: "transport", name: "Mountain Flight - Kathmandu to Lukla",
    location: "Kathmandu", price: 180, currency: "USD",
    desc: "Scenic 30-minute flight to the gateway of the Everest region.",
  },
];

export default function TourismPayPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = React.useState<string>("all");

  const filtered = activeTab === "all"
    ? MOCK_SERVICES
    : MOCK_SERVICES.filter((s) => s.type === activeTab);

  const tabs = [
    { id: "all", label: "All" },
    { id: "hotel", label: t("tourism.hotels") },
    { id: "guide", label: t("tourism.guides") },
    { id: "trek", label: t("tourism.treks") },
    { id: "transport", label: t("tourism.transport") },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-rhododendron font-heading">
            {t("tourism.title")}
          </h1>
          <p className="text-foreground/60 mt-1">{t("tourism.subtitle")}</p>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-rhododendron text-white"
                  : "bg-white/50 text-foreground/60 hover:bg-rhododendron/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service) => (
            <Card key={service.id} className="border-rhododendron/10">
              <CardContent>
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={service.type === "hotel" ? "success" : service.type === "guide" ? "warning" : "default"}>
                    {service.type}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <CardDescription className="mt-1">{service.desc}</CardDescription>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-foreground/50">{service.location}</p>
                  <p className="text-xl font-bold text-rhododendron">
                    ${service.price}
                  </p>
                </div>
                <Button className="w-full mt-4" style={{ backgroundColor: "#E63946" }}>
                  {t("tourism.book_now")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
