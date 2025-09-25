import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: "📊", roles: ["admin", "manager"] },
  { path: "/admin/users", label: "Users", icon: "👥", roles: ["admin", "manager"] },
  { path: "/admin/listings", label: "Listings", icon: "🏠", roles: ["admin", "manager"] },
  { path: "/admin/tickets", label: "Tickets", icon: "🎫", roles: ["admin", "manager"] },
  { path: "/admin/email-templates", label: "Email Templates", icon: "📧", roles: ["admin", "manager"] },
  { path: "/admin/ads", label: "Ads Manager", icon: "📢", roles: ["admin", "manager"] },
  { path: "/admin/payments", label: "Payment Settings", icon: "💰", roles: ["admin"] },
  { path: "/admin/user-access", label: "User Access", icon: "🔐", roles: ["admin"] },
  { path: "/admin/grant-access", label: "Grant Feature Access", icon: "🎁", roles: ["admin"] },
  { path: "/admin/verification", label: "Agent Verification", icon: "✅", roles: ["admin"] },
  { path: "/admin/broadcast", label: "Broadcast", icon: "📡", roles: ["admin"] },
  { path: "/admin/analytics", label: "Analytics", icon: "📈", roles: ["admin"] },
  { path: "/admin/blacklist", label: "Blacklist / Logs", icon: "🚫", roles: ["admin"] },
  { path: "/admin/smtp-settings", label: "SMTP Settings", icon: "📨", roles: ["admin"] },
  { path: "/admin/sms-settings", label: "SMS Settings", icon: "📱", roles: ["admin"] },
  { path: "/admin/admin-manager-details", label: "Admin & Manager Details", icon: "🛡️", roles: ["admin"] },
];

export default function Sidebar() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const role = user?.role || "";

  if (loading) {
    return (
      <aside className="bg-gray-900 text-white w-64 min-h-screen px-4 py-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen px-4 py-6">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-2xl">🏠</span>
        <h2 className="text-xl font-bold">Roomio Admin</h2>
      </div>

      <nav className="space-y-2">
        {navItems
          .filter((item) => item.roles.includes(role))
          .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

        <Link
          to="/admin/logout"
          className="flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-gray-300 hover:bg-gray-800 hover:text-white mt-8"
        >
          <span className="text-xl">🚪</span>
          <span>Logout</span>
        </Link>
      </nav>
    </aside>
  );
} 