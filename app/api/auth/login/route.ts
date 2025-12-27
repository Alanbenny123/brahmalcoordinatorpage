import { NextResponse } from "next/server";
import { LoginSchema } from "@/lib/validations/schemas";
import { backendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";
import { verifyPassword } from "@/lib/hash";
import crypto from "crypto";
import { Student, StudentPublic } from "@/lib/types";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const COLLECTION = process.env.APPWRITE_USERS_COLLECTION_ID!;

function toPublicUser(user: Student): StudentPublic {
  return {
    id: user.$id,
    name: user.name,
    email: user.email,
    tickets: user.tickets || [],
    certificates: user.certificates || []
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      console.log("Validation Error:", result.error);
      return NextResponse.json(
        { success: false, error: (result.error as any).errors?.[0]?.message || "Validation Error" },
        { status: 400 }
      );
    }

    // Log 1: Input
    console.log("Login Input:", body);

    const { email, password } = result.data;
    console.log("Login Parsed Email:", email);

    const userList = await backendDB.listDocuments<Student>(
      DB_ID,
      COLLECTION,
      [Query.equal("email", email)]
    );

    console.log("Appwrite Result Total:", userList.total);
    console.log("Appwrite Result Documents:", userList.documents ? "Exists" : "Undefined");

    if (!userList.total) { // userList.documents might be [] if 0
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (!userList.documents || userList.documents.length === 0) {
      // This technically shouldn't happen if total > 0, but safe check
      console.error("Critical: Total > 0 but documents empty/undefined");
      return NextResponse.json({ success: false, message: "User not found (Data Error)" }, { status: 500 });
    }

    const user = userList.documents[0];
    console.log("User Found:", user.$id);

    const valid = await verifyPassword(user.pass, password);
    if (!valid) return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });

    const token = crypto.randomUUID();

    return NextResponse.json({
      success: true,
      token,
      user: toPublicUser(user)
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
