import { NextResponse } from "next/server";
import { backendDB } from "@/lib/appwrite/backend";
import { hashPassword } from "@/lib/hash";
import { Models } from "appwrite";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const COLLECTION = process.env.APPWRITE_USERS_COLLECTION_ID!;

export async function POST(req: Request) {
  try {
    const { id, name, email, password } = await req.json();

    const updateData: Partial<Models.Document> = { name, email };

    if (password) {
      updateData.pass = await hashPassword(password);
    }

    const user = await backendDB.updateDocument(
      DB_ID,
      COLLECTION,
      id,
      updateData
    );

    return NextResponse.json({
      success: true,
      user: { id: user.$id, name: user.name, email: user.email },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
