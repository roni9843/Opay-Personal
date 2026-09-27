import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, Search, Shield, Building, Smartphone, Sparkles, User, Bell } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-fancyCyan" /> Mother Admin
          </span>
        );
      case 'company_owner':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-sm">
            <Building className="w-3.5 h-3.5 text-emerald-300" /> Merchant Owner
          </span>
        );
      case 'agent':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-sm">
            <Smartphone className="w-3.5 h-3.5 text-amber-300" /> Staff Agent
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 topbar-gradient shadow-xl px-6 flex items-center justify-between">
      {/* Brand & Search */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-bold text-lg shadow-md">
            O
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight drop-shadow-md">
            Opay-Personal
          </h1>
        </div>

        {/* Fancy Search Bar like reference image */}
        <div className="hidden lg:flex items-center relative w-72">
          <Search className="w-4 h-4 text-white/70 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payments, devices, agents..."
            className="w-full pl-10 pr-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white placeholder-white/60 text-xs focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all backdrop-blur-md"
          />
        </div>
      </div>

      {/* Navigation Actions & Profile Pill */}
      <div className="flex items-center gap-4">
        {user && getRoleBadge(user.role)}

        {/* Quick Actions like 'Enterprise solution' / 'Order Now' */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs font-semibold text-white/90 hover:text-white cursor-pointer transition-colors">
            24/7 Socket Active
          </span>
          <button className="px-4 py-1.5 rounded-full bg-white text-purple-900 hover:bg-slate-100 font-bold text-xs shadow-md transition-all">
            Live Gateway
          </button>
        </div>

        {/* User Pill Card */}
        {user && (
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/25 shadow-inner">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
              <p className="text-[10px] text-white/75 leading-tight">{user.companyName || user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="p-2 rounded-full bg-white/15 hover:bg-rose-500 text-white border border-white/25 transition-all shadow-md"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
