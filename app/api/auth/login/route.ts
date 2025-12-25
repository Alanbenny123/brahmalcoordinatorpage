import { NextResponse } from "next/server";
import { backendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";
import { verifyPassword } from "@/lib/hash";
import crypto from "crypto";
import { Student, StudentPublic, LoginRequest, AuthResponse } from "@/lib/types";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const COLLECTION = process.env.APPWRITE_USERS_COLLECTION_ID!;

function toPublicUser(user: Student): StudentPublic {
  return { id: user.$id, name: user.name, email: user.email };
}

export async function POST(req: Request): Promise<NextResponse<AuthResponse>> {
  try {
    const { email, password } = (await req.json()) as LoginRequest;

    const result = await backendDB.listDocuments<Student>(
      DB_ID,
      COLLECTION,
      [Query.equal("email", email)]
    );

    if (!result.total) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    const user = result.documents[0];

    const valid = await verifyPassword(user.pass, password);
    if (!valid) return NextResponse.json({ success: false, message: "Invalid password" });

    const token = crypto.randomUUID();

    return NextResponse.json({
      success: true,
      token,
      user: toPublicUser(user)
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
