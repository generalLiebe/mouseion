"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddressDisplay } from "@/components/shared/address-display";
import { AmountDisplay } from "@/components/shared/amount-display";
import { formatTimestamp } from "@/lib/utils";
import type { ApiWallet } from "@/lib/types";

interface WalletCardProps {
  wallet: ApiWallet & { balance?: { available: string; total: string } };
  index: number;
  onSetActive: (index: number) => void;
}

export function WalletCard({ wallet, index, onSetActive }: WalletCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-semibold">
                {wallet.name || "Unnamed Wallet"}
              </h3>
              {wallet.isActive && (
                <Badge variant="default">Active</Badge>
              )}
            </div>
            <AddressDisplay
              address={wallet.address}
              chars={12}
              className="mt-1"
            />
          </div>
          {!wallet.isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetActive(index)}
            >
              Set Active
            </Button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          {wallet.balance && (
            <>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Available
                </p>
                <AmountDisplay amount={wallet.balance.available} size="md" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total
                </p>
                <AmountDisplay amount={wallet.balance.total} size="md" />
              </div>
            </>
          )}
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Created
            </p>
            <p className="text-sm">{formatTimestamp(wallet.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
