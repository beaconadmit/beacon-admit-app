"use client";

const API_BASE = "/api/wrapper";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("beacon_access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchJSON(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  if (res.status === 401) {
    localStorage.removeItem("beacon_access_token");
    window.location.href = "/login";
    return null;
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  if (res.headers.get("content-type")?.includes("audio")) {
    return res;
  }
  return res.json();
}

export async function getAgents() { return fetchJSON("/agents") || []; }
export async function getPhoneNumbers() { return fetchJSON("/phone-numbers") || []; }
export async function getCalls(limit = 50, offset = 0) { return fetchJSON(`/calls?limit=${limit}&offset=${offset}`) || []; }
export async function getCall(callId: string) { return fetchJSON(`/calls/${callId}`); }
export function getAudioUrl(callId: string): string { return `${API_BASE}/audio/${callId}`; }
export async function getTranscript(callId: string) { return fetchJSON(`/transcript/${callId}`); }
export async function getAnalytics() { return fetchJSON("/analytics") || {}; }
export async function getBilling() { return fetchJSON("/billing") || {}; }
