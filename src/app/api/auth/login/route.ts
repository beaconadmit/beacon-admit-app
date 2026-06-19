import { NextRequest, NextResponse } from "next/server";

const BACKEND = "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const url = `${BACKEND}${path}${request.nextUrl.search}`;
  
  try {
    const body = await request.text();
    const headers: Record<string, string> = {};
    const auth = request.headers.get("authorization");
    if (auth) headers["Authorization"] = auth;
    headers["Content-Type"] = "application/json";
    
    const res = await fetch(url, { headers, method: "POST", body });
    const data = await res.text();
    return new NextResponse(data, { 
      status: res.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
