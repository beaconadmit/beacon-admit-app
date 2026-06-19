import { NextRequest, NextResponse } from "next/server";
import { getTenantContext, isTenantContext } from "../../_lib/tenant";

function phoneBelongsToTenant(phone: any, authorizedAgentIds: string[]) {
  const directIds = [phone.agent_id, phone.inbound_agent_id, phone.outbound_agent_id].filter(Boolean);
  if (directIds.some((id: string) => authorizedAgentIds.includes(id))) return true;

  const inboundAgents = Array.isArray(phone.inbound_agents) ? phone.inbound_agents : [];
  const outboundAgents = Array.isArray(phone.outbound_agents) ? phone.outbound_agents : [];
  return [...inboundAgents, ...outboundAgents].some((agent: any) => authorizedAgentIds.includes(agent.agent_id || agent));
}

export async function GET(request: NextRequest) {
  const tenant = await getTenantContext(request);
  if (!isTenantContext(tenant)) return tenant;

  const res = await fetch("https://api.retellai.com/v2/list-phone-numbers", {
    headers: {
      "Authorization": `Bearer ${process.env.RETELL_API_KEY}`,
    },
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const phones = Array.isArray(data) ? data : data.items || [];
  const filtered = phones.filter((phone: any) => phoneBelongsToTenant(phone, tenant.authorized_agent_ids));

  if (Array.isArray(data)) return NextResponse.json(filtered);
  return NextResponse.json({ ...data, items: filtered });
}
