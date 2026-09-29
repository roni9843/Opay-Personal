import React from 'react';
import { Menu, LogOut, Building2, Sparkles } from 'lucide-react';
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
    <header className="h-16 bg-[#160d2e]/80 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shadow-xl">
      {/* Fancy Top Glow Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] topbar-gradient" />

      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/50 lg:hidden transition-colors border border-purple-500/20"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-fancyPink via-fancyPurple to-fancyCyan p-0.5 shadow-lg shadow-fancyPink/30">
            <div className="w-full h-full bg-[#130c25] rounded-[10px] flex items-center justify-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fancyPink to-fancyCyan text-sm">
              O
            </div>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
              <span>{user?.companyName || 'O-Pay Personal Admin'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-fancyPink/20 text-pink-300 font-bold uppercase tracking-wider border border-fancyPink/40">
                O-Pay Personal
              </span>
            </h2>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-purple-950/40 border border-purple-500/30">
          <Building2 className="w-4 h-4 text-fancyPink" />
          <span className="text-xs text-purple-200 font-medium">{user?.email}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-all shadow-md"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
