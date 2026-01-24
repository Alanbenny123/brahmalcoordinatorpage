import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/hash";
import { checkRateLimit, clearRateLimit, getResetTime } from "@/lib/rate-limiter";
import crypto from "crypto";

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
    
    // Allow requests from same origin or localhost in development
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

    const body = await req.json();
    const { coordinator_id, coordinator_pass } = body;

    // 4. Input validation
    if (!coordinator_id?.trim() || !coordinator_pass?.trim()) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Get credentials from environment variables OR use hardcoded values
    const MAIN_COORDINATOR_ID = process.env.MAIN_COORDINATOR_ID || "admin";
    
    // Bcrypt hash of password: $Fgff7#bd32
    // To generate a new hash, run: node generate-hash.js 'YourNewPassword'
    const MAIN_COORDINATOR_PASS = process.env.MAIN_COORDINATOR_PASS || "$2b$10$jmcRdLNVttvAdyBsyjO/zOPvtS/tcDLvSvnnFyZMea8vDRn4QnqL2";
  
    // 5. Verify credentials (constant-time comparison)
    const idMatch = coordinator_id === MAIN_COORDINATOR_ID;
    
    // Check if password is hashed (starts with $2a$ or $2b$ for bcrypt)
    let passwordValid = false;
    if (MAIN_COORDINATOR_PASS.startsWith('$2')) {
      // Hashed password - bcrypt.compare is already constant-time
      passwordValid = await verifyPassword(MAIN_COORDINATOR_PASS, coordinator_pass);
    } else {
      // Plain text password (for development only)
      passwordValid = coordinator_pass === MAIN_COORDINATOR_PASS;
    }

    // 6. Don't specify which field is wrong (security best practice)
    if (!idMatch || !passwordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 7. Clear rate limit on successful login
    clearRateLimit(ip);

    // 8. Generate secure session token
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    const response = NextResponse.json({
      success: true,
      expiresAt,
      coordinator: {
        id: "main",
        type: "main",
        name: "Main Coordinator",
      },
    });

    // 9. Set secure httpOnly cookies (no coord_event for main coordinator)
    const isProduction = process.env.NODE_ENV === 'production';
    
    response.cookies.set('coord_session', token, {
      httpOnly: true,
      sameSite: 'strict', // Changed to 'strict' for better CSRF protection
      secure: isProduction, // Only send over HTTPS in production
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Set a flag to indicate this is a main coordinator
    response.cookies.set('coord_type', 'main', {
      httpOnly: true,
      sameSite: 'strict',
      secure: isProduction,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error("Main coordinator login error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
