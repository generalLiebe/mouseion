import { NextResponse } from "next/server";
import { loadStatePublicOnly, serializeBigInt } from "@/lib/state-manager";
import { getBalance } from "mouseion";

export async function GET() {
  try {
    const state = loadStatePublicOnly();

    if (!state.activeWallet) {
      return NextResponse.json(
        { error: "No active wallet. Create a wallet first." },
        { status: 400 }
      );
    }

    const balance = getBalance(state.activeWallet, state.ledger);
    return NextResponse.json(serializeBigInt(balance));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get balance" },
      { status: 500 }
    );
  }
}
