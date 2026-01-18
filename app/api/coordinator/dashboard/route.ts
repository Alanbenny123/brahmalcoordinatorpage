import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchEvent, fetchTicketsForEvent, fetchAttendanceForEvent } from "@/lib/data-fetcher";

export async function GET(req: Request) {
  try {
    // 1️⃣ Get event ID from secure cookie (not client header)
    const cookieStore = await cookies();
    const eventId = cookieStore.get("coord_event")?.value;

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated as coordinator" },
        { status: 401 }
      );
    }

    // 2️⃣ Fetch event using smart fetcher (Firebase first, Appwrite fallback)
    const { event, source: eventSource, success: eventSuccess } = await fetchEvent(eventId);

    if (!eventSuccess || !event) {
      return NextResponse.json(
        { ok: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Fetch tickets using smart fetcher
    const { tickets, source: ticketsSource } = await fetchTicketsForEvent(eventId);
    const totalRegistrations = tickets.length;

    let totalParticipants = 0;
    for (const ticket of tickets) {
      const studIds = (ticket as any).stud_id;
      totalParticipants += Array.isArray(studIds) ? studIds.length : 0;
    }

    // 4️⃣ Fetch attendance using smart fetcher
    const { attendance, source: attendanceSource } = await fetchAttendanceForEvent(eventId);
    const checkedInParticipants = attendance.length;

    // 5️⃣ Final response with source tracking
    const eventData = event as any;
    return NextResponse.json({
      ok: true,
      event: {
        $id: eventId,
        event_name: eventData.event_name,
        completed: eventData.completed,
        venue: eventData.venue || "",
        date: eventData.date || "",
        time: eventData.time || "",
        slot: eventData.slot !== undefined && eventData.slot !== null ? String(eventData.slot) : "",
      },
      stats: {
        total_registrations: totalRegistrations,
        total_participants: totalParticipants,
        checked_in_participants: checkedInParticipants,
        not_checked_in_participants:
          totalParticipants - checkedInParticipants,
      },
      _meta: {
        sources: {
          event: eventSource,
          tickets: ticketsSource,
          attendance: attendanceSource,
        }
      }
    });

  } catch (error) {
    console.error("Coordinator dashboard error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to load coordinator dashboard" },
      { status: 500 }
    );
  }
}
