"use client";

import useSWR from "swr";
import type { ApiBalance } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useBalance() {
  const { data, error, isLoading, mutate } = useSWR<ApiBalance>(
    "/api/balance",
    fetcher,
    { refreshInterval: 30000 }
  );

  return { balance: data, error, isLoading, mutate };
}
