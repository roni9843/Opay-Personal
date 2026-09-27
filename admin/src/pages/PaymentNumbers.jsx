import React from 'react';
import { CreditCard, Plus, ShieldCheck } from 'lucide-react';

export default function PaymentNumbers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-400" />
            Payment Receiver Numbers
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Registered Bkash, Nagad, and Rocket numbers configured for auto-recharge and verification
          </p>
        </div>

        <button className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Payment Number
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-950/20 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">Bkash Personal</span>
            <ShieldCheck className="w-5 h-5 text-pink-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-4">01712345678</p>
          <p className="text-xs text-slate-400 mt-2">Device: Samsung Galaxy A14 (SIM 1)</p>
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Auto SMS Reader:</span>
            <span className="text-emerald-400 font-semibold">Enabled</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-950/20 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">Nagad Personal</span>
            <ShieldCheck className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-4">01798765432</p>
          <p className="text-xs text-slate-400 mt-2">Device: Samsung Galaxy A14 (SIM 2)</p>
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Auto SMS Reader:</span>
            <span className="text-emerald-400 font-semibold">Enabled</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/20 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Rocket Personal</span>
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-4">01811223344</p>
          <p className="text-xs text-slate-400 mt-2">Device: Xiaomi Redmi 10 (SIM 1)</p>
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Auto SMS Reader:</span>
            <span className="text-emerald-400 font-semibold">Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
