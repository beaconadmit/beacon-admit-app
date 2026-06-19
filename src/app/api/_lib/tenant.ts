import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export type TenantContext = {
  tenant_id: string;
  center_name: string | null;
  authorized_agent_ids: string[];
  plan_tier?: string | null;
  included_minutes?: number | null;
  overage_rate?: number | null;
};

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL missing");
  return url;
}

function getSupabaseServiceKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return key;
}

function createAuthClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function createAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        Authorization: `Bearer ${getSupabaseServiceKey()}`,
      },
    },
  });
}

function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function getTenantContext(request: NextRequest): Promise<TenantContext | NextResponse> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized("Missing bearer token");

  const authClient = createAuthClient();
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) return unauthorized("Invalid bearer token");

  const adminClient = createAdminClient();
  const { data: tenant, error: tenantError } = await adminClient
    .from("tenants")
    .select("tenant_id, center_name, authorized_agent_ids, plan_tier, included_minutes, overage_rate")
    .eq("supabase_uid", userData.user.id)
    .maybeSingle();

  if (tenantError) {
    return NextResponse.json({ error: tenantError.message }, { status: 500 });
  }
  if (!tenant) return forbidden("No tenant mapped for user");

  return {
    tenant_id: tenant.tenant_id,
    center_name: tenant.center_name ?? null,
    authorized_agent_ids: tenant.authorized_agent_ids || [],
    plan_tier: tenant.plan_tier,
    included_minutes: tenant.included_minutes,
    overage_rate: tenant.overage_rate,
  };
}

export function isTenantContext(value: TenantContext | NextResponse): value is TenantContext {
  return !(value instanceof NextResponse);
}

export function isAuthorizedAgent(tenant: TenantContext, agentId?: string | null) {
  return !!agentId && tenant.authorized_agent_ids.includes(agentId);
}
