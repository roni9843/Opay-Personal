import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/auth/Login';
import SuperAdminDashboard from './pages/superAdmin/Dashboard';
import Packages from './pages/superAdmin/Packages';
import Companies from './pages/superAdmin/Companies';

import CompanyDashboard from './pages/company/Dashboard';
import Agents from './pages/company/Agents';
import Devices from './pages/company/Devices';
import PaymentMethods from './pages/company/PaymentMethods';
import ApiSettings from './pages/company/ApiSettings';
import Transactions from './pages/company/Transactions';

import AgentDashboard from './pages/agent/AgentDashboard';
import PaymentPage from './pages/checkout/PaymentPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/checkout/:sessionToken" element={<PaymentPage />} />

        {/* Super Admin Routes */}
        <Route element={<DashboardLayout allowedRoles={['super_admin']} />}>
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/super-admin/packages" element={<Packages />} />
          <Route path="/super-admin/companies" element={<Companies />} />
        </Route>

        {/* Company Owner Routes */}
        <Route element={<DashboardLayout allowedRoles={['company_owner']} />}>
          <Route path="/company" element={<CompanyDashboard />} />
          <Route path="/company/agents" element={<Agents />} />
          <Route path="/company/devices" element={<Devices />} />
          <Route path="/company/payment-methods" element={<PaymentMethods />} />
          <Route path="/company/api-settings" element={<ApiSettings />} />
          <Route path="/company/transactions" element={<Transactions />} />
        </Route>

        {/* Staff Agent Routes */}
        <Route element={<DashboardLayout allowedRoles={['agent']} />}>
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/agent/transactions" element={<Transactions />} />
        </Route>

        {/* Default Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
