import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/find-room", label: "Find Room" },
  { to: "/find-roommate", label: "Find Roommate" },
  { to: "/profile-edit", label: "Edit Profile" },
  // Add more pages here as needed
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="w-full bg-gradient-to-r from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 shadow-lg px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between z-50 relative">
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
      {/* Desktop nav links and dark mode toggle */}
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
        <DarkModeToggle />
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
          <div className="flex justify-center py-3">
            <DarkModeToggle />
          </div>
        </div>
      )}
    </nav>
  );
} 