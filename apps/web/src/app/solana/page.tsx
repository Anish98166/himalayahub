"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const DEVNET_RPC = "https://api.devnet.solana.com";

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      publicKey: PublicKey;
      isConnected: boolean;
    };
  }
}

export default function SolanaWalletPage() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [faucetAddress, setFaucetAddress] = useState("");
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connection = new Connection(DEVNET_RPC, "confirmed");

  const getBalance = useCallback(async (pubKey: PublicKey) => {
    try {
      const bal = await connection.getBalance(pubKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch {
      setBalance(0);
    }
  }, [connection]);

  useEffect(() => {
    if (walletAddress) {
      const pubKey = new PublicKey(walletAddress);
      getBalance(pubKey);
      const interval = setInterval(() => getBalance(pubKey), 10000);
      return () => clearInterval(interval);
    }
  }, [walletAddress, getBalance]);

  const connectWallet = async () => {
    if (!window.solana?.isPhantom) {
      setError("Phantom wallet not found. Install it from https://phantom.app");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const resp = await window.solana.connect();
      const address = resp.publicKey.toBase58();
      setWalletAddress(address);
      setFaucetAddress(address);
      await getBalance(resp.publicKey);
    } catch (err: any) {
      setError(err.message || "Failed to connect");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    await window.solana?.disconnect();
    setWalletAddress("");
    setBalance(0);
  };

  const requestAirdrop = async () => {
    if (!faucetAddress) return;
    setFaucetLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/api/solana/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: faucetAddress, amount }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.message);
        // Refresh balance after airdrop
        setTimeout(async () => {
          const pubKey = new PublicKey(faucetAddress);
          await getBalance(pubKey);
        }, 3000);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || "Faucet request failed");
    } finally {
      setFaucetLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-himalayan-green font-heading mb-2">
          Solana Wallet
        </h1>
        <p className="text-foreground/60 mb-8">
          Connect your Phantom wallet and request test SOL from the devnet faucet.
        </p>

        {/* Connect Wallet */}
        <Card className="mb-8">
          <CardContent>
            <CardTitle className="text-himalayan-green mb-4">Wallet Connection</CardTitle>
            {!walletAddress ? (
              <Button onClick={connectWallet} disabled={loading} className="w-full md:w-auto">
                {loading ? "Connecting..." : "Connect Phantom Wallet"}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/50">Connected Address</p>
                    <p className="font-mono text-sm break-all">{walletAddress}</p>
                  </div>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex items-center justify-between border-t border-foreground/5 pt-4">
                  <p className="text-sm text-foreground/50">Balance</p>
                  <p className="text-2xl font-bold text-himalayan-green">
                    {balance.toFixed(4)} <span className="text-sm font-medium">SOL</span>
                  </p>
                </div>
                <Button onClick={disconnectWallet} variant="outline" size="sm">
                  Disconnect
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Faucet */}
        <Card>
          <CardContent>
            <CardTitle className="text-himalayan-green mb-4">Devnet Faucet</CardTitle>
            <p className="text-sm text-foreground/60 mb-4">
              Get free test SOL on Solana devnet. Max 5 SOL per request.
            </p>
            <div className="space-y-4">
              <Input
                label="Wallet Address"
                value={faucetAddress}
                onChange={(e) => setFaucetAddress(e.target.value)}
                placeholder="Enter Solana address..."
              />
              <div className="grid grid-cols-3 gap-2">
                {[0.5, 1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setAmount(n)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      amount === n
                        ? "bg-himalayan-green text-white"
                        : "bg-white/50 text-foreground/60 border border-foreground/10 hover:bg-himalayan-green/10"
                    }`}
                  >
                    {n} SOL
                  </button>
                ))}
              </div>
              <Button
                onClick={requestAirdrop}
                disabled={faucetLoading || !faucetAddress}
                className="w-full"
                style={{ backgroundColor: "#81B29A" }}
              >
                {faucetLoading ? "Requesting..." : `Request ${amount} SOL Airdrop`}
              </Button>
            </div>

            {result && (
              <div className="mt-4 p-4 bg-himalayan-green/10 rounded-xl border border-himalayan-green/20">
                <p className="text-sm text-himalayan-green font-medium">{result}</p>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-rhododendron/10 rounded-xl border border-rhododendron/20">
                <p className="text-sm text-rhododendron font-medium">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-8 p-4 bg-white/40 rounded-xl text-xs text-foreground/50">
          <p>Make sure you have the Phantom wallet extension installed.</p>
          <p>This faucet uses Solana Devnet — tokens have no real value.</p>
        </div>
      </div>
    </div>
  );
}
