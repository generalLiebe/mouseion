"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useEncryption() {
  const { data, error, isLoading } = useSWR<{ encrypted: boolean }>(
    "/api/status/encryption",
    fetcher
  );

  return {
    encrypted: data?.encrypted ?? false,
    error,
    isLoading,
  };
}
