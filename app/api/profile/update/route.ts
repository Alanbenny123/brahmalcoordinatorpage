import { NextResponse } from "next/server";
import { backendDB } from "@/lib/appwrite/backend";
import { hashPassword } from "@/lib/hash";
import { ProfileUpdateSchema } from "@/lib/validations/schemas"; // Assuming this path

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const COLLECTION = process.env.APPWRITE_USERS_COLLECTION_ID!;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const result = ProfileUpdateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: (result.error as any).errors[0].message },
        { status: 400 }
      );
    }

    // Explicitly destructure only allowed fields
    const { id, name, email, password } = result.data;

    const updateData: Record<string, any> = { name, email };

    if (password) {
      updateData.pass = await hashPassword(password);
    }

    const user = await backendDB.updateDocument(
      DB_ID,
      COLLECTION,
      json.id, // ID is still needed!
      updateData
    );

    return NextResponse.json({
      success: true,
      user: { id: user.$id, name: user.name, email: user.email },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
