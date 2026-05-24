"use client";

import { useState, useEffect, useCallback } from "react";

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[],
        onSuccess: (user: PiUser) => void,
        onError?: (err: unknown) => void,
      ) => void;
      createPayment: (
        paymentData: PiPaymentData,
        callbacks: PiPaymentCallbacks,
      ) => void;
    };
  }
}

interface PiUser {
  uid: string;
  username: string;
  accessToken: string;
}

interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}

interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (err: unknown, payment?: { paymentId: string }) => void;
}

type PiStatus =
  | "loading"
  | "unavailable"
  | "mock"
  | "ready";

export function usePi(sandbox = true) {
  const [status, setStatus] = useState<PiStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<PiUser | null>(null);

  const isPiBrowser =
    typeof window !== "undefined" &&
    window.parent !== window &&
    document.referrer.includes("minepi.com");

  useEffect(() => {
    if (isPiBrowser && typeof window.Pi !== "undefined") {
      try {
        window.Pi.init({ version: "2.0", sandbox });
        setStatus("ready");
      } catch (e) {
        setError(`Pi SDK init failed: ${e instanceof Error ? e.message : String(e)}`);
        setStatus("unavailable");
      }
      return;
    }

    if (isPiBrowser) {
      const timeout = setTimeout(() => {
        if (typeof window.Pi !== "undefined") {
          try {
            window.Pi.init({ version: "2.0", sandbox });
            setStatus("ready");
            return;
          } catch {
            // fall through
          }
        }
        setError("Pi SDK script not loaded in Pi Browser");
        setStatus("unavailable");
      }, 5000);
      return () => clearTimeout(timeout);
    }

    setStatus("mock");
  }, [sandbox, isPiBrowser]);

  const authenticate = useCallback(() => {
    if (status === "ready" && window.Pi) {
      return new Promise<PiUser>((resolve, reject) => {
        window.Pi!.authenticate(
          ["username", "payments"],
          (piUser: PiUser) => {
            setUser(piUser);
            resolve(piUser);
          },
          (err) => reject(err),
        );
      });
    }

    // Mock authentication for local dev
    if (status === "mock") {
      const mockUser: PiUser = {
        uid: `mock_${Math.random().toString(36).slice(2, 10)}`,
        username: `dev_user_${Math.random().toString(36).slice(2, 6)}`,
        accessToken: `mock_token_${Date.now()}`,
      };
      // Simulate network delay
      return new Promise<PiUser>((resolve) => {
        setTimeout(() => {
          setUser(mockUser);
          resolve(mockUser);
        }, 800);
      });
    }

    return Promise.reject(new Error("Pi SDK not available"));
  }, [status]);

  const createPayment = useCallback((
    paymentData: PiPaymentData,
    callbacks: PiPaymentCallbacks,
  ) => {
    if (status === "ready" && window.Pi) {
      window.Pi.createPayment(paymentData, callbacks);
      return;
    }

    if (status === "mock") {
      const paymentId = `mock_payment_${Date.now()}`;
      callbacks.onReadyForServerApproval(paymentId);
      setTimeout(() => {
        callbacks.onReadyForServerCompletion(paymentId, `mock_tx_${Date.now()}`);
      }, 1500);
      return;
    }

    callbacks.onError(new Error("Pi SDK not available"));
  }, [status]);

  return {
    status,
    error,
    user,
    setUser,
    authenticate,
    createPayment,
    isPiBrowser,
  };
}
