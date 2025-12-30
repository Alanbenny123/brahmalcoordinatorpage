import { NextResponse } from "next/server";
import { CloseTicketSchema } from "@/lib/validations/schemas";
import { backendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const result = CloseTicketSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: (result.error as any).errors[0].message },
        { status: 400 }
      );
    }

    const { event_id } = result.data;

    // 2️⃣ Fetch event
    const event = await backendDB.getDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_EVENTS_COLLECTION_ID!,
      event_id
    );

    // 3️⃣ If already completed, exit safely
    if (event.completed === true) {
      return NextResponse.json({
        ok: true,
        message: "Event already completed",
      });
    }

    // 4️⃣ Mark event as completed
    await backendDB.updateDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_EVENTS_COLLECTION_ID!,
      event_id,
      {
        completed: true,
      }
    );

    // 5️⃣ Fetch all tickets of this event
    const ticketsRes = await backendDB.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_TICKETS_COLLECTION_ID!,
      [Query.equal("event_id", event_id)]
    );

    // 6️⃣ Deactivate all tickets
    await Promise.all(
      ticketsRes.documents.map((ticket) =>
        backendDB.updateDocument(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_TICKETS_COLLECTION_ID!,
          ticket.$id,
          { active: false }
        )
      )
    );

    return NextResponse.json({
      ok: true,
      message: "Event completed and all tickets closed",
      tickets_closed: ticketsRes.total,
    });

  } catch (error) {
    console.error("Event completion error:", error);

    return NextResponse.json(
      { ok: false, error: "Failed to complete event" },
      { status: 500 }
    );
  }
}
