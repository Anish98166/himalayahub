"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePi } from "@/hooks/usePi";

export default function PiWalletPage() {
  const [sandbox, setSandbox] = useState(true);

  const {
    status,
    error: piError,
    user,
    setUser,
    authenticate: piAuthenticate,
    createPayment: piCreatePayment,
    isPiBrowser,
  } = usePi(sandbox);
  const [payAmount, setPayAmount] = useState("");
  const [payMemo, setPayMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ready = status === "ready" || status === "mock";

  useEffect(() => {
    setSandbox(!isPiBrowser);
  }, [isPiBrowser]);

  const authenticate = useCallback(async () => {
    setAuthLoading(true);
    setError(null);
    try {
      const piUser = await piAuthenticate();
      setUser(piUser);
      setResult(`Authenticated as @${piUser.username}`);
    } catch (err: unknown) {
      setError(`Auth failed: ${err && typeof err === "object" ? JSON.stringify(err) : String(err)}`);
    }
    setAuthLoading(false);
  }, [piAuthenticate, setUser]);

  const createPayment = useCallback(() => {
    if (!user) {
      setError("Authenticate first");
      return;
    }
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    piCreatePayment(
      {
        amount,
        memo: payMemo || "Payment via HimalayaHub",
        metadata: { userId: user.uid },
      },
      {
        onReadyForServerApproval: async (paymentId: string) => {
          setResult(`Server approving payment ${paymentId}...`);
          try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/pi/approve`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ payment_id: paymentId }),
            });
            const data = await res.json();
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
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/pi/complete`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ payment_id: paymentId, txid }),
            });
            const data = await res.json();
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
          setError(`Payment ${paymentId} cancelled by user`);
          setLoading(false);
        },
        onError: (err, payment) => {
          setError(`Payment error: ${err && typeof err === "object" ? JSON.stringify(err) : String(err)}`);
          setLoading(false);
        },
      },
    );
  }, [user, payAmount, payMemo, piCreatePayment]);

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-saffron font-heading mb-2">
          Pi Wallet
        </h1>
        <p className="text-foreground/60 mb-8">
          Send and receive Pi coins. Works in Pi Browser or sandbox mode.
        </p>

        {/* Ready Status */}
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
                {status === "mock" && (
                  <p className="text-xs text-foreground/40 mt-1">
                    Running outside Pi Browser — using mock wallet
                  </p>
                )}
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
                  Toggle on for testing in regular browser. Disable for Pi Browser.
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

        {/* Send Pi */}
        <Card className="mb-8">
          <CardContent>
            <CardTitle className="text-terracotta mb-4">Send Pi Payment</CardTitle>
            <div className="space-y-4">
              <Input
                label="Amount (π)"
                type="number"
                step="0.01"
                min="0"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0.00"
              />
              <Input
                label="Memo"
                value={payMemo}
                onChange={(e) => setPayMemo(e.target.value)}
                placeholder="What's this for?"
              />
              <Button
                onClick={createPayment}
                disabled={loading || !user || !ready}
                className="w-full"
                style={{ backgroundColor: "#F2C94C", color: "#2F2F2F" }}
              >
                {loading ? "Processing..." : `Pay ${payAmount || "0"} π`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Receive */}
        <Card>
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
          <p>For production, deploy in Pi Browser and disable sandbox.</p>
          {status === "mock" && (
            <p className="text-saffron font-medium mt-2">
              Mock mode active — authenticate & payments are simulated.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
