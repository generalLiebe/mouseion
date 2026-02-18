import { NextResponse } from "next/server";
import {
  loadStatePublicOnly,
  loadStateWithPassword,
  saveStateWithPassword,
  loadState,
  saveState,
  isEncrypted,
  serializeBigInt,
} from "@/lib/state-manager";
import { createWallet, getAddress, getBalance } from "mouseion";

export async function GET() {
  try {
    const state = loadStatePublicOnly();

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
    const { name, password } = body;

    const encrypted = isEncrypted();

    if (encrypted && !password) {
      return NextResponse.json(
        { error: "Password required — wallet is encrypted" },
        { status: 401 }
      );
    }

    // Load full state (with private keys) for saving
    const state = encrypted
      ? loadStateWithPassword(password)
      : loadState();

    const wallet = createWallet(name || undefined);
    state.wallets.push(wallet);

    if (!state.activeWallet) {
      state.activeWallet = wallet;
    }

    if (encrypted) {
      saveStateWithPassword(state, password);
    } else {
      saveState(state);
    }

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
