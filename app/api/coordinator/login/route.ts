import { NextResponse } from "next/server";
import { backendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";
import { verifyPassword } from "@/lib/hash";
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

    // Find event by Appwrite document ID
    let event;
    try {
      event = await backendDB.getDocument(
        DB_ID,
        EVENTS_COLLECTION,
        event_id
      );
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Verify hashed password
    const valid = await verifyPassword(event.event_pass, event_pass);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    const token = crypto.randomUUID();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now

    const response = NextResponse.json({
      success: true,
      expiresAt,
      coordinator: {
        id: event.$id,
        event_name: event.event_name,
      },
    });

    // Set httpOnly cookies for session
    response.cookies.set('coord_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    response.cookies.set('coord_event', event.$id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (err: any) {
    console.error("Coordinator login error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

