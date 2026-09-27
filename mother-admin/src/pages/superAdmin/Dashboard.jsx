import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Building2,
  Users,
  Smartphone,
  ShieldCheck,
  CreditCard,
  Activity,
  ArrowUpRight,
  MoreVertical,
  TrendingUp,
  Sparkles,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/super-admin/dashboard-stats');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading Mother Admin Analytics...</div>;
  }

  // Monthly Volume Chart Mock Data for Visual Graph
  const monthlyChartData = [
    { month: 'Jan', val: 35 },
    { month: 'Feb', val: 55 },
    { month: 'Mar', val: 45 },
    { month: 'Apr', val: 70 },
    { month: 'May', val: 60 },
    { month: 'Jun', val: 85 },
    { month: 'Jul', val: 100, active: true },
    { month: 'Aug', val: 75 },
    { month: 'Sep', val: 90 },
    { month: 'Oct', val: 65 },
    { month: 'Nov', val: 80 },
    { month: 'Dec', val: 95 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome, <span className="bg-gradient-to-r from-fancyPink via-purple-400 to-fancyCyan bg-clip-text text-transparent">{user?.name || 'John'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            System Status: You have <span className="text-fancyCyan font-bold">{stats?.onlineDevices || 0} SIM Devices online</span> on Opay-Personal Platform
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/super-admin/packages"
            className="px-5 py-2.5 rounded-full btn-fancy-pink text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
          >
            <span>Packages</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            to="/super-admin/companies"
            className="px-5 py-2.5 rounded-full btn-fancy-purple text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
          >
            <span>Companies</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Top Fancy KPI Cards with Progress Bars (Matching Image) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="fancy-card p-6 rounded-3xl border border-white/10 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Companies</span>
            <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-extrabold text-white">{stats?.totalCompanies || 0}</h3>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{stats?.activeCompanies || 0} Companies Currently Active</p>
          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full w-[82%] rounded-full shadow-glowEmerald"></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="fancy-card p-6 rounded-3xl border border-white/10 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active SIM Devices</span>
            <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-extrabold text-white">{stats?.totalDevices || 0}</h3>
            <span className="text-xs font-bold text-fancyCyan flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +24% live
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{stats?.onlineDevices || 0} Connected Devices Online</p>
          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-[68%] rounded-full shadow-fancyCyanGlow"></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="fancy-card p-6 rounded-3xl border border-white/10 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Processed Volume BDT</span>
            <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl font-extrabold text-white">৳ {stats?.totalVolumeBDT?.toLocaleString() || 0}</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{stats?.totalTransactions || 0} Verified Payment Matches</p>
          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-fancyPink to-purple-500 h-full w-[90%] rounded-full shadow-fancyGlow"></div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Feature Highlights & Bar Chart (Matching Image Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Feature Highlights Card */}
        <div className="space-y-6">
          <div className="fancy-card rounded-3xl overflow-hidden border border-white/10 group">
            <div className="h-48 bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-900 relative p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
                  ★ ★ ★ ★ ★ 5.0
                </span>
                <span className="text-xs font-mono text-cyan-300">Enterprise Engine</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white drop-shadow-md">Opay Personal Gateway Platform</h3>
                <p className="text-xs text-slate-200 mt-1">
                  Automated Mobile Banking Payment Processor (bKash, Nagad, Rocket, Upay).
                </p>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between bg-[#1f1338]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-fancyPink/20 text-fancyPink flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">24/7 Socket Listener</p>
                  <p className="text-[11px] text-slate-400">Zero Delay Webhook Callbacks</p>
                </div>
              </div>
              <span className="text-lg font-extrabold text-fancyCyan">৳ 0.00 / Txn Fee</span>
            </div>
          </div>
        </div>

        {/* Right Column: Fancy Neon Bar Chart (Matching Image Bar Chart) */}
        <div className="fancy-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Volume Growth Analytics</h3>
              <p className="text-xs text-slate-400">Monthly payment traffic & SMS match trend</p>
            </div>
            <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between gap-2 px-2 pb-4 pt-6 border-b border-white/10 relative">
            {monthlyChartData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {item.active && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-fancyCyan text-black mb-1 shadow-fancyCyanGlow animate-bounce">
                    +23.8%
                  </span>
                )}
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    item.active
                      ? 'bg-fancyCyan shadow-fancyCyanGlow'
                      : 'bg-indigo-600/40 hover:bg-indigo-500/70'
                  }`}
                  style={{ height: `${item.val}%` }}
                ></div>
                <span className="text-[10px] text-slate-400 font-medium">{item.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-fancyCyan"></span> Current Peak Month (Jul)
            </span>
            <span className="text-white font-semibold">100% Volume Target Reached</span>
          </div>
        </div>
      </div>
    </div>
  );
}
