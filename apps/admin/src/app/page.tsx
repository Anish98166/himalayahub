"use client";

import React, { useState } from "react";

interface UserRow {
  id: string;
  email: string;
  fullName: string;
  role: string;
  kycStatus: string;
}

interface RemittanceRow {
  id: string;
  receiverName: string;
  amount: string;
  currency: string;
  status: string;
}

const MOCK_USERS: UserRow[] = [
  { id: "1", email: "arjun@example.com", fullName: "Arjun Thapa", role: "USER", kycStatus: "VERIFIED" },
  { id: "2", email: "sita@example.com", fullName: "Sita Devi", role: "MERCHANT", kycStatus: "PENDING" },
  { id: "3", email: "ram@example.com", fullName: "Ram Bahadur", role: "USER", kycStatus: "UNVERIFIED" },
];

const MOCK_REMITTANCES: RemittanceRow[] = [
  { id: "1", receiverName: "Gita Sharma", amount: "500.00", currency: "USD", status: "COMPLETED" },
  { id: "2", receiverName: "Hari Gurung", amount: "250.00", currency: "USD", status: "PENDING" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<"users" | "remittances">("users");

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-terracotta">HimalayaHub Admin</h1>
          <p className="text-foreground/60">System management dashboard</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab("users")}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              tab === "users" ? "bg-terracotta text-white" : "bg-white/50 text-foreground/60"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setTab("remittances")}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              tab === "remittances" ? "bg-terracotta text-white" : "bg-white/50 text-foreground/60"
            }`}
          >
            Remittances
          </button>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-terracotta/10 overflow-hidden">
          {tab === "users" ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-terracotta/10 text-sm text-foreground/50">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">KYC</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map((u) => (
                  <tr key={u.id} className="border-b border-terracotta/5 hover:bg-terracotta/5">
                    <td className="p-4 font-medium">{u.fullName}</td>
                    <td className="p-4 text-foreground/70">{u.email}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-terracotta/10 text-terracotta">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.kycStatus === "VERIFIED" ? "bg-himalayan-green/10 text-himalayan-green" :
                        u.kycStatus === "PENDING" ? "bg-saffron/20 text-yellow-800" :
                        "bg-foreground/10 text-foreground/50"
                      }`}>
                        {u.kycStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-terracotta/10 text-sm text-foreground/50">
                  <th className="p-4 font-medium">Receiver</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Currency</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_REMITTANCES.map((r) => (
                  <tr key={r.id} className="border-b border-terracotta/5 hover:bg-terracotta/5">
                    <td className="p-4 font-medium">{r.receiverName}</td>
                    <td className="p-4">{r.amount}</td>
                    <td className="p-4">{r.currency}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.status === "COMPLETED" ? "bg-himalayan-green/10 text-himalayan-green" : "bg-saffron/20 text-yellow-800"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white/60 rounded-2xl border border-terracotta/10">
            <p className="text-sm text-foreground/50">Total Users</p>
            <p className="text-3xl font-bold text-terracotta mt-1">1,247</p>
          </div>
          <div className="p-6 bg-white/60 rounded-2xl border border-himalayan-green/10">
            <p className="text-sm text-foreground/50">Total Remittances</p>
            <p className="text-3xl font-bold text-himalayan-green mt-1">$847K</p>
          </div>
          <div className="p-6 bg-white/60 rounded-2xl border border-rhododendron/10">
            <p className="text-sm text-foreground/50">Active Wallets</p>
            <p className="text-3xl font-bold text-rhododendron mt-1">892</p>
          </div>
        </div>
      </div>
    </div>
  );
}
