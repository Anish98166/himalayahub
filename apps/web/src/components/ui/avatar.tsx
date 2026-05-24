import * as React from "react";
import { cn } from "@/lib/utils";

export function Avatar({ className, initials }: { className?: string; initials: string }) {
  return (
    <div
      className={cn(
        "w-10 h-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center font-bold text-sm",
        className
      )}
    >
      {initials}
    </div>
  );
}
