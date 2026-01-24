import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const EVENTS_COLLECTION = process.env.APPWRITE_EVENTS_COLLECTION_ID!;
const TICKETS_COLLECTION = process.env.APPWRITE_TICKETS_COLLECTION_ID!;
const ATTENDANCE_COLLECTION = process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!;
const USERS_COLLECTION = process.env.APPWRITE_USERS_COLLECTION_ID!;

export async function GET(req: Request) {
  try {
    // Verify coordinator is authenticated
    const cookieStore = await cookies();
    const coordSession = cookieStore.get("coord_session")?.value;

    if (!coordSession) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated as coordinator" },
        { status: 401 }
      );
    }

    const db = getBackendDB();

    // Fetch all events
    const eventsRes = await db.listDocuments(
      DB_ID,
      EVENTS_COLLECTION,
      [Query.limit(100), Query.orderDesc('$createdAt')]
    );
    const events = eventsRes.documents;

    // Fetch all tickets
    const ticketsRes = await db.listDocuments(
      DB_ID,
      TICKETS_COLLECTION,
      [Query.limit(1000)]
    );
    const allTickets = ticketsRes.documents;

    // Fetch all attendance records
    const attendanceRes = await db.listDocuments(
      DB_ID,
      ATTENDANCE_COLLECTION,
      [Query.limit(2000)]
    );
    const allAttendance = attendanceRes.documents;

    // Build event stats
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const eventData = event as any;
        const eventId = event.$id;

        // Filter tickets for this event
        const eventTickets = allTickets.filter(
          (ticket: any) => ticket.event_id === eventId
        );

        // Calculate total participants
        let totalParticipants = 0;
        const allStudentIds = new Set<string>();

        for (const ticket of eventTickets) {
          const ticketData = ticket as any;
          const studIds = ticketData.stud_id ?? [];

          if (Array.isArray(studIds) && studIds.length > 0) {
            totalParticipants += studIds.length;
            studIds.forEach((id: string) => {
              if (id) allStudentIds.add(id);
            });
          } else if (studIds && !Array.isArray(studIds)) {
            totalParticipants += 1;
            allStudentIds.add(String(studIds));
          }
        }

        // Filter attendance for this event
        const eventAttendance = allAttendance.filter(
          (record: any) => record.event_id === eventId
        );

        // Calculate remaining slots
        const totalSlots = eventData.slots || 0;
        const remainingSlots = Math.max(0, totalSlots - eventTickets.length);

        return {
          $id: eventId,
          event_name: eventData.event_name,
          category: eventData.category || "",
          venue: eventData.venue || "",
          date: eventData.date || "",
          time: eventData.time || "",
          completed: eventData.completed || false,
          slots: totalSlots,
          remaining_slots: remainingSlots,
          stats: {
            total_registrations: eventTickets.length,
            total_participants: totalParticipants,
            checked_in_participants: eventAttendance.length,
            not_checked_in_participants: totalParticipants - eventAttendance.length,
          },
        };
      })
    );

    return NextResponse.json({
      ok: true,
      count: eventsWithStats.length,
      events: eventsWithStats,
    });
  } catch (error) {
    console.error("All events fetch error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to load events overview" },
      { status: 500 }
    );
  }
}
