import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Building2, Users, Smartphone, ShieldCheck, CreditCard, Activity, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SuperAdminDashboard() {
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

  const statCards = [
    {
      title: 'Total Companies',
      value: stats?.totalCompanies || 0,
      sub: `${stats?.activeCompanies || 0} Active`,
      icon: Building2,
      color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.activeSubscriptions || 0,
      sub: 'Platform wide',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      title: 'Total SIM Devices',
      value: stats?.totalDevices || 0,
      sub: `${stats?.onlineDevices || 0} Online Now`,
      icon: Smartphone,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      title: 'Staff Agents',
      value: stats?.totalAgents || 0,
      sub: 'Assigned to Companies',
      icon: Users,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    },
    {
      title: 'Verified Payments',
      value: stats?.totalTransactions || 0,
      sub: 'Total Volume Matches',
      icon: CreditCard,
      color: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30',
    },
    {
      title: 'Processed Volume',
      value: `৳ ${stats?.totalVolumeBDT?.toLocaleString() || 0}`,
      sub: 'BDT Total Volume',
      icon: Activity,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Mother Super Admin Panel</h2>
          <p className="text-xs text-slate-400 mt-1">Global platform metrics, packages & company management</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/super-admin/packages"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow flex items-center gap-1.5 transition-all"
          >
            <span>Manage Packages</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/super-admin/companies"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span>Company Accounts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{card.value}</h3>
                  <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} border flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
