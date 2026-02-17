"use client";

import { useState } from "react";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useBalance } from "@/lib/hooks/use-balance";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { Skeleton } from "@/components/ui/skeleton";
import * as api from "@/lib/api";
import { toast } from "sonner";

export default function TransactionsPage() {
  const [status, setStatus] = useState("");
  const [direction, setDirection] = useState("");
  const { transactions, isLoading, mutate } = useTransactions({
    status: status || undefined,
    direction: direction || undefined,
  });
  const { mutate: mutateBalance } = useBalance();

  const handleConfirm = async (txId: string) => {
    try {
      await api.confirmTransaction(txId);
      toast.success("Transaction confirmed!");
      mutate();
      mutateBalance();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Confirmation failed"
      );
    }
  };

  const handleCancel = async (txId: string) => {
    try {
      await api.cancelTransaction(txId);
      toast.success("Transaction cancelled!");
      mutate();
      mutateBalance();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Cancellation failed"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Transactions
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          View and manage your transaction history
        </p>
      </div>

      <TransactionFilters
        status={status}
        direction={direction}
        onStatusChange={setStatus}
        onDirectionChange={setDirection}
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : !transactions || transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-400">
            {status || direction
              ? "No transactions match the current filters"
              : "No transactions yet. Send some tokens to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((entry) => (
            <TransactionCard
              key={entry.transaction.id}
              entry={entry}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
