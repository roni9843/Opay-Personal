import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { ShieldAlert } from 'lucide-react';

export default function Layout() {
  const { user, token } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const isSuspended = user?.status === 'suspended';

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Big Bold Red Banner if Account Suspended */}
        {isSuspended && (
          <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white p-4 shadow-2xl border-b border-red-400 flex items-center justify-center gap-3 text-center animate-pulse z-20">
            <ShieldAlert className="w-7 h-7 text-white shrink-0" />
            <div>
              <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-widest text-white">
                ⛔ YOUR MERCHANT ACCOUNT HAS BEEN SUSPENDED BY SUPER ADMIN
              </h2>
              <p className="text-xs text-rose-100 font-bold mt-0.5">
                All SIM Gateway services and transactions are temporarily frozen. Please contact platform support.
              </p>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
