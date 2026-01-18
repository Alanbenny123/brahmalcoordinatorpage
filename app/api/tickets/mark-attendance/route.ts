import { NextResponse } from "next/server";
import { MarkAttendanceSchema } from "@/lib/validations/schemas";
import { getBackendDB } from "@/lib/appwrite/backend";
import { ID, Query } from "node-appwrite";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const result = MarkAttendanceSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: (result.error as any).errors[0].message },
        { status: 400 }
      );
    }

    const { ticket_id, stud_id, event_id } = result.data;

    // 2️⃣ Fetch ticket
    const ticket = await getBackendDB().getDocument(
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

    // 4️⃣ Check if attendance record already exists
    const attendanceRes = await getBackendDB().listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!,
      [
        Query.equal("ticket_id", ticket_id),
        Query.equal("stud_id", stud_id),
        Query.equal("event_id", event_id),
      ]
    );

    // 5️⃣ If record exists, already marked present
    if (attendanceRes.total > 0) {
      return NextResponse.json({
        ok: true,
        message: "Already marked present",
        stud_id,
      });
    }

    // 6️⃣ Create new attendance record
    await getBackendDB().createDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!,
      ID.unique(),
      {
        event_id,
        ticket_id,
        stud_id,
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
