"use client";

import useSWR from "swr";
import type { ApiTransactionEntry } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTransactions(params?: {
  status?: string;
  direction?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.direction) searchParams.set("direction", params.direction);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();

  const { data, error, isLoading, mutate } = useSWR<ApiTransactionEntry[]>(
    `/api/transactions${query ? `?${query}` : ""}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  return { transactions: data, error, isLoading, mutate };
}
