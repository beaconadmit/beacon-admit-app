import { NextRequest, NextResponse } from "next/server";

const RETELL_API_KEY = process.env.RETELL_API_KEY || "";
const RETELL_BASE = "https://api.retellai.com";

async function retellGet(path: string) {
  const res = await fetch(`${RETELL_BASE}${path}`, {
    headers: { "Authorization": `Bearer ${RETELL_API_KEY}` },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

async function retellPost(path: string, body: any = {}) {
  const res = await fetch(`${RETELL_BASE}${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RETELL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/**
 * Unified Retell proxy for Vercel serverless functions.
 *
 * Routes:
 *   POST /api/wrapper/agents          → POST /v2/list-agents
 *   GET  /api/wrapper/phone-numbers   → GET  /v2/list-phone-numbers
 *   POST /api/wrapper/calls           → POST /v3/list-calls
 *   GET  /api/wrapper/calls/:id       → GET  /v2/get-call/:id
 */
export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname.replace("/api/wrapper", "");

  // List phone numbers
  if (path === "/phone-numbers") {
    return retellGet("/v2/list-phone-numbers");
  }

  // Get single call
  if (path.startsWith("/calls/")) {
    const callId = path.replace("/calls/", "");
    return retellGet(`/v2/get-call/${callId}`);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname.replace("/api/wrapper", "");
  const body = await request.json().catch(() => ({}));

  // List agents
  if (path === "/agents") {
    return retellPost("/v2/list-agents", body);
  }

  // List calls
  if (path === "/calls") {
    return retellPost("/v3/list-calls", {
      limit: body.limit || 50,
      pagination_key: body.pagination_key,
      skip: body.skip || 0,
      sort_order: body.sort_order || "descending",
    });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
