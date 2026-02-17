"use client";

import { BalanceCard } from "@/components/dashboard/balance-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mouseion Reversible Transaction Blockchain
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BalanceCard />
        <QuickActions />
      </div>

      <RecentTransactions />
    </div>
  );
}
