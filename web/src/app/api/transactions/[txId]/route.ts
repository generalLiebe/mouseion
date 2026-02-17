import { NextResponse } from "next/server";
import { loadState, serializeBigInt } from "@/lib/state-manager";
import { getTransaction } from "mouseion";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ txId: string }> }
) {
  try {
    const { txId } = await params;
    const state = loadState();
    const tx = getTransaction(state.ledger, txId);

    if (!tx) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeBigInt(tx));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get transaction" },
      { status: 500 }
    );
  }
}
