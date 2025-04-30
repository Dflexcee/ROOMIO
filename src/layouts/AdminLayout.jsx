import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from "../components/common/Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
} 