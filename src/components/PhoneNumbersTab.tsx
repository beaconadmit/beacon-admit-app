"use client";
import { useState, useEffect } from "react";
import { getPhoneNumbers } from "@/lib/api";

export default function PhoneNumbersTab() {
  const [numbers, setNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPhoneNumbers().then(setNumbers).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Phone Numbers</h2>
      {loading && <p className="text-gray-400">Loading…</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && numbers.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">No phone numbers mapped yet.</p>
        </div>
      )}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Phone Number</th>
              <th className="text-left px-4 py-3 font-medium">Agent</th>
              <th className="text-left px-4 py-3 font-medium">Nickname</th>
            </tr>
          </thead>
          <tbody>
            {numbers.map((n: any) => (
              <tr key={n.phone_number} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="px-4 py-3 font-mono">{n.phone_number}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{n.agent_id?.slice(0, 12) || "—"}</td>
                <td className="px-4 py-3 text-gray-400">{n.nickname || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
