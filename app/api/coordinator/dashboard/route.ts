import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const EVENTS_COLLECTION = process.env.APPWRITE_EVENTS_COLLECTION_ID!;
const TICKETS_COLLECTION = process.env.APPWRITE_TICKETS_COLLECTION_ID!;
const ATTENDANCE_COLLECTION = process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!;

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

    const db = getBackendDB();

    // 2️⃣ Fetch event directly from Appwrite (source of truth) for fresh data
    let event;
    try {
      event = await db.getDocument(DB_ID, EVENTS_COLLECTION, eventId);
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Fetch tickets directly from Appwrite
    const ticketsRes = await db.listDocuments(
      DB_ID,
      TICKETS_COLLECTION,
      [Query.equal('event_id', eventId), Query.limit(500)]
    );
    const tickets = ticketsRes.documents;
    const totalRegistrations = tickets.length;

    // Count total participants (sum of all stud_ids across all tickets)
    let totalParticipants = 0;
    const allStudentIds = new Set<string>(); // Track unique student IDs
    
    for (const ticket of tickets) {
      const ticketData = ticket as any;
      // Use stud_id field (matches Appwrite schema: stud_id[] string array)
      const studIds = ticketData.stud_id ?? [];
      
      if (Array.isArray(studIds) && studIds.length > 0) {
        // Count each student in this ticket
        totalParticipants += studIds.length;
        
        // Track unique students
        studIds.forEach((id: string) => {
          if (id) allStudentIds.add(id);
        });
      } else if (studIds && !Array.isArray(studIds)) {
        // Handle single stud_id (not array)
        totalParticipants += 1;
        allStudentIds.add(String(studIds));
      }
    }

    // 4️⃣ Fetch attendance directly from Appwrite
    const attendanceRes = await db.listDocuments(
      DB_ID,
      ATTENDANCE_COLLECTION,
      [Query.equal('event_id', eventId), Query.limit(500)]
    );
    const checkedInParticipants = attendanceRes.documents.length;

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
        slots: eventData.slots || 0,
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
          event: 'appwrite',
          tickets: 'appwrite',
          attendance: 'appwrite',
        },
        debug: {
          tickets_count: tickets.length,
          unique_students: allStudentIds.size,
          total_participants_calculated: totalParticipants,
          attendance_records: checkedInParticipants,
          sample_ticket: tickets.length > 0 ? {
            has_stud_id: !!(tickets[0] as any).stud_id,
            stud_id_type: typeof (tickets[0] as any).stud_id,
            stud_id_is_array: Array.isArray((tickets[0] as any).stud_id),
            stud_id_length: Array.isArray((tickets[0] as any).stud_id) ? (tickets[0] as any).stud_id.length : 'not_array',
            stud_id_value: (tickets[0] as any).stud_id,
          } : null,
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
