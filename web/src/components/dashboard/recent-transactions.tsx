"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { AddressDisplay } from "@/components/shared/address-display";
import { AmountDisplay } from "@/components/shared/amount-display";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function RecentTransactions() {
  const { transactions, isLoading } = useTransactions({ limit: 5 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {!transactions || transactions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((entry) => (
              <div
                key={entry.transaction.id}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  {entry.direction === "sent" ? (
                    <ArrowUpRight className="h-4 w-4 text-rose-600" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">
                      {entry.direction}
                    </span>
                    <StatusBadge state={entry.transaction.state} />
                  </div>
                  <AddressDisplay
                    address={entry.counterparty}
                    chars={6}
                    showCopy={false}
                    className="text-slate-400 dark:text-slate-500"
                  />
                </div>
                <div className="text-right">
                  <AmountDisplay
                    amount={entry.transaction.amount}
                    size="sm"
                    showSign={entry.direction === "sent" ? "-" : "+"}
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {formatRelativeTime(entry.transaction.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {transactions && transactions.length > 0 && (
        <CardFooter>
          <Link href="/transactions" className="w-full">
            <Button variant="ghost" className="w-full">
              View all transactions
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
