import { NextResponse } from "next/server";
import { loadState, saveState } from "@/lib/state-manager";
import { getAddress } from "mouseion";

export async function POST(request: Request) {
  try {
    const { index } = await request.json();

    if (typeof index !== "number") {
      return NextResponse.json(
        { error: "Wallet index is required" },
        { status: 400 }
      );
    }

    const state = loadState();

    if (index < 0 || index >= state.wallets.length) {
      return NextResponse.json(
        { error: "Invalid wallet index" },
        { status: 400 }
      );
    }

    state.activeWallet = state.wallets[index];
    saveState(state);

    return NextResponse.json({
      success: true,
      activeWallet: {
        name: state.activeWallet.name,
        address: getAddress(state.activeWallet),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to switch wallet" },
      { status: 500 }
    );
  }
}
