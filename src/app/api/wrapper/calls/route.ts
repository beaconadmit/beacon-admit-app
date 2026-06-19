import { NextRequest, NextResponse } from "next/server";
import { getTenantContext, isTenantContext, isAuthorizedAgent } from "../../_lib/tenant";

async function retellJson(path: string, options: RequestInit = {}) {
  const res = await fetch(`https://api.retellai.com${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${process.env.RETELL_API_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  return { res, data };
}

export async function POST(request: NextRequest) {
  const tenant = await getTenantContext(request);
  if (!isTenantContext(tenant)) return tenant;

  const body = await request.json().catch(() => ({}));
  const { res, data } = await retellJson("/v3/list-calls", {
    method: "POST",
    body: JSON.stringify({
      limit: body.limit || 50,
      pagination_key: body.pagination_key,
      skip: body.skip || 0,
      sort_order: body.sort_order || "descending",
    }),
  });
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const calls = Array.isArray(data) ? data : data.items || [];
  const filtered = calls.filter((call: any) => isAuthorizedAgent(tenant, call.agent_id));

  if (Array.isArray(data)) return NextResponse.json(filtered);
  return NextResponse.json({ ...data, items: filtered });
}

export async function GET(request: NextRequest) {
  const tenant = await getTenantContext(request);
  if (!isTenantContext(tenant)) return tenant;

  const callId = request.nextUrl.searchParams.get("call_id");
  if (!callId) {
    return NextResponse.json({ error: "call_id required" }, { status: 400 });
  }

  const { res, data } = await retellJson(`/v2/get-call/${callId}`);
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  if (!isAuthorizedAgent(tenant, data.agent_id)) {
    return NextResponse.json({ error: "Call not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
