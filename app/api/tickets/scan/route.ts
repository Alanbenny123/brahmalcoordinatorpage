import { NextResponse } from "next/server";
import { ScanTicketSchema } from "@/lib/validations/schemas";
import { backendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const result = ScanTicketSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: (result.error as any).errors[0].message },
        { status: 400 }
      );
    }

    const { ticket_id, event_id } = result.data;

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

    // Get stud_ids from the ticket (stored as stud_id in the ticket document)
    const studIds: string[] = ticket.stud_id || [];

    // Check attendance for each student
    const members = await Promise.all(
      studIds.map(async (stud_id: string) => {
        const attendance = await backendDB.listDocuments(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!,
          [
            Query.equal("stud_id", stud_id),
            Query.equal("ticket_id", ticket_id),
            Query.equal("event_id", event_id),
          ]
        );

        // If a record exists, the student is present
        return {
          stud_id,
          present: attendance.documents.length > 0,
        };
      })
    );

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
