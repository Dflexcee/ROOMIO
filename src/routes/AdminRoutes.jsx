import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import Users from '../pages/admin/Users';
import Listings from '../pages/admin/Listings';
import Reports from '../pages/admin/Reports';
import Tickets from '../pages/admin/Tickets';
import EmailTemplates from '../pages/admin/EmailTemplates';
import SMSSettings from '../pages/admin/SMSSettings';
import AdsManager from '../pages/admin/AdsManager';
import Payments from '../pages/admin/Payments';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="listings" element={<Listings />} />
        <Route path="reports" element={<Reports />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="email-templates" element={<EmailTemplates />} />
        <Route path="sms-settings" element={<SMSSettings />} />
        <Route path="ads" element={<AdsManager />} />
        <Route path="payments" element={<Payments />} />
      </Route>
    </Routes>
  );
} 