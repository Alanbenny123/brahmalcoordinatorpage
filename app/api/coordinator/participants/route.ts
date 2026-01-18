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
    // 1️⃣ Get event ID from secure cookie
    const cookieStore = await cookies();
    const eventId = cookieStore.get("coord_event")?.value;

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated as coordinator" },
        { status: 401 }
      );
    }

    const db = getBackendDB();

    // 2️⃣ Verify event exists
    let event;
    try {
      event = await db.getDocument(DB_ID, EVENTS_COLLECTION, eventId);
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Fetch tickets for this event
    const ticketsRes = await db.listDocuments(
      DB_ID,
      TICKETS_COLLECTION,
      [Query.equal('event_id', eventId), Query.limit(500)]
    );
    const tickets = ticketsRes.documents;

    // 4️⃣ Fetch attendance for this event
    const attendanceRes = await db.listDocuments(
      DB_ID,
      ATTENDANCE_COLLECTION,
      [Query.equal('event_id', eventId), Query.limit(500)]
    );
    const checkedInSet = new Set<string>();
    for (const record of attendanceRes.documents) {
      checkedInSet.add((record as any).stud_id);
    }

    // 5️⃣ Collect all unique student IDs from tickets
    const studentIds: string[] = [];
    for (const ticket of tickets) {
      const studIds = (ticket as any).stud_id ?? [];
      if (Array.isArray(studIds)) {
        for (const studId of studIds) {
          if (studId && !studentIds.includes(studId)) {
            studentIds.push(studId);
          }
        }
      }
    }

    // 6️⃣ Try multiple strategies to fetch user details
    const userMap = new Map<string, { name: string; email: string; phone: string; college: string }>();

    if (studentIds.length > 0) {
      // Strategy 1: Query by $id (document ID)
      try {
        // Appwrite has a limit on array queries, batch if needed
        const batchSize = 100;
        for (let i = 0; i < studentIds.length; i += batchSize) {
          const batch = studentIds.slice(i, i + batchSize);
          const usersRes = await db.listDocuments(
            DB_ID,
            USERS_COLLECTION,
            [Query.equal('$id', batch), Query.limit(batchSize)]
          );
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
        console.error("Strategy 1 (Query by $id) failed:", e);
      }

      // Strategy 2: If Strategy 1 found nothing, try querying by email or other fields
      // (In case stud_id contains email instead of document ID)
      if (userMap.size === 0) {
        console.log("Strategy 1 found 0 users, trying Strategy 2 (query by email)...");
        try {
          // Check if studentIds look like emails
          const emailLikeIds = studentIds.filter(id => id.includes('@'));
          if (emailLikeIds.length > 0) {
            for (const email of emailLikeIds) {
              const usersRes = await db.listDocuments(
                DB_ID,
                USERS_COLLECTION,
                [Query.equal('email', email), Query.limit(1)]
              );
              if (usersRes.documents.length > 0) {
                const userData = usersRes.documents[0] as any;
                userMap.set(email, {
                  name: userData.name || "Unknown",
                  email: userData.email || email,
                  phone: userData.phone || userData.phno || "",
                  college: userData.college || "",
                });
              }
            }
          }
        } catch (e) {
          console.error("Strategy 2 (Query by email) failed:", e);
        }
      }

      // Strategy 3: Fetch ALL users and match (last resort, expensive)
      if (userMap.size === 0 && studentIds.length > 0) {
        console.log("Strategy 2 found 0 users, trying Strategy 3 (fetch all users)...");
        try {
          const allUsersRes = await db.listDocuments(
            DB_ID,
            USERS_COLLECTION,
            [Query.limit(1000)]
          );
          
          // Try to match by various fields
          for (const user of allUsersRes.documents) {
            const userData = user as any;
            // Check if any studentId matches user.$id, email, or phone
            for (const studId of studentIds) {
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
          console.error("Strategy 3 (Fetch all users) failed:", e);
        }
      }
    }

    // 7️⃣ Build participants list with full details
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
          const userInfo = userMap.get(studId) || { name: "Unknown", email: "", phone: "", college: "" };
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
      count: participants.length,
      participants,
      _debug: {
        ticketsCount: tickets.length,
        uniqueStudentIds: studentIds.length,
        usersFound: userMap.size,
        strategies: userMap.size > 0 ? "matched" : "none_matched",
        sampleStudIds: studentIds.slice(0, 3),
      }
    });

  } catch (error: any) {
    console.error("Participants list error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to load participants list" },
      { status: 500 }
    );
  }
}
