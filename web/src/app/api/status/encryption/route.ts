import { NextResponse } from "next/server";
import { isEncrypted } from "@/lib/state-manager";

export async function GET() {
  try {
    return NextResponse.json({ encrypted: isEncrypted() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check encryption status" },
      { status: 500 }
    );
  }
}
