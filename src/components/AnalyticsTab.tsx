"use client";
import { useState, useEffect } from "react";
import { getAnalytics } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalytics().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Calls", value: data?.total_calls ?? "—" },
    { label: "Total Minutes", value: data?.total_minutes ?? "—" },
    { label: "Avg Duration (min)", value: data?.avg_duration ?? "—" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Analytics</h2>
      {loading && <p className="text-gray-400">Loading…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-1">{s.label}</p>
                <p className="text-2xl font-semibold">{String(s.value)}</p>
              </div>
            ))}
          </div>

          {/* Daily Calls Chart */}
          {data.daily_calls && data.daily_calls.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Daily Calls (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.daily_calls}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 10 }} interval={4} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#d1d5db" }}
                  />
                  <Bar dataKey="calls" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Daily Minutes Chart */}
          {data.daily_minutes && data.daily_minutes.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Daily Minutes (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.daily_minutes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 10 }} interval={4} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#d1d5db" }}
                  />
                  <Area type="monotone" dataKey="minutes" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
