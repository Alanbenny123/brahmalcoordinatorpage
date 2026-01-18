import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const response = NextResponse.json({ success: true });
  
  // Clear coordinator session cookies
  response.cookies.delete('coord_session');
  response.cookies.delete('coord_event');
  
  return response;
}
