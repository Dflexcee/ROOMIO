import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard' },
  { path: '/admin/users', label: 'Users' },
  { path: '/admin/listings', label: 'Listings' },
  { path: '/admin/reports', label: 'Reports' },
  { path: '/admin/tickets', label: 'Tickets' },
  { path: '/admin/email-templates', label: 'Email Templates' },
  { path: '/admin/sms-settings', label: 'SMS Settings' },
  { path: '/admin/smtp-settings', label: 'SMTP Settings' },
  { path: '/admin/ads', label: 'Ads Manager' },
  { path: '/admin/payments', label: 'Payments' },
  { path: '/admin/payment-gateway-settings', label: 'Payment Gateway Settings' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen px-4 py-6">
      <h2 className="text-xl font-bold mb-8">CampusMate Admin</h2>
      <nav className="space-y-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-3 py-2 rounded hover:bg-gray-700 transition ${
              location.pathname === item.path ? 'bg-blue-600' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
        <Link
          to="/admin/logout"
          className="block px-3 py-2 rounded hover:bg-gray-700 transition text-red-400 mt-8"
        >
          Logout
        </Link>
      </nav>
    </aside>
  );
} 