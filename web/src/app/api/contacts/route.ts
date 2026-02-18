import { NextResponse } from "next/server";
import { loadStatePublicOnly, saveContactsOnly } from "@/lib/state-manager";
import { isValidAddress } from "mouseion";

export async function GET() {
  try {
    const state = loadStatePublicOnly();
    return NextResponse.json(state.contacts || []);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, address, memo } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Contact name is required" },
        { status: 400 }
      );
    }

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: "Valid address is required (64 hex characters)" },
        { status: 400 }
      );
    }

    const state = loadStatePublicOnly();
    const contacts = state.contacts || [];

    // Check for duplicate name
    if (contacts.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) {
      return NextResponse.json(
        { error: `Contact "${name}" already exists` },
        { status: 409 }
      );
    }

    // Check for duplicate address
    const existingAddr = contacts.find(
      (c) => c.address.toLowerCase() === address.toLowerCase()
    );
    if (existingAddr) {
      return NextResponse.json(
        { error: `Address already saved as "${existingAddr.name}"` },
        { status: 409 }
      );
    }

    const newContact = {
      name: name.trim(),
      address: address.toLowerCase(),
      memo: memo || undefined,
      createdAt: Date.now(),
    };

    contacts.push(newContact);
    saveContactsOnly(contacts);

    return NextResponse.json({ success: true, contact: newContact });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add contact" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Contact name is required" },
        { status: 400 }
      );
    }

    const state = loadStatePublicOnly();
    const contacts = state.contacts || [];

    const index = contacts.findIndex(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (index === -1) {
      return NextResponse.json(
        { error: `Contact "${name}" not found` },
        { status: 404 }
      );
    }

    contacts.splice(index, 1);
    saveContactsOnly(contacts);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove contact" },
      { status: 500 }
    );
  }
}
