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
  Settings,
} from 'lucide-react';

export default function Sidebar() {
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
        { label: 'Realtime SMS', path: '/agent/transactions', icon: Receipt },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 border-r border-white/10 glass-panel flex flex-col justify-between hidden md:flex shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/super-admin' || item.path === '/company' || item.path === '/agent'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">Opay Platform Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Server Online & Listening</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
