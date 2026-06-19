"use client";
import { useState, useEffect } from "react";
import { getCalls } from "@/lib/api";

function fmtDur(ms: number) { if (!ms) return "—"; const m = Math.floor(ms / 60000); const s = Math.floor((ms % 60000) / 1000); return `${m}:${s.toString().padStart(2, "0")}`; }
function fmtTime(iso: any) { if (!iso) return "—"; return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
function statusClr(s: string) { return s === "ended" ? "text-green-400" : s === "in_progress" ? "text-blue-400" : s === "failed" ? "text-red-400" : "text-gray-400"; }

export default function CallLogsTab({ onSelectCall }: { onSelectCall: (id: string) => void }) {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCalls(50).then(setCalls).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Call Logs</h2>
      {loading && <p className="text-gray-400">Loading…</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && calls.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">No calls recorded yet.</p>
        </div>
      )}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Call ID</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Duration</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((c: any) => (
              <tr key={c.call_id} className="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors" onClick={() => onSelectCall(c.call_id)}>
                <td className="px-4 py-3 font-mono text-xs">{c.call_id?.slice(0, 12)}…</td>
                <td className={`px-4 py-3 capitalize ${statusClr(c.status)}`}>{c.status || "—"}</td>
                <td className="px-4 py-3">{fmtDur(c.duration)}</td>
                <td className="px-4 py-3 capitalize">{c.call_type || "—"}</td>
                <td className="px-4 py-3 text-gray-400">{fmtTime(c.start_time)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
