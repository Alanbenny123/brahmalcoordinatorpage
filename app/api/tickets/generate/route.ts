import { NextResponse } from "next/server";
import { GenerateTicketSchema } from "@/lib/validations/schemas";
import { ID } from "node-appwrite";
import { backendDB } from "@/lib/appwrite/backend";

export async function POST(req: Request) {
  try {

    // 1️⃣ Read request body
    const json = await req.json();
    const result = GenerateTicketSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: (result.error as any).errors[0].message },
        { status: 400 }
      );
    }

    const { event_id, stud_ids, team_name } = result.data;

    // 3️⃣ Prepare ticket data
    const ticketData: any = {
      event_id,
      stud_id: stud_ids,
      active: true,
    };

    // Handle team_name
    if (stud_ids.length === 1) {
      // Individual registration - use user's name as team_name
      const userDoc = await backendDB.getDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USERS_COLLECTION_ID!,
        stud_ids[0]
      );
      ticketData.team_name = userDoc.name;
    } else if (team_name) {
      // Group registration - use provided team_name
      ticketData.team_name = team_name;
    }

    // Create ticket document
    const ticket = await backendDB.createDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_TICKETS_COLLECTION_ID!,
      ID.unique(),
      ticketData
    );

    // 4️⃣ Add ticket ID to each user's tickets[] array
    const userUpdatePromises = stud_ids.map(async (user_id: string) => {
      // Fetch user document
      const userDoc = await backendDB.getDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USERS_COLLECTION_ID!,
        user_id
      );

      const existingTickets = Array.isArray(userDoc.tickets)
        ? userDoc.tickets
        : [];

      // Append new ticket ID
      return backendDB.updateDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USERS_COLLECTION_ID!,
        user_id,
        {
          tickets: [...existingTickets, ticket.$id],
        }
      );
    });

    await Promise.all(userUpdatePromises);

    // 6️⃣ Return success response
    return NextResponse.json({
      ok: true,
      ticket_id: ticket.$id,
      event_id,
    });

  } catch (error) {
    console.error("Ticket generation error:", error);

    return NextResponse.json(
      { ok: false, error: "Ticket generation failed" },
      { status: 500 }
    );
  }
}
