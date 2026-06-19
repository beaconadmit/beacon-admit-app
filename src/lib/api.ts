"use client";

const API_BASE = "/api/wrapper";

function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("beacon_access_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function fetchJSON(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: authHeaders(options.headers || {}),
  });
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
}

export async function getAgents() {
  const data = await fetchJSON("/agents", { method: "POST", body: "{}" });
  return data?.items || data || [];
}

export async function getPhoneNumbers() {
  const data = await fetchJSON("/phone-numbers");
  return data?.items || data || [];
}

export async function getCalls(limit = 50, offset = 0) {
  const data = await fetchJSON("/calls", {
    method: "POST",
    body: JSON.stringify({ limit, skip: offset, sort_order: "descending" }),
  });
  return data?.items || data || [];
}

export async function getCall(callId: string) {
  return fetchJSON(`/calls?call_id=${encodeURIComponent(callId)}`);
}

// Prefer call.recording_url returned by getCall/getCalls. This fallback is intentionally not used for protected fetches.
export function getAudioUrl(callId: string): string {
  return `https://api.retellai.com/v2/get-audio/${callId}`;
}

export async function getAnalytics() {
  const calls = await getCalls(100);
  const totalMinutes = calls.reduce((sum: number, c: any) => sum + (c.duration_ms || 0) / 60000, 0);
  return {
    total_calls: calls.length,
    total_minutes: Math.round(totalMinutes * 10) / 10,
    avg_duration: calls.length ? Math.round((totalMinutes / calls.length) * 10) / 10 : 0,
    daily_calls: [],
  };
}

export async function getBilling() {
  return {
    plan_tier: "starter",
    included_minutes: 500,
    used_minutes: 0,
    overage_minutes: 0,
    overage_rate: 0.12,
    overage_cost: 0,
  };
}
