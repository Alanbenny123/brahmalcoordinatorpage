import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ScanTicketSchema } from "@/lib/validations/schemas";
import { fetchTicket, fetchUsers, fetchAttendanceForEvent } from "@/lib/data-fetcher";

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

    // Verify coordinator is authenticated for this event
    const cookieStore = await cookies();
    const coordEventId = cookieStore.get("coord_event")?.value;

    if (!coordEventId || coordEventId !== event_id) {
      return NextResponse.json(
        { ok: false, error: "Not authorized for this event" },
        { status: 403 }
      );
    }

    // Fetch ticket using smart fetcher (Firebase first, Appwrite fallback)
    const { ticket, success: ticketSuccess, source: ticketSource } = await fetchTicket(ticket_id);

    if (!ticketSuccess || !ticket) {
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

    // Fetch user names using smart fetcher
    const { users } = await fetchUsers(studIds);

    const userMap = new Map<string, string>();
    for (const user of users) {
      userMap.set(user.$id, user.name);
    }

    // Fetch attendance for the event
    const { attendance } = await fetchAttendanceForEvent(event_id);

    // Build a set of checked-in students for this specific ticket
    const checkedInSet = new Set<string>();
    for (const record of attendance) {
      if (record.ticket_id === ticket_id) {
        checkedInSet.add(record.stud_id);
      }
    }

    // Build members list
    const members = studIds.map((stud_id: string) => ({
      stud_id,
      name: userMap.get(stud_id) || stud_id,
      present: checkedInSet.has(stud_id),
    }));

    return NextResponse.json({
      ok: true,
      ticket_active: ticket.active,
      members,
      _meta: {
        source: ticketSource,
      }
    });
  } catch (error) {
    console.error("Ticket scan error:", error);
    return NextResponse.json(
      { ok: false, error: "Invalid or expired ticket" },
      { status: 500 }
    );
  }
}
