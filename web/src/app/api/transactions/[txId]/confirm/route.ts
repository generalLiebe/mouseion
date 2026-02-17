import { NextResponse } from "next/server";
import { loadState, saveState, serializeBigInt } from "@/lib/state-manager";
import { confirmReceived } from "mouseion";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ txId: string }> }
) {
  try {
    const { txId } = await params;
    const state = loadState();

    if (!state.activeWallet) {
      return NextResponse.json(
        { error: "No active wallet" },
        { status: 400 }
      );
    }

    const result = confirmReceived(state.activeWallet, state.ledger, txId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Confirmation failed" },
        { status: 400 }
      );
    }

    saveState(state);

    return NextResponse.json({
      success: true,
      transaction: serializeBigInt(result.transaction),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to confirm transaction" },
      { status: 500 }
    );
  }
}
