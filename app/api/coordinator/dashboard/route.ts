import { NextResponse } from "next/server";
import { backendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";

export async function GET(req: Request) {
  try {
    // 1️⃣ Get business event_id from header
    const businessEventId = req.headers.get("x-event-id");

    if (!businessEventId) {
      return NextResponse.json(
        { ok: false, error: "Event ID missing" },
        { status: 401 }
      );
    }

    // 2️⃣ Fetch event using business event_id
    const eventRes = await backendDB.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_EVENTS_COLLECTION_ID!,
      [Query.equal("event_id", businessEventId)]
    );

    if (eventRes.total === 0) {
      return NextResponse.json(
        { ok: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const eventDoc = eventRes.documents[0];
    const eventAppwriteId = eventDoc.$id;

    // 3️⃣ Fetch tickets (registrations)
    const ticketsRes = await backendDB.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_TICKETS_COLLECTION_ID!,
      [Query.equal("event_id", eventAppwriteId)]
    );

    const totalRegistrations = ticketsRes.total;

    let totalParticipants = 0;
    for (const ticket of ticketsRes.documents) {
      totalParticipants += ticket.stud_id?.length ?? 0;
    }

    // 4️⃣ Fetch attendance (INDIVIDUAL attendance) - use Appwrite ID
    const attendanceRes = await backendDB.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!,
      [Query.equal("event_id", eventAppwriteId)]
    );

    const checkedInParticipants = attendanceRes.total;

    // 5️⃣ Final response
    return NextResponse.json({
      ok: true,
      event: {
        event_id: eventDoc.event_id,
        event_name: eventDoc.event_name,
        completed: eventDoc.completed,
      },
      stats: {
        total_registrations: totalRegistrations,
        total_participants: totalParticipants,
        checked_in_participants: checkedInParticipants,
        not_checked_in_participants:
          totalParticipants - checkedInParticipants,
      },
    });

  } catch (error) {
    console.error("Coordinator dashboard error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to load coordinator dashboard" },
      { status: 500 }
    );
  }
}
