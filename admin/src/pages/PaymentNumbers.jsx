import React from 'react';
import { CreditCard, Plus, ShieldCheck } from 'lucide-react';

export default function PaymentNumbers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-fancyPink" />
            Payment Receiver Numbers
          </h1>
          <p className="text-purple-200/70 text-sm mt-1 font-medium">
            Registered Bkash, Nagad, and Rocket numbers configured for auto-recharge and verification
          </p>
        </div>

        <button className="px-5 py-3 btn-fancy-pink text-white rounded-2xl text-xs font-bold transition-all shadow-xl flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Payment Number
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bkash Card */}
        <div className="fancy-card p-6 rounded-3xl border border-bkash/40 bg-gradient-to-br from-bkash/25 via-purple-950/40 to-slate-950/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-bkash/25 text-pink-200 border border-bkash/40">Bkash Personal</span>
            <ShieldCheck className="w-5 h-5 text-bkash" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-4">01712345678</p>
          <p className="text-xs text-purple-200/70 font-medium mt-2">Device: Samsung Galaxy A14 (SIM 1)</p>
          <div className="mt-5 pt-4 border-t border-purple-500/20 flex items-center justify-between text-xs">
            <span className="text-purple-300 font-medium">Auto SMS Reader:</span>
            <span className="text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">Enabled</span>
          </div>
        </div>

        {/* Nagad Card */}
        <div className="fancy-card p-6 rounded-3xl border border-nagad/40 bg-gradient-to-br from-nagad/25 via-purple-950/40 to-slate-950/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-nagad/25 text-orange-200 border border-nagad/40">Nagad Personal</span>
            <ShieldCheck className="w-5 h-5 text-nagad" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-4">01798765432</p>
          <p className="text-xs text-purple-200/70 font-medium mt-2">Device: Samsung Galaxy A14 (SIM 2)</p>
          <div className="mt-5 pt-4 border-t border-purple-500/20 flex items-center justify-between text-xs">
            <span className="text-purple-300 font-medium">Auto SMS Reader:</span>
            <span className="text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">Enabled</span>
          </div>
        </div>

        {/* Rocket Card */}
        <div className="fancy-card p-6 rounded-3xl border border-rocket/40 bg-gradient-to-br from-rocket/25 via-purple-950/40 to-slate-950/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-rocket/25 text-purple-200 border border-rocket/40">Rocket Personal</span>
            <ShieldCheck className="w-5 h-5 text-rocket" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-4">01811223344</p>
          <p className="text-xs text-purple-200/70 font-medium mt-2">Device: Xiaomi Redmi 10 (SIM 1)</p>
          <div className="mt-5 pt-4 border-t border-purple-500/20 flex items-center justify-between text-xs">
            <span className="text-purple-300 font-medium">Auto SMS Reader:</span>
            <span className="text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
