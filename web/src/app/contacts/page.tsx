"use client";

import { useState } from "react";
import { Users, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressDisplay } from "@/components/shared/address-display";
import { useContacts } from "@/lib/hooks/use-contacts";
import * as api from "@/lib/api";
import { toast } from "sonner";

export default function ContactsPage() {
  const { contacts, isLoading, mutate } = useContacts();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [memo, setMemo] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !address.trim()) {
      toast.error("Name and address are required");
      return;
    }

    setAdding(true);
    try {
      await api.addContact({
        name: name.trim(),
        address: address.trim(),
        memo: memo.trim() || undefined,
      });
      toast.success(`Contact "${name}" added!`);
      setName("");
      setAddress("");
      setMemo("");
      mutate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add contact"
      );
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (contactName: string) => {
    try {
      await api.removeContact(contactName);
      toast.success(`Contact "${contactName}" removed`);
      mutate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove contact"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Contacts
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your address book for easy sending
        </p>
      </div>

      {/* Add Contact Form */}
      <Card className="max-w-xl">
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                placeholder="e.g. Alice"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-address">Address</Label>
              <Input
                id="contact-address"
                placeholder="64 hex character address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-memo">Memo (optional)</Label>
              <Input
                id="contact-memo"
                placeholder="Note about this contact"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={adding} className="w-full">
              <Users className="h-4 w-4" />
              {adding ? "Adding..." : "Add Contact"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Contact List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !contacts || contacts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-400">
            No contacts yet. Add your first contact above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <Card key={contact.name} className="transition-shadow hover:shadow-md">
              <CardContent>
                <div className="flex items-center justify-between gap-4 pt-4">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {contact.name}
                    </p>
                    <AddressDisplay address={contact.address} chars={16} />
                    {contact.memo && (
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {contact.memo}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(contact.name)}
                    aria-label={`Remove ${contact.name}`}
                    className="shrink-0 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
