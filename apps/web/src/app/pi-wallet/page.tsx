"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePi } from "@/hooks/usePi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Product {
  id: string;
  name: string;
  defaultAmount: number;
  memoTemplate: string;
  metadata: Record<string, unknown>;
}

const PRODUCTS: Product[] = [
  {
    id: "tip",
    name: "Tip HimalayaHub",
    defaultAmount: 1,
    memoTemplate: "Thank you for supporting HimalayaHub",
    metadata: { product: "tip" },
  },
  {
    id: "remittance-fee",
    name: "Remittance Transfer Fee",
    defaultAmount: 0.5,
    memoTemplate: "Remittance fee for sending Rs {amount}",
    metadata: { product: "remittance-fee" },
  },
  {
    id: "agrichain-listing",
    name: "Featured Product Listing",
    defaultAmount: 1,
    memoTemplate: "Feature your product on AgriChain marketplace",
    metadata: { product: "agrichain-listing" },
  },
  {
    id: "tourism-credits",
    name: "Tourism Pay Credits",
    defaultAmount: 5,
    memoTemplate: "Credits for hotels, guides & attractions",
    metadata: { product: "tourism-credits" },
  },
];

async function apiPost(path: string, body: unknown) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export default function PiWalletPage() {
  const [sandbox, setSandbox] = useState(!isPiBrowser);
  const {
    status,
    error: piError,
    user,
    setUser,
    authenticate: piAuthenticate,
    createPayment: piCreatePayment,
    isPiBrowser,
  } = usePi(sandbox);

  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ready = status === "ready" || status === "mock";

  const authenticate = useCallback(async () => {
    setAuthLoading(true);
    setError(null);
    try {
      const piUser = await piAuthenticate(["username", "payments"]);
      setUser(piUser);
      setResult(`Authenticated as @${piUser.username}`);
    } catch (err: unknown) {
      setError(`Auth failed: ${err && typeof err === "object" ? JSON.stringify(err) : String(err)}`);
    }
    setAuthLoading(false);
  }, [piAuthenticate, setUser]);

  const handleIncompletePayment = useCallback(async (payment: { paymentId: string }) => {
    try {
      const data = await apiPost("/api/pi/recover", { payment_id: payment.paymentId });
      if (data.success) {
        setResult(`Recovered incomplete payment: ${payment.paymentId}`);
      } else {
        setError(`Recovery failed: ${data.message}`);
      }
    } catch (err: unknown) {
      setError(`Recovery error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  const createPayment = useCallback(() => {
    if (!user) {
      setError("Authenticate first");
      return;
    }
    const amount = parseFloat(customAmount) || selectedProduct.defaultAmount;
    if (isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const memo = selectedProduct.memoTemplate.replace("{amount}", String(amount));
    const metadata = { ...selectedProduct.metadata, userId: user.uid, amount };

    piCreatePayment(
      { amount, memo, metadata },
      {
        onIncompletePaymentFound: handleIncompletePayment,
        onReadyForServerApproval: async (paymentId: string) => {
          setResult(`Server approving payment ${paymentId}...`);
          try {
            const data = await apiPost("/api/pi/approve", { payment_id: paymentId });
            if (!data.success) {
              setError(`Approval failed: ${data.message}`);
            }
          } catch (err: unknown) {
            setError(`Approval error: ${err instanceof Error ? err.message : String(err)}`);
          }
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          setResult(`Completing payment ${paymentId}...`);
          try {
            const data = await apiPost("/api/pi/complete", { payment_id: paymentId, txid });
            if (data.success) {
              setResult(`Payment successful! TX: ${txid}`);
            } else {
              setError(`Completion failed: ${data.message}`);
            }
          } catch (err: unknown) {
            setError(`Completion error: ${err instanceof Error ? err.message : String(err)}`);
          }
          setLoading(false);
        },
        onCancel: (paymentId: string) => {
          setError(`Payment ${paymentId} cancelled`);
          setLoading(false);
        },
        onError: (err) => {
          setError(`Payment error: ${err && typeof err === "object" ? JSON.stringify(err) : String(err)}`);
          setLoading(false);
        },
      },
    );
  }, [user, customAmount, selectedProduct, piCreatePayment, handleIncompletePayment]);

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-saffron font-heading mb-2">
          Pi Payments
        </h1>
        <p className="text-foreground/60 mb-8">
          Pay with Pi coins for HimalayaHub services.
        </p>

        {/* SDK Status */}
        <Card className="mb-8">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-terracotta mb-1">SDK Status</CardTitle>
                <p className="text-sm text-foreground/50">
                  {status === "mock" ? "Mock mode (local development)" :
                   status === "ready" ? "Pi SDK initialized and ready" :
                   status === "unavailable" ? "Pi SDK unavailable" :
                   "Initializing Pi SDK..."}
                </p>
              </div>
              <Badge variant={ready ? "success" : "warning"}>
                {status === "ready" ? "Live" :
                 status === "mock" ? "Mock" :
                 status === "unavailable" ? "Error" :
                 "Loading"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Sandbox Toggle */}
        <Card className="mb-8">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-terracotta mb-1">Sandbox Mode</CardTitle>
                <p className="text-sm text-foreground/50">
                  Toggle on for testing in regular browser.
                </p>
              </div>
              <button
                onClick={() => setSandbox(!sandbox)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  sandbox ? "bg-saffron" : "bg-foreground/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    sandbox ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Auth */}
        <Card className="mb-8">
          <CardContent>
            <CardTitle className="text-terracotta mb-4">Connect Pi</CardTitle>
            {!user ? (
              <Button
                onClick={authenticate}
                disabled={authLoading || !ready}
                className="w-full md:w-auto"
                style={{ backgroundColor: "#F2C94C", color: "#2F2F2F" }}
              >
                {authLoading ? "Connecting..." : "Sign in with Pi"}
              </Button>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/50">Connected as</p>
                  <p className="text-lg font-semibold">@{user.username}</p>
                  <p className="text-xs text-foreground/40 font-mono">UID: {user.uid}</p>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Selector */}
        <Card className="mb-8">
          <CardContent>
            <CardTitle className="text-terracotta mb-4">Choose a Product</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRODUCTS.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setCustomAmount(String(product.defaultAmount));
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedProduct.id === product.id
                      ? "border-saffron bg-saffron/10"
                      : "border-foreground/10 hover:border-foreground/20 bg-white/40"
                  }`}
                >
                  <p className="font-semibold text-sm">{product.name}</p>
                  <p className="text-xs text-foreground/50 mt-1">
                    {product.defaultAmount} π
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="mb-8">
          <CardContent>
            <CardTitle className="text-terracotta mb-4">
              Pay — {selectedProduct.name}
            </CardTitle>
            <div className="space-y-4">
              <Input
                label="Amount (π)"
                type="number"
                step="0.01"
                min="0"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-foreground/40">
                Memo: {selectedProduct.memoTemplate.replace("{amount}", customAmount || String(selectedProduct.defaultAmount))}
              </p>
              <Button
                onClick={createPayment}
                disabled={loading || !user || !ready}
                className="w-full"
                style={{ backgroundColor: "#F2C94C", color: "#2F2F2F" }}
              >
                {loading ? "Processing..." : `Pay ${customAmount || selectedProduct.defaultAmount} π`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Receive */}
        <Card className="mb-8">
          <CardContent>
            <CardTitle className="text-terracotta mb-4">Receive Pi</CardTitle>
            <p className="text-sm text-foreground/60 mb-4">
              Share your Pi username or UID to receive payments:
            </p>
            {user ? (
              <div className="space-y-3">
                <div className="p-4 bg-white/50 rounded-xl border border-foreground/10">
                  <p className="text-xs text-foreground/40 mb-1">Username</p>
                  <p className="font-mono text-lg select-all">@{user.username}</p>
                </div>
                <div className="p-4 bg-white/50 rounded-xl border border-foreground/10">
                  <p className="text-xs text-foreground/40 mb-1">UID</p>
                  <p className="font-mono text-sm select-all break-all">{user.uid}</p>
                </div>
              </div>
            ) : (
              <p className="text-foreground/40 italic">Connect your Pi account first.</p>
            )}
          </CardContent>
        </Card>

        {/* Result / Error */}
        {result && (
          <div className="mt-6 p-4 bg-saffron/10 rounded-xl border border-saffron/20">
            <p className="text-sm text-saffron font-medium">{result}</p>
          </div>
        )}
        {error && (
          <div className="mt-6 p-4 bg-rhododendron/10 rounded-xl border border-rhododendron/20">
            <p className="text-sm text-rhododendron font-medium">{error}</p>
          </div>
        )}
        {piError && (
          <div className="mt-6 p-4 bg-rhododendron/10 rounded-xl border border-rhododendron/20">
            <p className="text-sm text-rhododendron font-medium">{piError}</p>
          </div>
        )}

        <div className="mt-8 p-4 bg-white/40 rounded-xl text-xs text-foreground/50 space-y-1">
          <p>Sandbox mode uses test Pi — no real value.</p>
          <p>For production, set <code className="text-terracotta">PI_NETWORK_API_KEY</code> env var and deploy in Pi Browser.</p>
          {status === "mock" && (
            <p className="text-saffron font-medium mt-2">
              Mock mode active — payments are simulated.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
