import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchEvent, fetchTicketsForEvent, fetchAttendanceForEvent, fetchUsers } from "@/lib/data-fetcher";

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

    // 2️⃣ Verify event exists using smart fetcher
    const { event, success: eventSuccess } = await fetchEvent(eventId);

    if (!eventSuccess || !event) {
      return NextResponse.json(
        { ok: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Fetch tickets using smart fetcher
    const { tickets } = await fetchTicketsForEvent(eventId);

    // 4️⃣ Fetch attendance using smart fetcher
    const { attendance } = await fetchAttendanceForEvent(eventId);

    const checkedInSet = new Set<string>();
    for (const record of attendance) {
      checkedInSet.add((record as any).stud_id);
    }

    // 5️⃣ Collect all unique student IDs
    const studentIds = new Set<string>();
    for (const ticket of tickets) {
      const studIds = (ticket as any).stud_id ?? [];
      for (const studId of studIds) {
        studentIds.add(studId);
      }
    }

    // 6️⃣ Fetch users using smart fetcher
    const { users } = await fetchUsers(Array.from(studentIds));

    const userMap = new Map<string, string>();
    for (const user of users) {
      userMap.set(user.$id, (user as any).name);
    }

    // 7️⃣ Build participants list
    const participants: {
      team_name: string | null;
      student_name: string;
      checked_in: boolean;
    }[] = [];

    for (const ticket of tickets) {
      const ticketData = ticket as any;
      const teamName = ticketData.team_name ?? null;
      const studIds = ticketData.stud_id ?? [];

      for (const studId of studIds) {
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
