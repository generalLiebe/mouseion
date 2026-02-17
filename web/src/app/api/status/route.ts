import { NextResponse } from "next/server";
import { loadState } from "@/lib/state-manager";
import { getBlockHeight } from "mouseion";

export async function GET() {
  try {
    const state = loadState();
    const blockHeight = getBlockHeight(state.ledger);

    return NextResponse.json({
      blockHeight,
      totalAccounts: state.ledger.accounts.size,
      pendingTransactions: state.ledger.pendingTransactions.size,
      walletCount: state.wallets.length,
      activeWallet: state.activeWallet?.keyPair.publicKey ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get status" },
      { status: 500 }
    );
  }
}
