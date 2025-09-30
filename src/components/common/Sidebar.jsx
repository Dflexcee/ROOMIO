import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import adminConfig from "../../config/adminConfig";

export default function Sidebar() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const role = user?.role || "";
  const navItems = adminConfig.getNavigationItems(role);

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
        <h2 className="text-xl font-bold">{adminConfig.ADMIN_TITLE}</h2>
      </div>

      {/* Admin Status Indicator */}
      {user && user.status && user.status !== 'active' && (
        <div className="mb-4 p-3 bg-yellow-900 border border-yellow-600 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400">⚠️</span>
            <div className="text-sm">
              <div className="text-yellow-200 font-semibold">
                Admin Account: {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </div>
              {user.status_reason && (
                <div className="text-yellow-300 text-xs mt-1">
                  Reason: {user.status_reason}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="space-y-2">
        {navItems.map((item) => (
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