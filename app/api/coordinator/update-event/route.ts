import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendDB } from "@/lib/appwrite/backend";
import { z } from "zod";

const UpdateEventSchema = z.object({
  venue: z.string().optional(),
  time: z.string().optional(),
  slot: z.string().optional(),
  completed: z.boolean().optional(),
});

export async function POST(req: Request) {
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

    // 2️⃣ Parse and validate request body
    const json = await req.json();
    const result = UpdateEventSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const { venue, time, slot, completed } = result.data;

    // 3️⃣ Build update object (only include provided fields)
    const updateData: Record<string, string | boolean | number> = {};
    if (venue !== undefined) updateData.venue = venue;
    if (time !== undefined) updateData.time = time;
    if (slot !== undefined) updateData.slot = slot;
    if (completed !== undefined) updateData.completed = completed;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { ok: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    // 4️⃣ Update event in Appwrite
    await getBackendDB().updateDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_EVENTS_COLLECTION_ID!,
      eventId,
      updateData
    );

    return NextResponse.json({
      ok: true,
      message: "Event updated successfully",
      updated: updateData,
    });

  } catch (error: any) {
    console.error("Update event error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Get event ID from secure cookie
    const cookieStore = await cookies();
    const eventId = cookieStore.get("coord_event")?.value;

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated as coordinator" },
        { status: 401 }
      );
    }

    // Fetch current event data
    const event = await getBackendDB().getDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_EVENTS_COLLECTION_ID!,
      eventId
    );

    return NextResponse.json({
      ok: true,
      event: {
        venue: event.venue || "",
        time: event.time || "",
        slot: event.slot || "",
      },
    });

  } catch (error) {
    console.error("Get event details error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to get event details" },
      { status: 500 }
    );
  }
}
