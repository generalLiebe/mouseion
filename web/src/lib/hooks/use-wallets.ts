"use client";

import useSWR from "swr";
import type { ApiWallet } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useWallets() {
  const { data, error, isLoading, mutate } = useSWR<ApiWallet[]>(
    "/api/wallets",
    fetcher
  );

  return { wallets: data, error, isLoading, mutate };
}
