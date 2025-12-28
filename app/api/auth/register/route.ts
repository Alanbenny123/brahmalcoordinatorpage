import { NextResponse } from "next/server";
import { RegisterSchema } from "@/lib/validations/schemas";
import { backendDB } from "@/lib/appwrite/backend";
import { ID, Query } from "node-appwrite";
import { hashPassword } from "@/lib/hash";
import { Student, StudentPublic } from "@/lib/types";

// 👇 ensure these env values exist!
const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const COLLECTION = process.env.APPWRITE_USERS_COLLECTION_ID!;

// convert Student -> safe response
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
    console.log("📥 Incoming request");
    const json = await req.json();

    // Validate with Zod
    const result = RegisterSchema.safeParse(json);

    if (!result.success) {
      console.log("Zod Error:", result.error);
      return NextResponse.json(
        { success: false, error: (result.error as any).errors?.[0]?.message || "Validation Error" },
        { status: 400 }
      );
    }

    const body = result.data;

    // Normalize and check for duplicates before creating
    const email = body.email.trim().toLowerCase();
    const existing = await backendDB.listDocuments<Student>(
      DB_ID,
      COLLECTION,
      [Query.equal("email", email)]
    );

    if (existing.total > 0) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    console.log("🔐 Hashing password");
    const hashed = await hashPassword(body.password);

    console.log("📝 Creating user document in Appwrite…");
    const user = await backendDB.createDocument<Student>(
      DB_ID,
      COLLECTION,
      ID.unique(),
      {
        name: body.name,
        email,
        pass: hashed,
        certificates: [],
        tickets: []
      }
    );

    console.log("✅ Registered:", user.$id);

    return NextResponse.json({
      success: true,
      user: toPublicUser(user)
    });

  } catch (err: any) {
    console.error("❌ Register Error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
