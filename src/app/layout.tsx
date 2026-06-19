import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = { title: "Beacon Admit — Dashboard", description: "Multi-tenant Retell AI dashboard" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gray-950 text-white"><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
