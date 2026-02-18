import type { TransactionStateType } from "./types";

export const STATE_COLORS: Record<
  TransactionStateType,
  { bg: string; text: string; darkBg: string; darkText: string; label: string }
> = {
  PENDING: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    darkBg: "dark:bg-amber-900/30",
    darkText: "dark:text-amber-400",
    label: "Pending",
  },
  FINALIZED: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    darkBg: "dark:bg-emerald-900/30",
    darkText: "dark:text-emerald-400",
    label: "Finalized",
  },
  CANCELLED: {
    bg: "bg-rose-100",
    text: "text-rose-700",
    darkBg: "dark:bg-rose-900/30",
    darkText: "dark:text-rose-400",
    label: "Cancelled",
  },
  FROZEN: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    darkBg: "dark:bg-blue-900/30",
    darkText: "dark:text-blue-400",
    label: "Frozen",
  },
  RECOVERED: {
    bg: "bg-rose-100",
    text: "text-rose-800",
    darkBg: "dark:bg-rose-900/30",
    darkText: "dark:text-rose-500",
    label: "Recovered",
  },
};

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/send", label: "Send", icon: "Send" },
  { href: "/transactions", label: "Transactions", icon: "ArrowLeftRight" },
  { href: "/wallets", label: "Wallets", icon: "Wallet" },
  { href: "/contacts", label: "Contacts", icon: "Users" },
] as const;
