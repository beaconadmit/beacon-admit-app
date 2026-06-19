import { NextRequest, NextResponse } from "next/server";
import { getTenantContext, isTenantContext, isAuthorizedAgent } from "../../_lib/tenant";

export async function POST(request: NextRequest) {
  const tenant = await getTenantContext(request);
  if (!isTenantContext(tenant)) return tenant;

  const body = await request.json().catch(() => ({}));
  const res = await fetch("https://api.retellai.com/v2/list-agents", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RETELL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const agents = Array.isArray(data) ? data : data.items || [];
  const filtered = agents.filter((agent: any) => isAuthorizedAgent(tenant, agent.agent_id));

  if (Array.isArray(data)) return NextResponse.json(filtered);
  return NextResponse.json({ ...data, items: filtered });
}
