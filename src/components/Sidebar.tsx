"use client";
import type { Tab } from "@/app/dashboard/page";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "agents", label: "Agents", icon: "🤖" },
  { id: "phone-numbers", label: "Phone Numbers", icon: "📞" },
  { id: "call-logs", label: "Call Logs", icon: "📋" },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "billing", label: "Billing", icon: "💳" },
];

export default function Sidebar({ activeTab, onTabChange, centerName, onLogout }: {
  activeTab: Tab; onTabChange: (t: Tab) => void; centerName: string | null; onLogout: () => void;
}) {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">B</div>
          <span className="font-semibold text-sm">Beacon Admit</span>
        </div>
        {centerName && <p className="text-xs text-gray-500 mt-1 truncate">{centerName}</p>}
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-800">
        <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
          Sign Out
        </button>
      </div>
    </aside>
  );
}
