"use client";
import { useState, useEffect } from "react";
import { getBilling } from "@/lib/api";

export default function BillingTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ included_minutes: 0, overage_rate: 0, plan_tier: "" });

  useEffect(() => {
    getBilling().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (data) {
      setForm({
        included_minutes: data.included_minutes,
        overage_rate: data.overage_rate,
        plan_tier: data.plan_tier,
      });
    }
  }, [data]);

  async function saveSettings() {
    setSaving(true);
    try {
      const token = localStorage.getItem("beacon_access_token");
      const res = await fetch("/api/wrapper/billing/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      // Reload
      const updated = await getBilling();
      setData(updated);
      setEditMode(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const pct = data ? Math.min(100, (data.used_minutes / data.included_minutes) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Billing & Usage</h2>
        {!editMode && (
          <button onClick={() => setEditMode(true)}
            className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors">
            Edit Plan
          </button>
        )}
      </div>

      {loading && <p className="text-gray-400">Loading…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {data && !editMode && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#1f2937" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#3b82f6"}
                    strokeWidth="10" strokeDasharray={`${pct * 3.14} ${314 - pct * 3.14}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{Math.round(pct)}%</span>
                </div>
              </div>
              <div className="space-y-2 text-sm flex-1">
                <div className="flex justify-between gap-8">
                  <span className="text-gray-400">Plan</span>
                  <span className="font-medium capitalize">{data.plan_tier}</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-gray-400">Used</span>
                  <span className="font-medium">{data.used_minutes} min</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-gray-400">Included</span>
                  <span className="font-medium">{data.included_minutes} min</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-gray-400">Overage</span>
                  <span className={data.overage_minutes > 0 ? "text-yellow-400 font-medium" : "text-gray-500"}>{data.overage_minutes} min</span>
                </div>
                <div className="flex justify-between gap-8 border-t border-gray-800 pt-2">
                  <span className="text-gray-400">Overage Rate</span>
                  <span>${data.overage_rate}/min</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-gray-400">Est. Overage Cost</span>
                  <span className="font-medium">${data.overage_cost}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editMode && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-medium">Edit Billing Plan</h3>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Plan Tier</label>
            <select value={form.plan_tier} onChange={(e) => setForm({ ...form, plan_tier: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Included Minutes</label>
            <input type="number" value={form.included_minutes}
              onChange={(e) => setForm({ ...form, included_minutes: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Overage Rate ($/min)</label>
            <input type="number" step="0.01" value={form.overage_rate}
              onChange={(e) => setForm({ ...form, overage_rate: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={saveSettings} disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button onClick={() => setEditMode(false)}
              className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
