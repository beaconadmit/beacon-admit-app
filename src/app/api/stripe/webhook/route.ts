import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StripeEvent = {
  id?: string;
  type: string;
  data: { object: any };
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${key}` } },
  });
}

function verifyStripeSignature(payload: string, signatureHeader: string | null, webhookSecret: string) {
  if (!signatureHeader) return false;

  const parts = signatureHeader.split(",").reduce<Record<string, string[]>>((acc, part) => {
    const [key, value] = part.split("=", 2);
    if (!key || !value) return acc;
    acc[key] = [...(acc[key] || []), value];
    return acc;
  }, {});

  const timestamp = parts.t?.[0];
  const signatures = parts.v1 || [];
  if (!timestamp || signatures.length === 0) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", webhookSecret).update(signedPayload, "utf8").digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return signatures.some((sig) => {
    try {
      const sigBuffer = Buffer.from(sig, "hex");
      return sigBuffer.length === expectedBuffer.length && timingSafeEqual(sigBuffer, expectedBuffer);
    } catch {
      return false;
    }
  });
}

function numberFromMetadata(value: unknown, fallback: number) {
  const parsed = typeof value === "string" || typeof value === "number" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function findTenantIdByCustomer(customerId?: string | null) {
  if (!customerId) return null;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("tenants")
    .select("tenant_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.tenant_id || null;
}

async function updateTenant(tenantId: string | null | undefined, update: Record<string, any>) {
  if (!tenantId || Object.keys(update).length === 0) return;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("tenants").update(update).eq("tenant_id", tenantId);
  if (error) throw new Error(error.message);
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook secret missing" }, { status: 500 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!verifyStripeSignature(payload, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const object = event.data?.object || {};

  if (event.type === "checkout.session.completed") {
    const metadata = object.metadata || {};
    const tenantId = metadata.tenant_id;
    await updateTenant(tenantId, {
      stripe_customer_id: typeof object.customer === "string" ? object.customer : null,
      plan_tier: metadata.plan_tier || "starter",
      included_minutes: Math.round(numberFromMetadata(metadata.included_minutes, 250)),
      overage_rate: numberFromMetadata(metadata.overage_rate, 0.05),
    });
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const metadata = object.metadata || {};
    const tenantId = metadata.tenant_id || await findTenantIdByCustomer(typeof object.customer === "string" ? object.customer : null);
    const update: Record<string, any> = {};
    if (metadata.plan_tier) update.plan_tier = metadata.plan_tier;
    if (metadata.included_minutes) update.included_minutes = Math.round(numberFromMetadata(metadata.included_minutes, 250));
    if (metadata.overage_rate) update.overage_rate = numberFromMetadata(metadata.overage_rate, 0.05);
    await updateTenant(tenantId, update);
  }

  if (event.type === "customer.subscription.deleted") {
    const metadata = object.metadata || {};
    const tenantId = metadata.tenant_id || await findTenantIdByCustomer(typeof object.customer === "string" ? object.customer : null);
    await updateTenant(tenantId, {
      plan_tier: "free",
      included_minutes: 100,
      overage_rate: 0.06,
    });
  }

  return NextResponse.json({ received: true });
}
