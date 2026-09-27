import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  LayoutDashboard,
  Package,
  Building2,
  Users,
  Smartphone,
  CreditCard,
  Key,
  Receipt,
  Sparkles,
  Zap,
  X,
} from 'lucide-react';

export default function Sidebar({ isMobileMenuOpen, onCloseMobileMenu }) {
  const { user } = useAuthStore();

  const getNavItems = () => {
    if (!user) return [];

    if (user.role === 'super_admin') {
      return [
        { label: 'Mother Overview', path: '/super-admin', icon: LayoutDashboard },
        { label: 'Subscription Packages', path: '/super-admin/packages', icon: Package },
        { label: 'Companies & Owners', path: '/super-admin/companies', icon: Building2 },
      ];
    }

    if (user.role === 'company_owner') {
      return [
        { label: 'Merchant Overview', path: '/company', icon: LayoutDashboard },
        { label: 'Staff Agents', path: '/company/agents', icon: Users },
        { label: 'SIM Devices', path: '/company/devices', icon: Smartphone },
        { label: 'Payment Numbers', path: '/company/payment-methods', icon: CreditCard },
        { label: 'API & Webhooks', path: '/company/api-settings', icon: Key },
        { label: 'Transaction Logs', path: '/company/transactions', icon: Receipt },
      ];
    }

    if (user.role === 'agent') {
      return [
        { label: 'Agent Workspace', path: '/agent', icon: LayoutDashboard },
        { label: 'Realtime SMS Feed', path: '/agent/transactions', icon: Receipt },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const SidebarContent = () => (
    <div className="space-y-6 flex-1">
      {/* Navigation Group */}
      <div className="fancy-card p-2.5 rounded-2xl border border-white/10 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Dashboard Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobileMenu}
              end={item.path === '/super-admin' || item.path === '/company' || item.path === '/agent'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-fancyPink to-purple-600 text-white shadow-fancyGlow border border-white/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Promo Widget */}
      <div className="fancy-card p-4 rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-transparent relative overflow-hidden">
        <div className="flex items-center gap-2 text-fancyPink font-extrabold text-xs mb-1">
          <Zap className="w-4 h-4 fill-fancyPink" />
          <span>Instant Webhooks</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug mb-3">
          Realtime bKash, Nagad, Rocket, Upay TrxID verification engine.
        </p>
        <button className="w-full py-1.5 rounded-xl btn-fancy-pink text-white font-bold text-[11px] shadow-sm uppercase tracking-wider">
          Active v1.0
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed / Sticky) */}
      <aside className="w-64 border-r border-white/10 bg-[#160d2e]/80 backdrop-blur-xl flex flex-col justify-between hidden md:flex shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4 space-y-6">
        <SidebarContent />
        <div className="fancy-card p-4 rounded-2xl border border-purple-500/20 bg-gradient-to-tr from-purple-900/40 to-indigo-900/40 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mx-auto text-fancyCyan">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-white">Opay Personal Enterprise</h4>
          <p className="text-[10px] text-slate-400">Continuous 24/7 Socket.IO connection</p>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay & Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            onClick={onCloseMobileMenu}
          ></div>

          {/* Drawer Sidebar */}
          <div className="relative w-4/5 max-w-xs bg-[#160d2e] border-r border-white/10 p-4 flex flex-col justify-between h-full z-10 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-fancyPink text-white font-bold text-sm flex items-center justify-center">
                  O
                </div>
                <span className="text-base font-extrabold text-white">Opay Navigation</span>
              </div>
              <button
                onClick={onCloseMobileMenu}
                className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <SidebarContent />

            <div className="fancy-card p-3 rounded-2xl border border-purple-500/20 text-center space-y-1">
              <h4 className="text-xs font-bold text-white">Opay Personal v1.0</h4>
              <p className="text-[10px] text-slate-400">Mobile Responsive Active</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
