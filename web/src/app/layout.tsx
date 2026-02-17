import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Mouseion — Reversible Transaction Blockchain",
  description:
    "Fair value distribution for AI contributions. Manage wallets and transactions on the Mouseion blockchain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-stone-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
        <Sidebar />
        <div className="md:pl-64">
          <Header />
          <main className="mx-auto max-w-5xl p-6">{children}</main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className:
              "border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
          }}
        />
      </body>
    </html>
  );
}
