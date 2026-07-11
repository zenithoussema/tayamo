"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/layout/Sidebar";
import TopBar from "@/components/admin/layout/TopBar";
import MobileNav from "@/components/admin/layout/MobileNav";
import { ToastProvider } from "@/components/admin/ui/Toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-theme">
      <ToastProvider>
        <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)" }}>
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />
          <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64"}`}>
            <TopBar onMenuClick={() => setMobileOpen(true)} />
            <main className="p-4 pb-20 lg:pb-6 lg:p-6">{children}</main>
          </div>
          <MobileNav />
        </div>
      </ToastProvider>
    </div>
  );
}
