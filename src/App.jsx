import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Listings from './pages/admin/Listings';
import Reports from './pages/admin/Reports';
import Tickets from './pages/admin/Tickets';
import EmailTemplates from './pages/admin/EmailTemplates';
import SMSSettings from './pages/admin/SMSSettings';
import SMTPSettings from './pages/admin/SMTPSettings';
import AdsManager from './pages/admin/AdsManager';
import Payments from './pages/admin/Payments';
import PaymentGatewaySettings from './pages/admin/PaymentGatewaySettings';
import Home from './pages/user/Home';
import Login from './pages/user/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
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
        </Route>
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 