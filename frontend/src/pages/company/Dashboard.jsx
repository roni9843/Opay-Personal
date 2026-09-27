import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Smartphone, Users, CreditCard, Activity, CheckCircle, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompanyDashboard() {
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Merchant Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">Realtime overview of active devices, agents & today's payments</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/company/api-settings"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow flex items-center gap-1.5 transition-all"
          >
            <span>API & Webhooks</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{sub?.package?.title || 'No Active Subscription'}</h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  isSubActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {isSubActive ? 'ACTIVE' : 'EXPIRED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Plan Validity Until: {sub?.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-300">
          <div>
            <span className="text-slate-500 block">Device Limit:</span>
            <strong className="text-white text-sm">
              {stats?.totalDevices} / {sub?.maxDevicesSnapshot || 0}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Agent Limit:</span>
            <strong className="text-white text-sm">
              {stats?.totalAgents} / {sub?.maxAgentsSnapshot || 0}
            </strong>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase">SIM Devices</p>
            <Smartphone className="w-5 h-5 text-indigo-400" />
          </div>
          <h4 className="text-2xl font-bold text-white mt-2">{stats?.totalDevices}</h4>
          <p className="text-xs text-emerald-400 mt-1">{stats?.onlineDevices} Online Now</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase">Staff Agents</p>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <h4 className="text-2xl font-bold text-white mt-2">{stats?.totalAgents}</h4>
          <p className="text-xs text-slate-500 mt-1">Assigned sub-users</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase">Today's Volume</p>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <h4 className="text-2xl font-bold text-white mt-2">৳ {stats?.todayTotalVolume?.toLocaleString() || 0}</h4>
          <p className="text-xs text-slate-500 mt-1">Received today</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase">Verified Today</p>
            <CheckCircle className="w-5 h-5 text-pink-400" />
          </div>
          <h4 className="text-2xl font-bold text-white mt-2">{stats?.todayVerifiedCount}</h4>
          <p className="text-xs text-slate-500 mt-1">Matched transactions</p>
        </div>
      </div>
    </div>
  );
}
