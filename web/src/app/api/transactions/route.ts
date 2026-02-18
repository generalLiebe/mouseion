import { NextRequest, NextResponse } from "next/server";
import {
  loadState,
  loadStatePublicOnly,
  loadStateWithPassword,
  saveStateWithPassword,
  saveState,
  isEncrypted,
  serializeBigInt,
} from "@/lib/state-manager";
import { getTransactionHistory, send } from "mouseion";

export async function GET(request: NextRequest) {
  try {
    const state = loadStatePublicOnly();

    if (!state.activeWallet) {
      return NextResponse.json(
        { error: "No active wallet. Create a wallet first." },
        { status: 400 }
      );
    }

    const { searchParams } = request.nextUrl;
    const statusFilter = searchParams.get("status");
    const directionFilter = searchParams.get("direction");
    const limit = searchParams.get("limit");

    let entries = getTransactionHistory(state.activeWallet, state.ledger);

    if (statusFilter) {
      entries = entries.filter(
        (e) => e.transaction.state === statusFilter
      );
    }

    if (directionFilter) {
      entries = entries.filter((e) => e.direction === directionFilter);
    }

    // Sort newest first
    entries.sort((a, b) => b.transaction.createdAt - a.transaction.createdAt);

    if (limit) {
      entries = entries.slice(0, parseInt(limit, 10));
    }

    return NextResponse.json(serializeBigInt(entries));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { recipient, amount, memo, gracePeriod, password } = await request.json();

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient address is required" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

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
        { error: "No active wallet. Create a wallet first." },
        { status: 400 }
      );
    }

    const result = send(
      state.activeWallet,
      state.ledger,
      recipient,
      BigInt(amount),
      {
        memo: memo || "",
        gracePeriod: gracePeriod || undefined,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Transaction failed" },
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
      { error: error instanceof Error ? error.message : "Failed to create transaction" },
      { status: 500 }
    );
  }
}
