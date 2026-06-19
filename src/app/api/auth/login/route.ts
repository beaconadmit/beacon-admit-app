import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL=proces..._URL || "";
const SUPABASE_KEY=proces..._KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // Get tenant info
  const { data: tenant } = await supabase
    .from("tenants")
    .select("tenant_id, center_name, plan_tier, included_minutes, overage_rate")
    .eq("supabase_uid", data.user.id)
    .single();

  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    tenant_id: tenant?.tenant_id,
    center_name: tenant?.center_name,
    plan_tier: tenant?.plan_tier || "starter",
    included_minutes: tenant?.included_minutes || 500,
    overage_rate: tenant?.overage_rate || 0.12,
  });
}
