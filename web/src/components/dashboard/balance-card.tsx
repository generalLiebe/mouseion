"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AmountDisplay } from "@/components/shared/amount-display";
import { useBalance } from "@/lib/hooks/use-balance";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export function BalanceCard() {
  const { balance, isLoading } = useBalance();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-48" />
          <div className="mt-4 flex gap-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 dark:text-slate-400">
            Create a wallet to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <AmountDisplay amount={balance.available} size="xl" />
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Available
        </p>

        <div className="mt-4 flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Incoming:
            </span>
            <AmountDisplay
              amount={balance.pendingIncoming}
              size="sm"
              showSign="+"
            />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-rose-600" />
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Outgoing:
            </span>
            <AmountDisplay
              amount={balance.pendingOutgoing}
              size="sm"
              showSign="-"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
