import { NextResponse } from "next/server";
import {
  loadStateWithPassword,
  saveStateWithPassword,
  loadState,
  saveState,
  isEncrypted,
  serializeBigInt,
} from "@/lib/state-manager";
import { cancelSent } from "mouseion";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ txId: string }> }
) {
  try {
    const { txId } = await params;
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    const encrypted = isEncrypted();

    if (encrypted && !password) {
      return NextResponse.json(
        { error: "Password required — wallet is encrypted" },
        { status: 401 }
      );
    }

    const state = encrypted
      ? loadStateWithPassword(password)
      : loadState();

    if (!state.activeWallet) {
      return NextResponse.json(
        { error: "No active wallet" },
        { status: 400 }
      );
    }

    const result = cancelSent(state.activeWallet, state.ledger, txId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Cancellation failed" },
        { status: 400 }
      );
    }

    if (encrypted) {
      saveStateWithPassword(state, password);
    } else {
      saveState(state);
    }

    return NextResponse.json({
      success: true,
      transaction: serializeBigInt(result.transaction),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel transaction" },
      { status: 500 }
    );
  }
}
