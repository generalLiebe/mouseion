"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { ChevronDown, Check } from "lucide-react";
import { useWallets } from "@/lib/hooks/use-wallets";
import { formatAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";
import * as api from "@/lib/api";

export function WalletSelector() {
  const { wallets, mutate } = useWallets();
  const { mutate: globalMutate } = useSWRConfig();
  const [open, setOpen] = useState(false);

  const activeWallet = wallets?.find((w) => w.isActive);

  const handleSwitch = async (index: number) => {
    try {
      await api.setActiveWallet(index);
      // Revalidate all SWR caches so balance/transactions update immediately
      globalMutate(() => true, undefined, { revalidate: true });
      setOpen(false);
    } catch (error) {
      console.error("Failed to switch wallet:", error);
    }
  };

  if (!wallets || wallets.length === 0) {
    return (
      <span className="text-sm text-slate-400 dark:text-slate-500">
        No wallets
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {activeWallet?.name || "Unnamed"}
        </span>
        <code className="font-mono text-xs text-slate-400 dark:text-slate-500">
          {activeWallet ? formatAddress(activeWallet.address, 6) : ""}
        </code>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {wallets.map((wallet, index) => (
              <button
                key={wallet.address}
                onClick={() => handleSwitch(index)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
                  wallet.isActive && "bg-amber-50 dark:bg-amber-900/20"
                )}
              >
                <div className="flex-1 text-left">
                  <div className="font-medium text-slate-800 dark:text-slate-100">
                    {wallet.name || "Unnamed"}
                  </div>
                  <code className="font-mono text-xs text-slate-400 dark:text-slate-500">
                    {formatAddress(wallet.address, 8)}
                  </code>
                </div>
                {wallet.isActive && (
                  <Check className="h-4 w-4 text-amber-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
