import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import Users from '../pages/admin/Users';
import Listings from '../pages/admin/Listings';
import Reports from '../pages/admin/Reports';
import Tickets from '../pages/admin/Tickets';
import EmailTemplates from '../pages/admin/EmailTemplates';
import SMSSettings from '../pages/admin/SMSSettings';
import SMTPSettings from '../pages/admin/SMTPSettings';
import AdsManager from '../pages/admin/AdsManager';
import Payments from '../pages/admin/Payments';
import PaymentGatewaySettings from '../pages/admin/PaymentGatewaySettings';
import ProtectedAdminRoute from './ProtectedAdminRoute';
import AdminLogin from '../pages/admin/Login';
import Logout from '../pages/admin/Logout';
import Broadcast from '../pages/admin/Broadcast';
import Blacklist from '../pages/admin/Blacklist';
import Analytics from '../pages/admin/Analytics';
import UserAccessManager from '../pages/admin/UserAccessManager';
import AdminManagerDetails from '../pages/admin/AdminManagerDetails';
import GrantFeatureAccess from '../pages/admin/GrantFeatureAccess';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="login" element={<AdminLogin />} />
      <Route path="logout" element={<Logout />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="listings" element={<Listings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="email-templates" element={<EmailTemplates />} />
          <Route path="sms-settings" element={<SMSSettings />} />
          <Route path="smtp-settings" element={<SMTPSettings />} />
          <Route path="ads" element={<AdsManager />} />
          <Route path="payments" element={<Payments />} />
          <Route path="payment-gateway-settings" element={<PaymentGatewaySettings />} />
          <Route path="broadcast" element={<Broadcast />} />
          <Route path="blacklist" element={<Blacklist />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="user-access" element={<UserAccessManager />} />
          <Route path="grant-access" element={<GrantFeatureAccess />} />
          <Route path="admin-manager-details" element={<AdminManagerDetails />} />
        </Route>
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
};

export default AdminRoutes; 