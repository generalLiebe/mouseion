"use client";

import useSWR from "swr";
import type { ApiStatus } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useStatus() {
  const { data, error, isLoading, mutate } = useSWR<ApiStatus>(
    "/api/status",
    fetcher,
    { refreshInterval: 30000 }
  );

  return { status: data, error, isLoading, mutate };
}
