import { NextRequest, NextResponse } from "next/server";

const BACKEND = "http://127.0.0.1:8000";

export async function PATCH(request: NextRequest) {
  const url = `${BACKEND}/api/wrapper/billing/settings${request.nextUrl.search}`;
  try {
    const body = await request.text();
    const auth = request.headers.get("authorization") || "";
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": auth },
      body,
    });
    const data = await res.text();
    return new NextResponse(data, { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}

export async function GET(request: NextRequest) {
  const url = `${BACKEND}/api/wrapper/billing${request.nextUrl.search}`;
  try {
    const auth = request.headers.get("authorization") || "";
    const res = await fetch(url, { headers: { "Authorization": auth } });
    const data = await res.text();
    return new NextResponse(data, { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
