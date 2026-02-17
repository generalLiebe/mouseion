"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { formatAddress, copyToClipboard } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AddressDisplayProps {
  address: string;
  chars?: number;
  className?: string;
  showCopy?: boolean;
}

export function AddressDisplay({
  address,
  chars = 8,
  className,
  showCopy = true,
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(address);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <code className="font-mono text-sm">{formatAddress(address, chars)}</code>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
          aria-label="Copy address"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </span>
  );
}
