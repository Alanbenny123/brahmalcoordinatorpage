import { NextResponse } from "next/server";
import { backendDB } from "@/lib/appwrite/backend";
import { ID } from "node-appwrite";
import { hashPassword } from "@/lib/hash";
import { RegisterRequest, Student, StudentPublic, AuthResponse } from "@/lib/types";

// 👇 ensure these env values exist!
const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const COLLECTION = process.env.APPWRITE_USERS_COLLECTION_ID!;

// convert Student -> safe response
function toPublicUser(user: Student): StudentPublic {
  return { id: user.$id, name: user.name, email: user.email };
}

export async function POST(req: Request): Promise<NextResponse<AuthResponse>> {
  try {
    console.log("📥 Incoming request");
    const body = (await req.json()) as RegisterRequest;

    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ success:false, error:"Missing fields" });
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
        email: body.email,
        pass: hashed,
        certificates: [],
        tickets: []
      }
    );

    console.log("✅ Registered:", user.$id);

    return NextResponse.json({
      success:true,
      user: toPublicUser(user)
    });

  } catch (err:any) {
    console.error("❌ Register Error:", err.message);
    return NextResponse.json({ success:false, error:err.message });
  }
}
