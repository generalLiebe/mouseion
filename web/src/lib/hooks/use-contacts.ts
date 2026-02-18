"use client";

import useSWR from "swr";
import type { ApiContact } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useContacts() {
  const { data, error, isLoading, mutate } = useSWR<ApiContact[]>(
    "/api/contacts",
    fetcher
  );

  return { contacts: data, error, isLoading, mutate };
}
