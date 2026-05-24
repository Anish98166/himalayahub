import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: "default" | "success" | "warning" | "danger";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-terracotta/10 text-terracotta": variant === "default",
          "bg-himalayan-green/10 text-himalayan-green": variant === "success",
          "bg-saffron/20 text-yellow-800": variant === "warning",
          "bg-rhododendron/10 text-rhododendron": variant === "danger",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
