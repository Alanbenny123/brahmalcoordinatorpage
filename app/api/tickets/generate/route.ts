import { NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { backendDB } from "@/lib/appwrite/backend";

export async function POST(req: Request) {
  try {
    // 1️⃣ Read request body
    const body = await req.json();
    const { event_id, stud_ids } = body;

    // 2️⃣ Basic validation
    if (!event_id || !Array.isArray(stud_ids) || stud_ids.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid input data" },
        { status: 400 }
      );
    }

    // 3️⃣ Create ticket document
    const ticket = await backendDB.createDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_TICKETS_COLLECTION_ID!,
      ID.unique(),
      {
        event_id,
        stud_id: stud_ids,
        active: true,
      }
    );

    // 4️⃣ Create attendance entries (one per user)
    const attendancePromises = stud_ids.map((user_id: string) => {
      return backendDB.createDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!,
        ID.unique(),
        {
          event_id,
          ticket_id: ticket.$id,
          stud_id: user_id,
          present: false,
        }
      );
    });

    await Promise.all(attendancePromises);

    // 5️⃣ Add ticket ID to each user's tickets[] array
    const userUpdatePromises = stud_ids.map(async (user_id: string) => {
      // Fetch user document
      const userDoc = await backendDB.getDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USERS_COLLECTION_ID!,
        user_id
      );

      const existingTickets = Array.isArray(userDoc.tickets)
        ? userDoc.tickets
        : [];

      // Append new ticket ID
      return backendDB.updateDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USERS_COLLECTION_ID!,
        user_id,
        {
          tickets: [...existingTickets, ticket.$id],
        }
      );
    });

    await Promise.all(userUpdatePromises);

    // 6️⃣ Return success response
    return NextResponse.json({
      ok: true,
      ticket_id: ticket.$id,
      event_id,
    });

  } catch (error) {
    console.error("Ticket generation error:", error);

    return NextResponse.json(
      { ok: false, error: "Ticket generation failed" },
      { status: 500 }
    );
  }
}
