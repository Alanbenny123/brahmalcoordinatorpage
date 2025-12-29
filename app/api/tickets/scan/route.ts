import { NextResponse } from "next/server";
import { ScanTicketSchema } from "@/lib/validations/schemas";
import { backendDB } from "@/lib/appwrite/server";
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

    // Fetch ticket
    let ticket;
    try {
      ticket = await backendDB.getDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_TICKETS_COLLECTION_ID!,
        ticket_id
      );
    } catch {
      return NextResponse.json(
        { ok: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    if (ticket.event_id !== event_id) {
      return NextResponse.json(
        { ok: false, error: "Ticket does not belong to this event" },
        { status: 403 }
      );
    }

    // Get stud_ids from the ticket
    const studIds: string[] = ticket.stud_id || [];

    // Fetch user names
    const usersRes = await backendDB.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_USERS_COLLECTION_ID!,
      [Query.equal("$id", studIds)]
    );

    const userMap = new Map<string, string>();
    for (const user of usersRes.documents) {
      userMap.set(user.$id, user.name);
    }

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

        return {
          stud_id,
          name: userMap.get(stud_id) || stud_id,
          present: attendance.documents.length > 0,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      ticket_active: ticket.active,
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
