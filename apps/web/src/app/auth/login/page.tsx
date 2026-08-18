"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePi } from "@/hooks/usePi";

const API_BASE = "http://localhost:3000";

export default function LoginPage() {
  const router = useRouter();
  const { status: piStatus, authenticate: piAuthenticate } = usePi();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [piLoading, setPiLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (email === "demo@himalayahub.com" && password === "demo1234") {
      localStorage.setItem("token", "demo-jwt-token");
      router.push("/dashboard");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Invalid email or password");
      const data = await res.json();
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePiLogin = async () => {
    setPiLoading(true);
    setError("");
    try {
      const piUser = await piAuthenticate();
      const res = await fetch(`${API_BASE}/api/auth/pi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: piUser.accessToken }),
      });
      if (!res.ok) throw new Error("Pi authentication failed on server");
      const data = await res.json();
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Pi login failed");
    } finally {
      setPiLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <CardContent>
          <CardTitle className="text-terracotta text-center mb-6">Welcome Back</CardTitle>

          {piStatus !== "unavailable" && (
            <Button
              type="button"
              variant="outline"
              className="w-full mb-4 border-saffron/40 text-saffron hover:bg-saffron/10"
              onClick={handlePiLogin}
              disabled={piLoading || loading}
            >
              {piLoading ? "Signing in with Pi..." : "Sign in with Pi Network"}
            </Button>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-foreground/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-foreground/40">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-rhododendron font-medium">{error}</p>}
            <Button type="submit" disabled={loading || piLoading} className="w-full">
              {loading ? "Processing..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 p-3 rounded-lg bg-saffron/10 border border-saffron/30">
            <p className="text-xs text-saffron font-medium text-center">Demo Login</p>
            <p className="text-xs text-foreground/50 text-center mt-1">demo@himalayahub.com / demo1234</p>
          </div>
          <p className="text-center text-sm text-foreground/50 mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-terracotta hover:underline">Create Account</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
