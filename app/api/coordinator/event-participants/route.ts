import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const EVENTS_COLLECTION = process.env.APPWRITE_EVENTS_COLLECTION_ID!;
const TICKETS_COLLECTION = process.env.APPWRITE_TICKETS_COLLECTION_ID!;
const USERS_COLLECTION = process.env.APPWRITE_USERS_COLLECTION_ID!;
const ATTENDANCE_COLLECTION = process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!;

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

    // Get event ID from query params
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("event_id");

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const db = getBackendDB();

    // Verify event exists
    let event;
    try {
      event = await db.getDocument(DB_ID, EVENTS_COLLECTION, eventId);
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Fetch tickets for this event
    const ticketsRes = await db.listDocuments(
      DB_ID,
      TICKETS_COLLECTION,
      [Query.equal("event_id", eventId), Query.limit(500)]
    );
    const tickets = ticketsRes.documents;

    // Fetch attendance for this event
    const attendanceRes = await db.listDocuments(
      DB_ID,
      ATTENDANCE_COLLECTION,
      [Query.equal("event_id", eventId), Query.limit(500)]
    );
    const checkedInSet = new Set<string>();
    for (const record of attendanceRes.documents) {
      checkedInSet.add((record as any).stud_id);
    }

    // Collect all student IDs
    const uniqueStudentIds = new Set<string>();

    for (const ticket of tickets) {
      const ticketData = ticket as any;
      const studIds = ticketData.stud_id ?? [];

      if (Array.isArray(studIds)) {
        for (const studId of studIds) {
          if (studId) uniqueStudentIds.add(studId);
        }
      } else if (studIds) {
        uniqueStudentIds.add(String(studIds));
      }
    }

    // Fetch user details
    const userMap = new Map<
      string,
      { name: string; email: string; phone: string; college: string }
    >();

    const uniqueIds = Array.from(uniqueStudentIds);

    if (uniqueIds.length > 0) {
      try {
        const batchSize = 100;
        for (let i = 0; i < uniqueIds.length; i += batchSize) {
          const batch = uniqueIds.slice(i, i + batchSize);
          const usersRes = await db.listDocuments(DB_ID, USERS_COLLECTION, [
            Query.equal("$id", batch),
            Query.limit(batchSize),
          ]);
          for (const user of usersRes.documents) {
            const userData = user as any;
            userMap.set(user.$id, {
              name: userData.name || "Unknown",
              email: userData.email || "",
              phone: userData.phone || userData.phno || "",
              college: userData.college || "",
            });
          }
        }
      } catch (e) {
        console.error("Error fetching users:", e);
      }

      // Fallback: if no users found, try fetching all users
      if (userMap.size === 0 && uniqueIds.length > 0) {
        try {
          const allUsersRes = await db.listDocuments(DB_ID, USERS_COLLECTION, [
            Query.limit(1000),
          ]);

          for (const user of allUsersRes.documents) {
            const userData = user as any;
            for (const studId of uniqueIds) {
              if (
                user.$id === studId ||
                userData.email === studId ||
                userData.phone === studId ||
                userData.stud_id === studId
              ) {
                userMap.set(studId, {
                  name: userData.name || "Unknown",
                  email: userData.email || "",
                  phone: userData.phone || userData.phno || "",
                  college: userData.college || "",
                });
                break;
              }
            }
          }
        } catch (e) {
          console.error("Fallback user fetch failed:", e);
        }
      }
    }

    // Build participants list
    const participants: {
      team_name: string | null;
      student_name: string;
      email: string;
      phone: string;
      college: string;
      stud_id: string;
      checked_in: boolean;
    }[] = [];

    for (const ticket of tickets) {
      const ticketData = ticket as any;
      const teamName = ticketData.team_name ?? null;
      const studIds = ticketData.stud_id ?? [];

      if (Array.isArray(studIds)) {
        for (const studId of studIds) {
          const userInfo = userMap.get(studId) || {
            name: "Unknown",
            email: "",
            phone: "",
            college: "",
          };
          participants.push({
            team_name: teamName,
            student_name: userInfo.name,
            email: userInfo.email,
            phone: userInfo.phone,
            college: userInfo.college,
            stud_id: studId,
            checked_in: checkedInSet.has(studId),
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      event_name: (event as any).event_name,
      count: participants.length,
      participants,
    });
  } catch (error: any) {
    console.error("Event participants error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Failed to load event participants",
      },
      { status: 500 }
    );
  }
}
