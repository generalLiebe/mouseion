import { NextResponse } from "next/server";
import { loadState, saveState, serializeBigInt } from "@/lib/state-manager";
import { createWallet, getAddress, getBalance } from "mouseion";

export async function GET() {
  try {
    const state = loadState();

    const wallets = state.wallets.map((w, _i) => ({
      name: w.name,
      address: getAddress(w),
      createdAt: w.createdAt,
      isActive:
        state.activeWallet?.keyPair.publicKey === w.keyPair.publicKey,
      balance: serializeBigInt(getBalance(w, state.ledger)),
    }));

    return NextResponse.json(wallets);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get wallets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name } = body;

    const state = loadState();
    const wallet = createWallet(name || undefined);
    state.wallets.push(wallet);

    if (!state.activeWallet) {
      state.activeWallet = wallet;
    }

    saveState(state);

    return NextResponse.json({
      success: true,
      wallet: {
        name: wallet.name,
        address: getAddress(wallet),
        createdAt: wallet.createdAt,
        isActive:
          state.activeWallet.keyPair.publicKey === wallet.keyPair.publicKey,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create wallet" },
      { status: 500 }
    );
  }
}
