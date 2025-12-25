import { NextResponse } from "next/server";
import { backendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";

export async function POST(req: Request) {
  try {
    const { ticket_id, event_id } = await req.json();

    if (!ticket_id || !event_id) {
      return NextResponse.json(
        { ok: false, error: "Missing ticket_id or event_id" },
        { status: 400 }
      );
    }

    const ticket = await backendDB.getDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_TICKETS_COLLECTION_ID!,
      ticket_id
    );

    if (ticket.event_id !== event_id) {
      return NextResponse.json(
        { ok: false, error: "Ticket does not belong to this event" },
        { status: 403 }
      );
    }

    const attendance = await backendDB.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!,
      [Query.equal("ticket_id", ticket_id)]
    );

    const members = attendance.documents.map((doc) => ({
      stud_id: doc.stud_id,
      present: doc.present,
    }));

    return NextResponse.json({
      ok: true,
      ticket_active: ticket.active,
      event_id: ticket.event_id,
      members,
    });
  } catch (error) {
    console.error("Ticket scan error:", error);
    return NextResponse.json(
      { ok: false, error: "Invalid or expired ticket" },
      { status: 500 }
    );
  }
}
