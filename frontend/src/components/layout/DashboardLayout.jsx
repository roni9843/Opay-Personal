import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ allowedRoles }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to respective dashboard if role mismatch
    if (user?.role === 'super_admin') return <Navigate to="/super-admin" replace />;
    if (user?.role === 'company_owner') return <Navigate to="/company" replace />;
    if (user?.role === 'agent') return <Navigate to="/agent" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
