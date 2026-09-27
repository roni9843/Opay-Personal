import React, { useState } from 'react';
import { Users, UserPlus, Smartphone, MoreVertical, Search, CheckCircle } from 'lucide-react';

export default function Agents() {
  const [agents] = useState([
    { id: 1, name: 'Rafiq Islam', email: 'rafiq@company.com', phone: '01711223344', devicesAllowed: 1, status: 'active', createdAt: '2026-09-20' },
    { id: 2, name: 'Shahid Ahmed', email: 'shahid@company.com', phone: '01899887766', devicesAllowed: 1, status: 'active', createdAt: '2026-09-22' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-fancyPink" />
            Staff Agents Management
          </h1>
          <p className="text-purple-200/70 text-sm mt-1 font-medium">
            Create and assign gateway permissions to staff agents (Quota: 2 Agents Max)
          </p>
        </div>

        <button className="px-5 py-3 btn-fancy-pink text-white rounded-2xl text-xs font-bold transition-all shadow-xl flex items-center gap-2 self-start sm:self-auto">
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Agent</span>
        </button>
      </div>

      <div className="fancy-container rounded-3xl border border-purple-500/20 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agent name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#180f33]/80 border border-purple-500/30 rounded-2xl text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-fancyPink"
            />
          </div>
          <span className="text-xs text-purple-200/80 font-bold bg-purple-950/60 px-3 py-1.5 rounded-full border border-purple-500/30">
            Showing 2 of 2 Max Agents
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider bg-[#150c2d]/70">
                <th className="py-4 px-5">Agent Name</th>
                <th className="py-4 px-5">Email</th>
                <th className="py-4 px-5">Phone</th>
                <th className="py-4 px-5">Allowed Devices</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 text-sm">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-purple-900/20 transition-colors">
                  <td className="py-4 px-5 font-bold text-white flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-fancyPink to-fancyPurple text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                      {agent.name.charAt(0)}
                    </div>
                    {agent.name}
                  </td>
                  <td className="py-4 px-5 text-purple-200/80 font-medium">{agent.email}</td>
                  <td className="py-4 px-5 text-purple-200/80 font-mono font-medium">{agent.phone}</td>
                  <td className="py-4 px-5">
                    <span className="px-3 py-1 rounded-full bg-fancyCyan/15 text-cyan-300 text-xs font-bold border border-fancyCyan/30 flex items-center gap-1.5 w-fit">
                      <Smartphone className="w-3.5 h-3.5" />
                      {agent.devicesAllowed} Device
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
                      <CheckCircle className="w-3.5 h-3.5" /> Active
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button className="p-2 text-purple-300 hover:text-white rounded-xl hover:bg-purple-900/50 transition-colors border border-transparent hover:border-purple-500/30">
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
