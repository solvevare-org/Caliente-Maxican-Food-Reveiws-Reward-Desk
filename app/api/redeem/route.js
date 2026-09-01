import { NextResponse } from "next/server";
import { markRedeemed, isDemo } from "@/lib/ghl";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { contactId } = await request.json();

    if (!/^[a-zA-Z0-9_-]{3,64}$/.test(String(contactId || ""))) {
      return NextResponse.json({ error: "Missing contact." }, { status: 400 });
    }

    const result = await markRedeemed(contactId);
    return NextResponse.json({ ...result, demo: isDemo() });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
