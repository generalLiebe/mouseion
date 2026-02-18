"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Clipboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBalance } from "@/lib/hooks/use-balance";
import { useContacts } from "@/lib/hooks/use-contacts";
import { useEncryption } from "@/lib/hooks/use-encryption";
import { AmountDisplay } from "@/components/shared/amount-display";
import { formatAddress, formatGracePeriod } from "@/lib/utils";
import { GRACE_PERIOD_OPTIONS } from "@/lib/types";
import * as api from "@/lib/api";
import { toast } from "sonner";

export default function SendPage() {
  const router = useRouter();
  const { balance, mutate: mutateBalance } = useBalance();
  const { contacts } = useContacts();
  const { encrypted } = useEncryption();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [gracePeriod, setGracePeriod] = useState(
    String(GRACE_PERIOD_OPTIONS[2].value)
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [password, setPassword] = useState("");

  // Resolve selected contact name to display
  const selectedContact = contacts?.find(
    (c) =>
      c.address.toLowerCase() === recipient.toLowerCase() ||
      c.name.toLowerCase() === recipient.toLowerCase()
  );

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRecipient(text.trim());
    } catch {
      toast.error("Failed to paste from clipboard");
    }
  };

  const handleMax = () => {
    if (balance) {
      setAmount(balance.available);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) {
      toast.error("Recipient and amount are required");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setSending(true);
    try {
      // Resolve contact name to address
      const resolvedRecipient =
        selectedContact?.address || recipient;

      await api.createTransaction({
        recipient: resolvedRecipient,
        amount: Number(amount),
        memo: memo || undefined,
        gracePeriod: Number(gracePeriod),
        password: encrypted ? password : undefined,
      });
      toast.success("Transaction created!");
      mutateBalance();
      setPassword("");
      router.push("/transactions");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Transaction failed"
      );
    } finally {
      setSending(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Send
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Send tokens to another wallet address
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Recipient */}
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <div className="flex gap-2">
                <Input
                  id="recipient"
                  list="contact-list"
                  placeholder="Enter address or contact name"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handlePaste}
                  aria-label="Paste address"
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
              {/* Contacts datalist for autocomplete */}
              {contacts && contacts.length > 0 && (
                <datalist id="contact-list">
                  {contacts.map((c) => (
                    <option key={c.name} value={c.address}>
                      {c.name}
                    </option>
                  ))}
                </datalist>
              )}
              {selectedContact && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Sending to: {selectedContact.name}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMax}
                  className="shrink-0"
                >
                  MAX
                </Button>
              </div>
              {balance && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Available: <AmountDisplay amount={balance.available} size="sm" />
                </p>
              )}
            </div>

            {/* Memo */}
            <div className="space-y-2">
              <Label htmlFor="memo">Memo (optional)</Label>
              <Input
                id="memo"
                placeholder="What is this for?"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            {/* Grace Period */}
            <div className="space-y-2">
              <Label htmlFor="grace-period">Grace Period</Label>
              <Select
                id="grace-period"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(e.target.value)}
              >
                {GRACE_PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transaction can be cancelled during this period
              </p>
            </div>

            <Button type="submit" className="w-full">
              <Send className="h-4 w-4" />
              Review Transaction
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
            <DialogDescription>
              Please review the details before sending.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">To</span>
              <span>
                {selectedContact && (
                  <span className="mr-2 font-medium text-slate-800 dark:text-slate-200">
                    {selectedContact.name}
                  </span>
                )}
                <code className="font-mono text-xs text-slate-800 dark:text-slate-200">
                  {formatAddress(selectedContact?.address || recipient, 12)}
                </code>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Amount</span>
              <AmountDisplay amount={amount || "0"} size="md" />
            </div>
            {memo && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Memo</span>
                <span>{memo}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                Grace Period
              </span>
              <span>{formatGracePeriod(Number(gracePeriod))}</span>
            </div>

            {/* Password field (only shown when encrypted) */}
            {encrypted && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter wallet password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={sending || (encrypted && !password)}
            >
              {sending ? "Sending..." : "Confirm & Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
