import { NextResponse } from "next/server";
import { loadState, saveState, serializeBigInt } from "@/lib/state-manager";
import { mintTokens, getBalance } from "mouseion";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const state = loadState();

    if (!state.activeWallet) {
      return NextResponse.json(
        { error: "No active wallet. Create a wallet first." },
        { status: 400 }
      );
    }

    mintTokens(
      state.ledger,
      state.activeWallet.keyPair.publicKey,
      BigInt(amount)
    );

    saveState(state);

    const balance = getBalance(state.activeWallet, state.ledger);

    return NextResponse.json({
      success: true,
      minted: String(amount),
      balance: serializeBigInt(balance),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mint tokens" },
      { status: 500 }
    );
  }
}
