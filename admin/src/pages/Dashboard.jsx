import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Smartphone, 
  CreditCard, 
  Zap, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [subInfo, setSubInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/company/subscription');
      if (res.data.success) {
        setSubInfo(res.data.subscription);
      }
    } catch (err) {
      console.log('Subscription info load:', err);
    } finally {
      setLoading(false);
    }
  };

  // Default snapshot metrics calculation based on package rule: Total SIM Capacity = total devices * 2
  const maxAdminDevices = subInfo?.maxAdminDevicesSnapshot || 1;
  const maxAgents = subInfo?.maxAgentsSnapshot || 2;
  const maxDevicesPerAgent = subInfo?.maxDevicesPerAgentSnapshot || 1;
  const totalMaxDevices = subInfo?.maxDevicesSnapshot || (maxAdminDevices + (maxAgents * maxDevicesPerAgent));
  const totalSimCapacity = totalMaxDevices * 2;

  return (
    <div className="space-[#1e293b] space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-2xl glass-panel border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Company Control Panel
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Welcome back, {user?.name || 'Merchant'}! 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Company: <span className="text-purple-300 font-semibold">{user?.companyName}</span> | Manage payment SIM devices & automated agent gateways.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Gateway Engine Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Admin Devices Quota */}
        <div className="p-5 rounded-2xl glass-card border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin Devices</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">{maxAdminDevices}</span>
            <span className="text-xs text-slate-400 ml-2">Device Limit</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Dedicated Admin SIM controller</p>
        </div>

        {/* Metric 2: Staff Agents Quota */}
        <div className="p-5 rounded-2xl glass-card border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Staff Agents Quota</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">{maxAgents}</span>
            <span className="text-xs text-slate-400 ml-2">Max Agents</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">{maxDevicesPerAgent} device(s) allowed per agent</p>
        </div>

        {/* Metric 3: Total Device Capacity */}
        <div className="p-5 rounded-2xl glass-card border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Devices</span>
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">{totalMaxDevices}</span>
            <span className="text-xs text-slate-400 ml-2">Total Gateway Devices</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Admin + Agent aggregate devices</p>
        </div>

        {/* Metric 4: Total SIM Capacity (devices * 2) */}
        <div className="p-5 rounded-2xl glass-card border border-purple-500/30 bg-purple-950/20 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Total SIM Capacity</span>
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-purple-200">{totalSimCapacity}</span>
            <span className="text-xs text-purple-400 ml-2">SIM Slots</span>
          </div>
          <p className="text-[11px] text-purple-300/80 mt-2 font-medium">Dual SIM per device (Device count × 2)</p>
        </div>
      </div>

      {/* Subscription Package Card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Active Subscription & Features
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Current Package Plan</p>
            <p className="text-lg font-bold text-purple-300 mt-1">{subInfo?.package?.title || 'Starter Pack (1 Month)'}</p>
            <span className="inline-block px-2 py-0.5 mt-2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active Status
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">API Integration Secret</p>
            <p className="text-sm font-mono text-slate-200 mt-2 truncate bg-black/40 px-3 py-1.5 rounded-lg border border-slate-800">
              {subInfo?.apiKey || 'opay_live_9f81a7b3c4e5d6a7b8c9'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Supported Mobile Operators</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 rounded bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-500/30">Bkash</span>
              <span className="px-2.5 py-1 rounded bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30">Nagad</span>
              <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">Rocket</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
