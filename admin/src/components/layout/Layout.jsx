import React, { useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { ShieldAlert, LogOut } from 'lucide-react';
import api from '../../api/axios';

export default function Layout() {
  const { user, token, setAuth, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          if (res.data.success && res.data.user) {
            setAuth(res.data.user, token);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const isSuspended = user?.status === 'suspended';

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex relative">
      {/* Huge Suspended Screen Overlay */}
      {isSuspended ? (
        <div className="fixed inset-0 z-50 bg-[#090d16]/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-8 md:p-10 rounded-3xl fancy-card border-2 border-rose-500/60 shadow-2xl text-center space-y-6 relative overflow-hidden bg-gradient-to-b from-rose-950/40 via-purple-950/50 to-[#090d16]">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/20 blur-[130px] rounded-full pointer-events-none" />

            <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-500/50 text-rose-400 flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/30 animate-bounce">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div className="p-5 rounded-3xl bg-rose-500/20 border-2 border-rose-500 text-rose-200 text-center shadow-2xl space-y-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-rose-300 uppercase tracking-wide">
                ACCOUNT SUSPENDED BY SUPER ADMIN
              </h1>
              <p className="text-xs md:text-sm text-rose-200/90 font-medium">
                This merchant user is currently suspended. Access to their merchant dashboard is blocked.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 font-medium">
              If you believe this is an error or wish to reactivate your subscription, please contact O-Pay Support.
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleLogout}
                className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
          <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
            <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
            <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <Outlet />
            </main>
          </div>
        </>
      )}
    </div>
  );
}
