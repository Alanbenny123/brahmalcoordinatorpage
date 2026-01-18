import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const TICKETS_COLLECTION = process.env.APPWRITE_TICKETS_COLLECTION_ID!;
const EVENTS_COLLECTION = process.env.APPWRITE_EVENTS_COLLECTION_ID!;

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const eventId = cookieStore.get("coord_event")?.value;

    if (!eventId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get event directly from Appwrite
    let event = null;
    try {
      event = await getBackendDB().getDocument(DB_ID, EVENTS_COLLECTION, eventId);
    } catch (e) {
      console.error("Event fetch error:", e);
    }

    // Get tickets directly from Appwrite
    let tickets: any[] = [];
    try {
      const ticketsRes = await getBackendDB().listDocuments(
        DB_ID,
        TICKETS_COLLECTION,
        [Query.equal('event_id', eventId)]
      );
      tickets = ticketsRes.documents;
    } catch (e) {
      console.error("Tickets fetch error:", e);
    }

    return NextResponse.json({
      eventId,
      eventExists: !!event,
      eventName: event?.event_name || null,
      ticketsCount: tickets.length,
      tickets: tickets.map((t: any) => ({
        id: t.$id,
        team_name: t.team_name,
        stud_id: t.stud_id,
        active: t.active,
      })),
      env: {
        DB_ID: DB_ID ? "SET" : "MISSING",
        TICKETS_COLLECTION: TICKETS_COLLECTION ? "SET" : "MISSING",
        EVENTS_COLLECTION: EVENTS_COLLECTION ? "SET" : "MISSING",
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
