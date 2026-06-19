"use client";
import { useState, useEffect } from "react";
import { getAgents } from "@/lib/api";

export default function AgentsTab() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAgents().then(setAgents).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Agents</h2>
      {loading && <p className="text-gray-400">Loading…</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && agents.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">No agents provisioned.</p>
          <p className="text-gray-500 text-sm mt-1">Agents will appear here once mapped to your tenant.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((a) => (
          <div key={a.agent_id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-lg">🤖</div>
              <div>
                <h3 className="font-medium">{a.agent_name || "Unnamed"}</h3>
                <p className="text-xs text-gray-500 font-mono">{a.agent_id?.slice(0, 8)}…</p>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-400">
              {a.voice_id && <p>Voice: <span className="text-gray-300">{a.voice_id}</span></p>}
              {a.language && <p>Language: <span className="text-gray-300">{a.language}</span></p>}
              <p>Status: <span className="text-green-400">{a.status || "active"}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
