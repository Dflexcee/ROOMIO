import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import DarkModeToggle from "./DarkModeToggle";
import config from "../../config/api";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/find-room", label: "Find Room", icon: "🔍" },
  { to: "/find-roommate", label: "Find Roommate", icon: "👥" },
  { to: "/post-room", label: "Post Room", icon: "🏠" },
  { to: "/my-rooms", label: "My Rooms", icon: "🏘️" },
  { to: "/post-listing", label: "Post Listing", icon: "📝" },
  { to: "/view-listings", label: "View Listings", icon: "🏢" },
  { to: "/my-listings", label: "My Listings", icon: "📋" },
  { to: "/scam-board", label: "Scam Alerts", icon: "⚠️" },
  { to: "/community", label: "Community Feed", icon: "💬" },
  { to: "/inbox", label: "Inbox", icon: "✉️" },
  { to: "/profile-edit", label: "Edit Profile", icon: "👤" },
  { to: "/help-center", label: "Help Center", icon: "❓" },
];

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch(config.getUrl('/verification/status.php'), {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setVerificationData(data.verification);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const getVerificationBadge = () => {
    if (!user || user.role === 'admin' || user.role === 'manager') return null;

    if (!user.is_verified || !verificationData) {
      return { label: 'Unverified', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200', link: '/verification' };
    }

    if (verificationData.status === 'pending') {
      return { label: 'Pending', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200', link: '/verification' };
    }

    if (verificationData.status === 'approved') {
      return { label: 'Verified ✓', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200', link: '/verification' };
    }

    if (verificationData.status === 'rejected') {
      return { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200', link: '/verification' };
    }

    if (verificationData.status === 'suspended') {
      return { label: 'Suspended', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200', link: '/verification' };
    }

    return null;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/onboarding");
    } catch (error) {
      console.error('Logout error:', error);
      navigate("/onboarding");
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 shadow-md border-b-2 border-blue-500 dark:border-gray-700 z-40 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/dashboard" className="ml-4 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          Roomio
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <DarkModeToggle />
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                {user.full_name || user.email}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-blue-50 to-purple-50 dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-blue-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 dark:bg-gray-800">
            <Link to="/dashboard" onClick={closeSidebar} className="text-2xl font-bold text-white dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:to-purple-400">
              Roomio
            </Link>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6 text-white dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-blue-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                  {getVerificationBadge() && (
                    <Link
                      to={getVerificationBadge().link}
                      onClick={closeSidebar}
                      className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${getVerificationBadge().color}`}
                    >
                      {getVerificationBadge().label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                closeSidebar();
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
            >
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer for top bar */}
      <div className="h-16"></div>
    </>
  );
} 