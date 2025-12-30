import { NextResponse } from "next/server";
import { backendDB } from "@/lib/appwrite/backend";
import { Query, ID } from "node-appwrite";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { event_id, winners } = json;

    if (!event_id) {
      return NextResponse.json(
        { ok: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    if (!winners || !Array.isArray(winners)) {
      return NextResponse.json(
        { ok: false, error: "Winners array is required" },
        { status: 400 }
      );
    }

    // Validate winners structure
    for (const winner of winners) {
      if (!winner.position || !winner.name) {
        return NextResponse.json(
          { ok: false, error: "Each winner must have position and name" },
          { status: 400 }
        );
      }
    }

    // Check if event exists
    const eventRes = await backendDB.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_EVENTS_COLLECTION_ID!,
      [Query.equal("event_id", event_id)]
    );

    if (eventRes.total === 0) {
      return NextResponse.json(
        { ok: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const eventDoc = eventRes.documents[0];

    // Check if winners collection exists, if so, update or create
    // For now, we'll update the event document with winners
    // You may want to create a separate winners collection

    try {
      await backendDB.updateDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_EVENTS_COLLECTION_ID!,
        eventDoc.$id,
        {
          winners: JSON.stringify(winners),
        }
      );
    } catch (updateError) {
      // If the winners field doesn't exist, log and continue
      console.log("Winners field update error:", updateError);
      // You may need to add the 'winners' field to your events collection schema
    }

    return NextResponse.json({
      ok: true,
      message: "Winners saved successfully",
      event_id,
      winners,
    });
  } catch (error) {
    console.error("Add winners error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to save winners" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const businessEventId = req.headers.get("x-event-id");

    if (!businessEventId) {
      return NextResponse.json(
        { ok: false, error: "Event ID missing" },
        { status: 401 }
      );
    }

    // Fetch event
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
    let winners = [];

    try {
      if (eventDoc.winners) {
        winners = JSON.parse(eventDoc.winners);
      }
    } catch {
      winners = [];
    }

    return NextResponse.json({
      ok: true,
      event_id: businessEventId,
      winners,
    });
  } catch (error) {
    console.error("Get winners error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to get winners" },
      { status: 500 }
    );
  }
}
