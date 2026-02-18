"use client";

import { useState } from "react";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useBalance } from "@/lib/hooks/use-balance";
import { useContacts } from "@/lib/hooks/use-contacts";
import { useEncryption } from "@/lib/hooks/use-encryption";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const { contacts } = useContacts();
  const { encrypted } = useEncryption();

  // Password dialog state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pendingAction, setPendingAction] = useState<{
    type: "confirm" | "cancel";
    txId: string;
  } | null>(null);

  const executeAction = async (
    type: "confirm" | "cancel",
    txId: string,
    pwd?: string
  ) => {
    try {
      if (type === "confirm") {
        await api.confirmTransaction(txId, pwd);
        toast.success("Transaction confirmed!");
      } else {
        await api.cancelTransaction(txId, pwd);
        toast.success("Transaction cancelled!");
      }
      mutate();
      mutateBalance();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `${type} failed`
      );
    }
  };

  const handleConfirm = async (txId: string) => {
    if (encrypted) {
      setPendingAction({ type: "confirm", txId });
      setPasswordDialogOpen(true);
    } else {
      await executeAction("confirm", txId);
    }
  };

  const handleCancel = async (txId: string) => {
    if (encrypted) {
      setPendingAction({ type: "cancel", txId });
      setPasswordDialogOpen(true);
    } else {
      await executeAction("cancel", txId);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!pendingAction) return;

    await executeAction(pendingAction.type, pendingAction.txId, password);
    setPasswordDialogOpen(false);
    setPassword("");
    setPendingAction(null);
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
              contacts={contacts}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {/* Password Dialog for confirm/cancel */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction?.type === "confirm"
                ? "Confirm Transaction"
                : "Cancel Transaction"}
            </DialogTitle>
            <DialogDescription>
              Your wallet is encrypted. Enter your password to proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="tx-password">Password</Label>
            <Input
              id="tx-password"
              type="password"
              placeholder="Enter wallet password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && password) {
                  handlePasswordSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPasswordDialogOpen(false);
                setPassword("");
                setPendingAction(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit} disabled={!password}>
              {pendingAction?.type === "confirm" ? "Confirm" : "Cancel Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
