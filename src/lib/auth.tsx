"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  tenantId: string | null;
  centerName: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null, tenantId: null, centerName: null,
  login: async () => {}, logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ token: null as string | null, tenantId: null as string | null, centerName: null as string | null });

  useEffect(() => {
    const t = localStorage.getItem("beacon_access_token");
    const tid = localStorage.getItem("beacon_tenant_id");
    const cn = localStorage.getItem("beacon_center_name");
    if (t) setState({ token: t, tenantId: tid, centerName: cn });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    localStorage.setItem("beacon_access_token", data.access_token);
    localStorage.setItem("beacon_tenant_id", data.tenant_id);
    localStorage.setItem("beacon_center_name", data.center_name || "");
    setState({ token: data.access_token, tenantId: data.tenant_id, centerName: data.center_name || "" });
  };

  const logout = () => {
    localStorage.removeItem("beacon_access_token");
    localStorage.removeItem("beacon_tenant_id");
    localStorage.removeItem("beacon_center_name");
    setState({ token: null, tenantId: null, centerName: null });
  };

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
