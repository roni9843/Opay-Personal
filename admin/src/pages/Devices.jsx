import React, { useState } from 'react';
import { Smartphone, Battery, Signal, Plus, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function Devices() {
  const [devices] = useState([
    {
      id: 'DEV-8821',
      model: 'Samsung Galaxy A14 (Android 13)',
      owner: 'Admin Device',
      battery: 94,
      signal: 'Strong',
      status: 'online',
      simSlots: [
        { slot: 1, operator: 'Bkash Personal', number: '01712345678', simType: 'SIM 1' },
        { slot: 2, operator: 'Nagad Personal', number: '01798765432', simType: 'SIM 2' },
      ],
      lastSync: '10 seconds ago'
    },
    {
      id: 'DEV-8822',
      model: 'Xiaomi Redmi 10 (Android 12)',
      owner: 'Rafiq Islam (Agent)',
      battery: 82,
      signal: 'Good',
      status: 'online',
      simSlots: [
        { slot: 1, operator: 'Rocket Personal', number: '01811223344', simType: 'SIM 1' },
        { slot: 2, operator: 'Bkash Merchant', number: '01899887766', simType: 'SIM 2' },
      ],
      lastSync: '1 minute ago'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-purple-400" />
            Gateway SIM Devices
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Registered Android APK SIM Gateway devices & live battery/network status
          </p>
        </div>

        <button className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Pair New Android Device</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((device) => (
          <div key={device.id} className="glass-panel p-6 rounded-2xl border border-white/10 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{device.model}</h3>
                  <p className="text-xs text-purple-400 font-medium mt-0.5">{device.owner}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Online
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span>Battery: <strong className="text-slate-200">{device.battery}%</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Signal className="w-4 h-4 text-indigo-400" />
                <span>Signal: <strong className="text-slate-200">{device.signal}</strong></span>
              </div>
            </div>

            {/* SIM Slots Section (2 SIMs per device) */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Connected Dual SIM Slots</p>
              <div className="grid grid-cols-2 gap-2">
                {device.simSlots.map((sim) => (
                  <div key={sim.slot} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="text-[10px] text-purple-400 font-bold uppercase block">{sim.simType} ({sim.operator})</span>
                    <span className="text-slate-200 font-mono font-medium">{sim.number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
