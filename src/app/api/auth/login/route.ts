import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const authClient = createAuthClient();
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    return NextResponse.json({ error: error?.message || "Login failed" }, { status: 401 });
  }

  // Important: use a separate service-role client after signInWithPassword.
  // The auth client now carries the user's session, so RLS would hide tenants.
  const adminClient = createAdminClient();
  const { data: tenant, error: tenantError } = await adminClient
    .from("tenants")
    .select("tenant_id, center_name, plan_tier, included_minutes, overage_rate, authorized_agent_ids")
    .eq("supabase_uid", data.user.id)
    .maybeSingle();

  if (tenantError) {
    return NextResponse.json({ error: tenantError.message }, { status: 500 });
  }

  if (!tenant) {
    return NextResponse.json({ error: "No tenant mapped for this user" }, { status: 403 });
  }

  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    tenant_id: tenant.tenant_id,
    center_name: tenant.center_name,
    plan_tier: tenant.plan_tier || "starter",
    included_minutes: tenant.included_minutes || 500,
    overage_rate: tenant.overage_rate || 0.12,
    authorized_agent_ids: tenant.authorized_agent_ids || [],
  });
}
