import { NextResponse } from "next/server";
import { getBackendDB } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";
import { verifyPassword } from "@/lib/hash";
import { checkRateLimit, clearRateLimit, getResetTime } from "@/lib/rate-limiter";
import crypto from "crypto";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const EVENTS_COLLECTION = process.env.APPWRITE_EVENTS_COLLECTION_ID!;

export async function POST(req: Request) {
  try {
    // 1. Get client IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : 
               req.headers.get("x-real-ip") || 
               "unknown";

    // 2. Check rate limit (5 attempts per 15 minutes)
    if (!checkRateLimit(ip, 5, 15 * 60 * 1000)) {
      const resetTime = getResetTime(ip);
      const minutesRemaining = Math.ceil(resetTime / 60000);
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Too many login attempts. Please try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`,
          retryAfter: resetTime
        },
        { status: 429 }
      );
    }

    // 3. Verify origin (CSRF protection)
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    
    const allowedOrigins = [
      `https://${host}`,
      `http://${host}`,
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.NEXT_PUBLIC_SITE_URL,
    ].filter(Boolean);

    if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed || ""))) {
      return NextResponse.json(
        { success: false, message: "Invalid request origin" },
        { status: 403 }
      );
    }

    // Check env vars
    if (!DB_ID || !EVENTS_COLLECTION) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { event_id, event_pass } = body;

    // 4. Input validation
    if (!event_id?.trim() || !event_pass?.trim()) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Find event by Appwrite document ID
    let event;
    try {
      event = await getBackendDB().getDocument(
        DB_ID,
        EVENTS_COLLECTION,
        event_id
      );
    } catch (error) {
      // Don't reveal whether event exists (security best practice)
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify hashed password
    const valid = await verifyPassword(event.event_pass, event_pass);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 5. Clear rate limit on successful login
    clearRateLimit(ip);

    // 6. Generate secure session token
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    const response = NextResponse.json({
      success: true,
      expiresAt,
      coordinator: {
        id: event.$id,
        event_name: event.event_name,
      },
    });

    // 7. Set secure httpOnly cookies for session
    const isProduction = process.env.NODE_ENV === 'production';
    
    response.cookies.set('coord_session', token, {
      httpOnly: true,
      sameSite: 'strict', // Changed to 'strict' for better CSRF protection
      secure: isProduction,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set('coord_event', event.$id, {
      httpOnly: true,
      sameSite: 'strict',
      secure: isProduction,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set('coord_type', 'event', {
      httpOnly: true,
      sameSite: 'strict',
      secure: isProduction,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
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

