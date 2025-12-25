import { NextResponse } from "next/server";
import { backendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";

export async function POST(req: Request) {
  try {
    const { ticket_id, stud_id, event_id } = await req.json();

    // 1️⃣ Validate input
    if (!ticket_id || !stud_id || !event_id) {
      return NextResponse.json(
        { ok: false, error: "Missing ticket_id, stud_id, or event_id" },
        { status: 400 }
      );
    }

    // 2️⃣ Fetch ticket
    const ticket = await backendDB.getDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_TICKETS_COLLECTION_ID!,
      ticket_id
    );

    // 3️⃣ Validate event ownership
    if (ticket.event_id !== event_id) {
      return NextResponse.json(
        { ok: false, error: "Ticket does not belong to this event" },
        { status: 403 }
      );
    }

    // 4️⃣ Fetch attendance record for this user
    const attendanceRes = await backendDB.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!,
      [
        Query.equal("ticket_id", ticket_id),
        Query.equal("stud_id", stud_id),
      ]
    );

    if (attendanceRes.total === 0) {
      return NextResponse.json(
        { ok: false, error: "Attendance record not found" },
        { status: 404 }
      );
    }

    const attendanceDoc = attendanceRes.documents[0];

    // 5️⃣ Prevent double marking
    if (attendanceDoc.present === true) {
      return NextResponse.json({
        ok: true,
        message: "Already marked present",
        stud_id,
      });
    }

    // 6️⃣ Update attendance
    await backendDB.updateDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!,
      attendanceDoc.$id,
      {
        present: true,
      }
    );

    return NextResponse.json({
      ok: true,
      message: "Attendance marked successfully",
      stud_id,
    });

  } catch (error) {
    console.error("Mark attendance error:", error);

    return NextResponse.json(
      { ok: false, error: "Failed to mark attendance" },
      { status: 500 }
    );
  }
}
