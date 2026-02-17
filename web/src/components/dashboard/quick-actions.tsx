"use client";

import Link from "next/link";
import { Send, Droplets, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import * as api from "@/lib/api";
import { toast } from "sonner";
import { useBalance } from "@/lib/hooks/use-balance";
import { useWallets } from "@/lib/hooks/use-wallets";

export function QuickActions() {
  const [faucetLoading, setFaucetLoading] = useState(false);
  const { mutate: mutateBalance } = useBalance();
  const { wallets, mutate: mutateWallets } = useWallets();
  const [createLoading, setCreateLoading] = useState(false);

  const handleFaucet = async () => {
    setFaucetLoading(true);
    try {
      await api.requestFaucet(10000);
      toast.success("Received 10,000 test tokens!");
      mutateBalance();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Faucet failed");
    } finally {
      setFaucetLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    setCreateLoading(true);
    try {
      await api.createWallet(`Wallet ${(wallets?.length ?? 0) + 1}`);
      toast.success("Wallet created!");
      mutateWallets();
      mutateBalance();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create wallet"
      );
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Link href="/send">
          <Button>
            <Send className="h-4 w-4" />
            Send
          </Button>
        </Link>
        <Button
          variant="secondary"
          onClick={handleFaucet}
          disabled={faucetLoading}
        >
          <Droplets className="h-4 w-4" />
          {faucetLoading ? "Minting..." : "Faucet"}
        </Button>
        <Button
          variant="outline"
          onClick={handleCreateWallet}
          disabled={createLoading}
        >
          <Plus className="h-4 w-4" />
          {createLoading ? "Creating..." : "Create Wallet"}
        </Button>
      </CardContent>
    </Card>
  );
}
