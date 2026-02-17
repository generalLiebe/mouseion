"use client";

import { useWallets } from "@/lib/hooks/use-wallets";
import { useBalance } from "@/lib/hooks/use-balance";
import { WalletCard } from "@/components/wallets/wallet-card";
import { CreateWalletDialog } from "@/components/wallets/create-wallet-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import * as api from "@/lib/api";
import { toast } from "sonner";

export default function WalletsPage() {
  const { wallets, isLoading, mutate } = useWallets();
  const { mutate: mutateBalance } = useBalance();

  const handleSetActive = async (index: number) => {
    try {
      await api.setActiveWallet(index);
      toast.success("Active wallet changed!");
      mutate();
      mutateBalance();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to switch wallet"
      );
    }
  };

  const handleCreated = () => {
    mutate();
    mutateBalance();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Wallets
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your wallets and key pairs
          </p>
        </div>
        <CreateWalletDialog onCreated={handleCreated} />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : !wallets || wallets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-400">
            No wallets yet. Create your first wallet to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {wallets.map((wallet, index) => (
            <WalletCard
              key={wallet.address}
              wallet={wallet}
              index={index}
              onSetActive={handleSetActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
