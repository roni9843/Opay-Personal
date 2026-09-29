import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Smartphone, 
  CreditCard, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Activity
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
    setLoading(true);
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

  const hasSubscription = Boolean(subInfo && subInfo.active);
  const maxAdminDevices = subInfo ? (subInfo.maxAdminDevicesSnapshot || 0) : 0;
  const maxAgents = subInfo ? (subInfo.maxAgentsSnapshot || 0) : 0;
  const maxDevicesPerAgent = subInfo ? (subInfo.maxDevicesPerAgentSnapshot || 0) : 0;
  const totalMaxDevices = subInfo ? (subInfo.maxDevicesSnapshot || (maxAdminDevices + (maxAgents * maxDevicesPerAgent))) : 0;
  const totalSimCapacity = totalMaxDevices * 2;
  const freeSms = subInfo?.package?.freeSmsCount || 0;
  const extraSms = subInfo?.extraSmsBalance || 0;
  const totalAvailableSms = freeSms + extraSms;

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl fancy-card border border-fancyPink/30 bg-gradient-to-r from-purple-950/70 via-pink-950/40 to-slate-950/80 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-fancyPink/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-fancyPink/20 border border-fancyPink/40 text-pink-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-lg shadow-fancyPink/20">
              <Sparkles className="w-4 h-4 text-fancyPink animate-pulse" /> Company Control Panel
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Welcome back, {user?.name || 'O-Pay Personal Owner'}! 👋
            </h1>
            <p className="text-purple-200/80 text-sm mt-1.5 font-medium">
              Company: <span className="text-pink-300 font-bold">{user?.companyName}</span> | Automated SIM Gateway Control Center
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-lg ${
              hasSubscription ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}>
              <Zap className={`w-4 h-4 ${hasSubscription ? 'text-emerald-400 animate-bounce' : 'text-rose-400'}`} />
              <span>{hasSubscription ? 'Gateway Engine Online' : 'No Active Package'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* No Active Package Warning Alert */}
      {!hasSubscription && !loading && (
        <div className="p-6 rounded-3xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-start gap-3.5">
            <Sparkles className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-base font-extrabold text-amber-300">No Active Subscription Package</h4>
              <p className="text-xs text-amber-200/80 mt-1 font-medium">
                You currently do not have an active package subscription. Please purchase a package to activate SIM Devices, Staff Agents, and Webhook Callbacks.
              </p>
            </div>
          </div>
          <a
            href="/packages"
            className="px-6 py-3 rounded-2xl btn-fancy-pink text-white text-xs font-extrabold shadow-lg shrink-0 text-center"
          >
            Buy Package Now
          </a>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Admin Devices */}
        <div className="p-6 rounded-3xl fancy-card relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200/80 uppercase tracking-wider">Admin Devices</span>
            <div className="p-3 rounded-2xl bg-fancyPink/20 text-fancyPink border border-fancyPink/30 shadow-lg shadow-fancyPink/20">
              <Smartphone className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-white">{maxAdminDevices}</span>
            <span className="text-xs text-purple-300 ml-2 font-medium">Device Limit</span>
          </div>
          <p className="text-[11px] text-purple-300/60 mt-2 font-medium">Dedicated Admin SIM controller</p>
        </div>

        {/* Metric 2: Staff Agents Quota */}
        <div className="p-6 rounded-3xl fancy-card fancy-card-cyan relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200/80 uppercase tracking-wider">Staff Agents Quota</span>
            <div className="p-3 rounded-2xl bg-fancyCyan/20 text-fancyCyan border border-fancyCyan/30 shadow-lg shadow-fancyCyan/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-white">{maxAgents}</span>
            <span className="text-xs text-purple-300 ml-2 font-medium">Max Agents</span>
          </div>
          <p className="text-[11px] text-purple-300/60 mt-2 font-medium">{maxDevicesPerAgent} device(s) allowed per agent</p>
        </div>

        {/* Metric 3: Total Available SMS Quota */}
        <div className="p-6 rounded-3xl fancy-card relative overflow-hidden group border border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Available SMS</span>
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/20">
              <Activity className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-white">{totalAvailableSms}</span>
            <span className="text-xs text-amber-300 ml-2 font-bold">SMS Balance</span>
          </div>
          <p className="text-[11px] text-purple-300/60 mt-2 font-medium">
            Included: {freeSms} | Extra: {extraSms}
          </p>
        </div>

        {/* Metric 4: SIM Capacity (devices * 2) */}
        <div className="p-6 rounded-3xl fancy-card border border-fancyPink/40 bg-gradient-to-br from-fancyPink/25 to-purple-950/70 relative overflow-hidden group shadow-xl shadow-fancyPink/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-pink-300 uppercase tracking-wider">Total SIM Capacity</span>
            <div className="p-3 rounded-2xl bg-fancyPink/30 text-white border border-fancyPink/50 shadow-lg">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-white">{totalSimCapacity}</span>
            <span className="text-xs text-pink-300 ml-2 font-bold">SIM Slots</span>
          </div>
          <p className="text-[11px] text-pink-200/90 mt-2 font-bold">Dual SIM per device (Device count × 2)</p>
        </div>
      </div>

      {/* Subscription Package Card */}
      <div className="fancy-container p-6 md:p-8 rounded-3xl border border-purple-500/20">
        <h3 className="text-lg font-extrabold text-white mb-5 flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-fancyPink" />
          Active Subscription & Mobile Banking Features
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#180f33]/80 border border-purple-500/20">
            <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">Current Package Plan</p>
            <p className="text-xl font-extrabold text-pink-300 mt-2">{subInfo?.package?.title || 'No Active Package'}</p>
            <span className={`inline-block px-3 py-1 mt-3 rounded-full text-xs font-bold border ${
              hasSubscription ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              {hasSubscription ? 'Active Subscription' : 'No Package Purchased'}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#180f33]/80 border border-purple-500/20">
            <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">API Integration Key</p>
            <p className="text-xs font-mono text-purple-200 mt-3 truncate bg-[#100922] px-3.5 py-2.5 rounded-xl border border-purple-500/30">
              {subInfo?.apiKey || 'No API Key generated'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#180f33]/80 border border-purple-500/20">
            <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">Supported Operators</p>
            <div className="flex items-center gap-2.5 mt-3">
              <span className="px-3 py-1.5 rounded-xl bg-bkash/20 text-pink-300 text-xs font-extrabold border border-bkash/40 shadow-sm">Bkash</span>
              <span className="px-3 py-1.5 rounded-xl bg-nagad/20 text-orange-300 text-xs font-extrabold border border-nagad/40 shadow-sm">Nagad</span>
              <span className="px-3 py-1.5 rounded-xl bg-rocket/20 text-purple-300 text-xs font-extrabold border border-rocket/40 shadow-sm">Rocket</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
