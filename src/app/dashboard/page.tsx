"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import AgentsTab from "@/components/AgentsTab";
import PhoneNumbersTab from "@/components/PhoneNumbersTab";
import CallLogsTab from "@/components/CallLogsTab";
import AnalyticsTab from "@/components/AnalyticsTab";
import BillingTab from "@/components/BillingTab";
import CallDrawer from "@/components/CallDrawer";

export type Tab = "agents" | "phone-numbers" | "call-logs" | "analytics" | "billing";

export default function DashboardPage() {
  const { token, centerName, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("agents");
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  useEffect(() => { if (!token) router.push("/login"); }, [token, router]);
  if (!token) return null;

  const renderTab = () => {
    switch (activeTab) {
      case "agents": return <AgentsTab />;
      case "phone-numbers": return <PhoneNumbersTab />;
      case "call-logs": return <CallLogsTab onSelectCall={setSelectedCallId} />;
      case "analytics": return <AnalyticsTab />;
      case "billing": return <BillingTab />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} centerName={centerName} onLogout={logout} />
      <main className="flex-1 overflow-y-auto"><div className="p-6">{renderTab()}</div></main>
      {selectedCallId && <CallDrawer callId={selectedCallId} onClose={() => setSelectedCallId(null)} />}
    </div>
  );
}
