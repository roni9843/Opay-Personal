import React from 'react';
import { Menu, LogOut, ShieldCheck, User, Building2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMobileMenuToggle }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[#090d16]/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-600/30">
            O
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>{user?.companyName || 'Merchant Portal'}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-400 font-semibold uppercase border border-purple-500/30">
                Merchant
              </span>
            </h2>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
          <Building2 className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-slate-300 font-medium">{user?.email}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
