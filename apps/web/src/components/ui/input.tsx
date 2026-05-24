import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground/70 mb-1">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-2 rounded-xl border outline-none transition-all",
            "focus:ring-2 focus:ring-terracotta",
            error ? "border-rhododendron" : "border-foreground/10",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rhododendron mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
