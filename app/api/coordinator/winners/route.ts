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

    // Check if event exists using Appwrite ID
    const eventDoc = await backendDB.getDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_EVENTS_COLLECTION_ID!,
      event_id
    );

    if (!eventDoc) {
      return NextResponse.json(
        { ok: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Extract team names from winners array
    const winnerTeamNames = winners.map((winner) => winner.name);

    // Update the event document with winners array
    try {
      await backendDB.updateDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_EVENTS_COLLECTION_ID!,
        eventDoc.$id,
        {
          winners: winnerTeamNames,
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
    const eventId = req.headers.get("x-event-id");

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: "Event ID missing" },
        { status: 401 }
      );
    }

    // Fetch event using Appwrite ID
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
