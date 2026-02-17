/**
 * API client for the Mouseion Web GUI
 */

const BASE_URL = "/api";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Status
export const getStatus = () => request("/status");

// Wallets
export const getWallets = () => request("/wallets");
export const createWallet = (name?: string) =>
  request("/wallets", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
export const setActiveWallet = (index: number) =>
  request("/wallets/active", {
    method: "POST",
    body: JSON.stringify({ index }),
  });

// Balance
export const getBalance = () => request("/balance");

// Faucet
export const requestFaucet = (amount: number) =>
  request("/faucet", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

// Transactions
export const getTransactions = (params?: {
  status?: string;
  direction?: string;
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.direction) searchParams.set("direction", params.direction);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  return request(`/transactions${query ? `?${query}` : ""}`);
};

export const createTransaction = (data: {
  recipient: string;
  amount: number;
  memo?: string;
  gracePeriod?: number;
}) =>
  request("/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getTransaction = (txId: string) =>
  request(`/transactions/${txId}`);

export const confirmTransaction = (txId: string) =>
  request(`/transactions/${txId}/confirm`, { method: "POST" });

export const cancelTransaction = (txId: string) =>
  request(`/transactions/${txId}/cancel`, { method: "POST" });
