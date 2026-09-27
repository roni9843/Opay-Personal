import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Smartphone,
  Users,
  CreditCard,
  Activity,
  CheckCircle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  MoreVertical,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompanyDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/company/dashboard-stats');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading Merchant Analytics...</div>;
  }

  const sub = stats?.subscription;
  const isSubActive = sub && new Date(sub.endDate) > new Date();

  const chartBars = [30, 45, 60, 50, 80, 65, 95, 75, 85, 90, 70, 100];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome, <span className="bg-gradient-to-r from-fancyPink via-purple-400 to-fancyCyan bg-clip-text text-transparent">{user?.companyName || user?.name}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Realtime Payment Gateway Workspace: <span className="text-emerald-400 font-bold">{stats?.onlineDevices || 0} Devices Online</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/company/api-settings"
            className="px-5 py-2.5 rounded-full btn-fancy-pink text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
          >
            <span>API & Webhooks</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Subscription Banner Card */}
      <div className="fancy-card p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-pink-900/40">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-fancyPink/20 border border-fancyPink/40 text-fancyPink flex items-center justify-center shrink-0 shadow-fancyGlow">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{sub?.package?.title || 'No Active Subscription'}</h3>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                  isSubActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {isSubActive ? 'ACTIVE PLAN' : 'EXPIRED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Plan Validity Until: <span className="text-white font-semibold">{sub?.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block uppercase font-semibold text-[10px]">Devices Limit</span>
            <strong className="text-white text-lg">
              {stats?.totalDevices} / {sub?.maxDevicesSnapshot || 0}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-semibold text-[10px]">Agents Limit</span>
            <strong className="text-white text-lg">
              {stats?.totalAgents} / {sub?.maxAgentsSnapshot || 0}
            </strong>
          </div>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="fancy-card p-6 rounded-3xl border border-white/10 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SIM Devices</span>
            <Smartphone className="w-5 h-5 text-fancyCyan" />
          </div>
          <h4 className="text-3xl font-extrabold text-white mt-1">{stats?.totalDevices}</h4>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {stats?.onlineDevices} Online Now
          </p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-fancyCyan h-full w-[70%] rounded-full"></div>
          </div>
        </div>

        <div className="fancy-card p-6 rounded-3xl border border-white/10 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Staff Agents</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <h4 className="text-3xl font-extrabold text-white mt-1">{stats?.totalAgents}</h4>
          <p className="text-xs text-slate-400 mt-1">Assigned Operators</p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-purple-500 h-full w-[50%] rounded-full"></div>
          </div>
        </div>

        <div className="fancy-card p-6 rounded-3xl border border-white/10 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Volume</span>
            <Activity className="w-5 h-5 text-fancyPink" />
          </div>
          <h4 className="text-2xl font-extrabold text-white mt-1">৳ {stats?.todayTotalVolume?.toLocaleString() || 0}</h4>
          <p className="text-xs text-slate-400 mt-1">BDT Received Today</p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-fancyPink h-full w-[85%] rounded-full"></div>
          </div>
        </div>

        <div className="fancy-card p-6 rounded-3xl border border-white/10 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Today</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <h4 className="text-3xl font-extrabold text-white mt-1">{stats?.todayVerifiedCount}</h4>
          <p className="text-xs text-emerald-400 mt-1">Matched Transactions</p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-400 h-full w-[95%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Visual Graph Card */}
      <div className="fancy-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Daily Payment Traffic Trend</h3>
            <p className="text-xs text-slate-400">SMS parsing activity & verification matches</p>
          </div>
          <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
        </div>

        <div className="h-40 flex items-end justify-between gap-3 pt-6 border-b border-white/10 px-2">
          {chartBars.map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div
                className={`w-full rounded-t-lg transition-all duration-300 ${
                  i === 11 ? 'bg-fancyPink shadow-fancyGlow' : 'bg-purple-600/40 hover:bg-purple-500/70'
                }`}
                style={{ height: `${height}%` }}
              ></div>
              <span className="text-[10px] text-slate-500">{i + 1}h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
