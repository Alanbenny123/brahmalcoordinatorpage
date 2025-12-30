import { NextResponse } from "next/server";
import { backendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";
import crypto from "crypto";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const EVENTS_COLLECTION = process.env.APPWRITE_EVENTS_COLLECTION_ID!;

export async function POST(req: Request) {
  try {
    // Check env vars
    if (!DB_ID || !EVENTS_COLLECTION) {
      console.error("Missing env vars:", { DB_ID, EVENTS_COLLECTION });
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { event_id, event_pass } = body;

    // Basic validation
    if (!event_id || !event_pass) {
      return NextResponse.json(
        { success: false, error: "Event ID and password are required" },
        { status: 400 }
      );
    }

    // Find event by event_id
    const eventList = await backendDB.listDocuments(
      DB_ID,
      EVENTS_COLLECTION,
      [Query.equal("event_id", event_id)]
    );

    if (!eventList.total || !eventList.documents?.length) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    const event = eventList.documents[0];

    // Direct password comparison (plain text as per your DB)
    if (event.event_pass !== event_pass) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    const token = crypto.randomUUID();

    return NextResponse.json({
      success: true,
      token,
      coordinator: {
        id: event.$id,
        event_id: event.event_id,
        event_name: event.event_name,
      },
    });
  } catch (err: any) {
    console.error("Coordinator login error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

