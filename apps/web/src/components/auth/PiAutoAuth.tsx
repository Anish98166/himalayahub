"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePi } from "@/hooks/usePi";

const API_BASE = "http://localhost:3000";

export function PiAutoAuth() {
  const router = useRouter();
  const { status: piStatus, authenticate: piAuthenticate } = usePi();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    if (piStatus !== "ready") return;
    if (typeof window === "undefined") return;

    const existing = localStorage.getItem("token");
    if (existing) return;

    attempted.current = true;

    (async () => {
      try {
        const piUser = await piAuthenticate();
        const res = await fetch(`${API_BASE}/api/auth/pi`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: piUser.accessToken }),
        });
        if (!res.ok) return;
        const data = await res.json();
        localStorage.setItem("token", data.token);
        router.refresh();
      } catch {
        // Pi auth not possible or user declined — stay on current page
      }
    })();
  }, [piStatus, piAuthenticate, router]);

  return null;
}
