import React, { useState } from 'react';
import { Users, UserPlus, Shield, Smartphone, MoreVertical, Search, CheckCircle, XCircle } from 'lucide-react';

export default function Agents() {
  const [agents] = useState([
    { id: 1, name: 'Rafiq Islam', email: 'rafiq@company.com', phone: '01711223344', devicesAllowed: 1, status: 'active', createdAt: '2026-09-20' },
    { id: 2, name: 'Shahid Ahmed', email: 'shahid@company.com', phone: '01899887766', devicesAllowed: 1, status: 'active', createdAt: '2026-09-22' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Staff Agents Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create and assign gateway permissions to staff agents (Quota: 2 Agents Max)
          </p>
        </div>

        <button className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 self-start sm:self-auto">
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Agent</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agent name or email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <span className="text-xs text-slate-400">Showing 2 of 2 Max Agents</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-950/40">
                <th className="py-3.5 px-4">Agent Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Allowed Devices</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-4 font-semibold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                      {agent.name.charAt(0)}
                    </div>
                    {agent.name}
                  </td>
                  <td className="py-4 px-4 text-slate-300">{agent.email}</td>
                  <td className="py-4 px-4 text-slate-300">{agent.phone}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20 flex items-center gap-1 w-fit">
                      <Smartphone className="w-3.5 h-3.5" />
                      {agent.devicesAllowed} Device
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
