"use client";
import { useState, useEffect, useRef } from "react";
import { getCall, getAudioUrl } from "@/lib/api";

export default function CallDrawer({ callId, onClose }: { callId: string; onClose: () => void }) {
  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    getCall(callId).then(setCall).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [callId]);

  const audioUrl = getAudioUrl(callId);

  function toggleAudio() {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-gray-900 border-l border-gray-800 flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div><h3 className="font-semibold">Call Review</h3><p className="text-xs text-gray-500 font-mono">{callId.slice(0, 16)}…</p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none px-2">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && <p className="text-gray-400">Loading…</p>}
          {error && <p className="text-red-400">{error}</p>}
          {call && (
            <>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <button onClick={toggleAudio} className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700">
                    {playing ? "⏸" : "▶"}
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Call Recording</p>
                    <p className="text-xs text-gray-400">{call.duration ? `${Math.floor(call.duration / 60000)}:${(Math.floor((call.duration % 60000) / 1000)).toString().padStart(2, '0')}` : "—"}</p>
                  </div>
                </div>
                <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} className="hidden" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-800 rounded-lg p-3"><p className="text-gray-400 text-xs mb-1">Status</p><p className="capitalize">{call.status || "—"}</p></div>
                <div className="bg-gray-800 rounded-lg p-3"><p className="text-gray-400 text-xs mb-1">Type</p><p className="capitalize">{call.call_type || "—"}</p></div>
                <div className="bg-gray-800 rounded-lg p-3"><p className="text-gray-400 text-xs mb-1">Started</p><p>{call.start_time ? new Date(call.start_time).toLocaleString() : "—"}</p></div>
                <div className="bg-gray-800 rounded-lg p-3"><p className="text-gray-400 text-xs mb-1">Ended</p><p>{call.end_time ? new Date(call.end_time).toLocaleString() : "—"}</p></div>
              </div>
              {call.summary && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Summary</h4>
                  <p className="text-sm text-gray-400">{call.summary}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
