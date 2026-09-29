import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package,
  Users, 
  Smartphone, 
  CreditCard, 
  Code2, 
  History, 
  UserCheck, 
  X,
  Sparkles
} from 'lucide-react';
import api from '../../api/axios';

export default function Sidebar({ isOpen, onClose }) {
  const [subInfo, setSubInfo] = useState(null);

  useEffect(() => {
    api.get('/company/api-settings')
      .then((res) => {
        if (res.data.success) setSubInfo(res.data.data);
      })
      .catch(() => setSubInfo(null));
  }, []);

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Packages & Plans', path: '/packages', icon: Package },
    { label: 'Staff Agents', path: '/agents', icon: Users },
    { label: 'SIM Devices', path: '/devices', icon: Smartphone },
    { label: 'Payment Numbers', path: '/payment-numbers', icon: CreditCard },
    { label: 'API & Webhooks', path: '/api-webhooks', icon: Code2 },
    { label: 'Transactions', path: '/transactions', icon: History },
    { label: 'Company Profile', path: '/profile', icon: UserCheck },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 bg-[#180f33]/90 backdrop-blur-2xl border-r border-purple-500/20 shadow-2xl overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-3 py-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fancyPink via-fancyPurple to-fancyCyan p-0.5 shadow-lg shadow-fancyPink/40">
              <div className="w-full h-full bg-[#130c25] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-fancyPink animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-wide">O-Pay Admin</h1>
              <p className="text-[11px] text-pink-300 font-medium">O-Pay Personal Dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/50 border border-purple-500/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'btn-fancy-pink text-white border border-pink-400/40 shadow-lg shadow-pink-600/30'
                      : 'text-purple-200/70 hover:text-white hover:bg-purple-900/40 border border-transparent'
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
      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-950/40 border border-fancyPink/30 shadow-lg mt-4">
        <div className="flex items-center justify-between mb-2 text-pink-300 font-bold text-xs uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-fancyPink" /> Active Plan
          </span>
        </div>
        <p className="text-sm font-extrabold text-white">
          {subInfo?.package?.title || 'No Active Package'}
        </p>
        <p className="text-[11px] text-purple-200/80 mt-1 font-medium">
          {subInfo ? `Valid until: ${new Date(subInfo.endDate).toLocaleDateString()}` : 'Please buy a package to start'}
        </p>
        <NavLink
          to="/packages"
          onClick={onClose}
          className="mt-3 block text-center py-2 bg-fancyPink/20 hover:bg-fancyPink/30 text-pink-300 text-xs font-extrabold rounded-xl border border-fancyPink/40 transition-all"
        >
          {subInfo ? 'Upgrade / Renew' : 'Buy Package Now'}
        </NavLink>
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
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
