"use client";

import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { AddressDisplay } from "@/components/shared/address-display";
import { AmountDisplay } from "@/components/shared/amount-display";
import { formatTimestamp, formatRelativeTime } from "@/lib/utils";
import type { ApiTransactionEntry, ApiContact } from "@/lib/types";

interface TransactionCardProps {
  entry: ApiTransactionEntry;
  contacts?: ApiContact[];
  onConfirm?: (txId: string) => void;
  onCancel?: (txId: string) => void;
}

export function TransactionCard({
  entry,
  contacts,
  onConfirm,
  onCancel,
}: TransactionCardProps) {
  const { transaction, direction, counterparty } = entry;
  const isPending = transaction.state === "PENDING";

  // Resolve counterparty to contact name
  const contactName = contacts?.find(
    (c) => c.address.toLowerCase() === counterparty.toLowerCase()
  )?.name;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent>
        <div className="flex items-start gap-4">
          {/* Direction Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            {direction === "sent" ? (
              <ArrowUpRight className="h-5 w-5 text-rose-600" />
            ) : (
              <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium capitalize">
                {direction}
              </span>
              <StatusBadge state={transaction.state} />
              {transaction.memo && (
                <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                  — {transaction.memo}
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                {direction === "sent" ? "To:" : "From:"}
              </span>
              <AddressDisplay
                address={counterparty}
                chars={10}
                label={contactName}
              />
            </div>

            <div className="mt-1 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
              <span>{formatTimestamp(transaction.createdAt)}</span>
              <span>{formatRelativeTime(transaction.createdAt)}</span>
              {isPending && (
                <span>
                  Expires: {formatTimestamp(transaction.expiresAt)}
                </span>
              )}
            </div>
          </div>

          {/* Amount + Actions */}
          <div className="flex flex-col items-end gap-2">
            <AmountDisplay
              amount={transaction.amount}
              size="md"
              showSign={direction === "sent" ? "-" : "+"}
            />

            {isPending && (
              <div className="flex gap-2">
                {direction === "received" && onConfirm && (
                  <Button
                    size="sm"
                    onClick={() => onConfirm(transaction.id)}
                  >
                    Confirm
                  </Button>
                )}
                {direction === "sent" && onCancel && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onCancel(transaction.id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
