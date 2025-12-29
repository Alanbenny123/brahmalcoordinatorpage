import { NextResponse } from "next/server";
import { backendDB } from "@/lib/appwrite/server";

export async function GET() {
  try {
    const res = await backendDB.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_REG_COLLECTION_ID!
    );

    return NextResponse.json({ ok: true, count: res.total });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) });
  }
}
