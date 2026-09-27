import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, User, Shield, Building, Smartphone } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Mother Admin
          </span>
        );
      case 'company_owner':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
            <Building className="w-3 h-3" /> Merchant / Owner
          </span>
        );
      case 'agent':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <Smartphone className="w-3 h-3" /> Staff Agent
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/10 glass-panel px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
          Opay-Personal
        </h1>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
          v1.0 Pro
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            {getRoleBadge(user.role)}
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-slate-200">{user.name}</p>
              <p className="text-xs text-slate-400">{user.companyName || user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-rose-500/20 hover:border-rose-500/30 border border-white/10 transition-all"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
