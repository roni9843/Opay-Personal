import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { ShieldAlert, AlertTriangle, LogOut, PhoneCall } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Layout() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const isSuspended = user?.status === 'suspended';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex relative">
      {/* Huge Suspended Overlay if Account Status is Suspended */}
      {isSuspended ? (
        <div className="fixed inset-0 z-50 bg-[#090d16]/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-8 md:p-10 rounded-3xl fancy-card border-2 border-rose-500/60 shadow-2xl text-center space-y-6 relative overflow-hidden bg-gradient-to-b from-rose-950/40 via-purple-950/50 to-[#090d16]">
            {/* Background Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/20 blur-[130px] rounded-full pointer-events-none" />

            <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-500/50 text-rose-400 flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/30 animate-bounce">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div>
              <span className="px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-extrabold uppercase tracking-widest border border-rose-500/40 inline-block mb-3">
                ACCOUNT SUSPENDED
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                YOUR ACCOUNT HAS BEEN SUSPENDED
              </h1>
              <p className="text-rose-200/80 text-sm mt-3 font-medium leading-relaxed">
                Your merchant account <strong className="text-white">({user?.companyName || user?.email})</strong> has been suspended by the Super Admin. All SIM Gateway operations, device syncing, and payment processing are frozen.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 font-medium">
              If you believe this is an error or wish to reactivate your subscription, please contact O-Pay Support immediately.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Sidebar isOpen={false} onClose={() => {}} />
          <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
            <Navbar onMobileMenuToggle={() => {}} />
            <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <Outlet />
            </main>
          </div>
        </>
      )}
    </div>
  );
}
