import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Smartphone, 
  CreditCard, 
  Code2, 
  History, 
  UserCheck, 
  X,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Staff Agents', path: '/agents', icon: Users },
    { label: 'SIM Devices', path: '/devices', icon: Smartphone },
    { label: 'Payment Numbers', path: '/payment-numbers', icon: CreditCard },
    { label: 'API & Webhooks', path: '/api-webhooks', icon: Code2 },
    { label: 'Transactions', path: '/transactions', icon: History },
    { label: 'Company Profile', path: '/profile', icon: UserCheck },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 bg-[#090d16] border-r border-slate-800/80">
      <div>
        {/* Brand */}
        <div className="flex items-center justify-between px-3 py-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-lg shadow-purple-600/30">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-wide">O-Pay Admin</h1>
              <p className="text-[11px] text-purple-400 font-medium">Merchant Dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white shadow-lg shadow-purple-600/20 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Package Card Notice */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Active Plan
        </div>
        <p className="text-sm font-bold text-white">Starter Pack</p>
        <p className="text-[11px] text-slate-400 mt-1">SIM Capacity: 6 Slots (3 Devices)</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 z-50">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
