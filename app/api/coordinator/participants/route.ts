import { NextResponse } from "next/server";
import { backendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";

export async function GET(req: Request) {
  try {
    // 1️⃣ Get event ID (Appwrite document ID)
    const eventId = req.headers.get("x-event-id");

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: "Event ID missing" },
        { status: 401 }
      );
    }

    // 2️⃣ Verify event exists
    const eventDoc = await backendDB.getDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_EVENTS_COLLECTION_ID!,
      eventId
    );

    if (!eventDoc) {
      return NextResponse.json(
        { ok: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const eventAppwriteId = eventId;

    // 3️⃣ Fetch tickets for event
    const ticketsRes = await backendDB.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_TICKETS_COLLECTION_ID!,
      [Query.equal("event_id", eventAppwriteId)]
    );

    // 4️⃣ Fetch attendance (INDIVIDUAL) - use Appwrite ID
    const attendanceRes = await backendDB.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!,
      [Query.equal("event_id", eventAppwriteId)]
    );

    const checkedInSet = new Set<string>();
    for (const record of attendanceRes.documents) {
      checkedInSet.add(record.stud_id);
    }

    // 5️⃣ Collect all unique student IDs
    const studentIds = new Set<string>();
    for (const ticket of ticketsRes.documents) {
      for (const studId of ticket.stud_id ?? []) {
        studentIds.add(studId);
      }
    }

    // 6️⃣ Fetch users (names)
    const usersRes = await backendDB.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_USERS_COLLECTION_ID!,
      [Query.equal("$id", Array.from(studentIds))]
    );

    const userMap = new Map<string, string>();
    for (const user of usersRes.documents) {
      userMap.set(user.$id, user.name);
    }

    // 7️⃣ Build participants list
    const participants: {
      team_name: string | null;
      student_name: string;
      checked_in: boolean;
    }[] = [];

    for (const ticket of ticketsRes.documents) {
      const teamName = ticket.team_name ?? null;

      for (const studId of ticket.stud_id ?? []) {
        participants.push({
          team_name: teamName,
          student_name: userMap.get(studId) ?? "Unknown",
          checked_in: checkedInSet.has(studId),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      count: participants.length,
      participants,
    });

  } catch (error) {
    console.error("Participants list error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to load participants list" },
      { status: 500 }
    );
  }
}
