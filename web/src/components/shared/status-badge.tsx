"use client";

import { Badge } from "@/components/ui/badge";
import type { TransactionStateType } from "@/lib/types";

const VARIANT_MAP: Record<TransactionStateType, "pending" | "finalized" | "cancelled" | "frozen" | "recovered"> = {
  PENDING: "pending",
  FINALIZED: "finalized",
  CANCELLED: "cancelled",
  FROZEN: "frozen",
  RECOVERED: "recovered",
};

const LABEL_MAP: Record<TransactionStateType, string> = {
  PENDING: "Pending",
  FINALIZED: "Finalized",
  CANCELLED: "Cancelled",
  FROZEN: "Frozen",
  RECOVERED: "Recovered",
};

export function StatusBadge({ state }: { state: TransactionStateType }) {
  return (
    <Badge variant={VARIANT_MAP[state]}>
      {LABEL_MAP[state]}
    </Badge>
  );
}
