"use client";

const API_BASE = "/api/wrapper";

function authHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

async function fetchJSON(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  if (res.status === 401) {
    window.location.href = "/login";
    return null;
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
}

// Agents — POST
export async function getAgents() {
  const data = await fetchJSON("/agents", { method: "POST", body: "{}" });
  return data?.items || data || [];
}

// Phone numbers — GET
export async function getPhoneNumbers() {
  const data = await fetchJSON("/phone-numbers");
  return data?.items || data || [];
}

// Calls — POST
export async function getCalls(limit = 50, offset = 0) {
  const data = await fetchJSON("/calls", {
    method: "POST",
    body: JSON.stringify({ limit, skip: offset, sort_order: "descending" }),
  });
  return data?.items || data || [];
}

// Single call — GET
export async function getCall(callId: string) {
  return fetchJSON(`/calls/${callId}`);
}

// Audio URL
export function getAudioUrl(callId: string): string {
  return `https://api.retellai.com/v2/get-audio/${callId}`;
}

// Analytics — computed from calls
export async function getAnalytics() {
  const calls = await getCalls(100);
  return { total_calls: calls.length, calls };
}

// Billing — placeholder
export async function getBilling() {
  return { plan_tier: "starter", included_minutes: 500, used_minutes: 0, overage_minutes: 0, overage_rate: 0.12 };
}
