import { NextResponse } from "next/server";
import { searchContacts, isDemo } from "@/lib/ghl";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { query } = await request.json();
    const q = String(query || "").trim();

    if (q.length < 2) {
      return NextResponse.json(
        { error: "Type at least 2 characters." },
        { status: 400 }
      );
    }

    const contacts = await searchContacts(q);
    return NextResponse.json({ contacts, demo: isDemo() });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
