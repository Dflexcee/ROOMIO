import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/find-room", label: "Find Room" },
  { to: "/find-roommate", label: "Find Roommate" },
  { to: "/post-room", label: "🏠 Post Room" },
  { to: "/my-rooms", label: "🏘️ My Rooms" },
  { to: "/post-listing", label: "📝 Post Listing" },
  { to: "/view-listings", label: "🏘️ View Listings" },
  { to: "/my-listings", label: "📋 My Listings" },
  { to: "/inbox", label: "💬 Inbox" },
  { to: "/profile-edit", label: "Edit Profile" },
  { to: "/help-center", label: "👉 Help Center" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/onboarding");
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even if logout fails
      navigate("/onboarding");
    }
  };

  return (
    <div className="relative w-full">
      <nav className="w-full bg-gradient-to-r from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 shadow-lg px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between z-40">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link to="/dashboard" className="text-xl font-extrabold text-white tracking-tight drop-shadow-md">
            Roomio
          </Link>
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={() => setOpen((o) => !o)}
              className="text-white focus:outline-none ml-2"
              aria-label="Toggle menu"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-white px-3 py-1 rounded transition font-semibold hover:bg-blue-700/60 dark:hover:bg-pink-400/30 ${location.pathname === link.to ? "bg-blue-700 dark:bg-pink-400/40" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-white px-3 py-1 rounded transition font-semibold hover:bg-red-600/60 dark:hover:bg-red-500/30"
          >
            Logout
          </button>
        </div>
        {/* Mobile menu */}
        {open && (
          <div className="absolute top-full left-0 w-full bg-gradient-to-r from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 shadow-lg flex flex-col md:hidden animate-fade-in z-50">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-white px-6 py-3 border-b border-blue-800 dark:border-gray-800 font-semibold ${location.pathname === link.to ? "bg-blue-700 dark:bg-pink-400/40" : ""}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="text-white px-6 py-3 border-b border-blue-800 dark:border-gray-800 font-semibold hover:bg-red-600/60 dark:hover:bg-red-500/30"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </div>
  );
} 