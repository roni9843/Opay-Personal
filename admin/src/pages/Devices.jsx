import React, { useState } from 'react';
import { Smartphone, Battery, Signal, Plus, CheckCircle2 } from 'lucide-react';

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
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Smartphone className="w-7 h-7 text-fancyPink" />
            Gateway SIM Devices
          </h1>
          <p className="text-purple-200/70 text-sm mt-1 font-medium">
            Registered Android APK SIM Gateway devices & live battery/network status
          </p>
        </div>

        <button className="px-5 py-3 btn-fancy-pink text-white rounded-2xl text-xs font-bold transition-all shadow-xl flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Pair New Android Device</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((device) => (
          <div key={device.id} className="fancy-card p-6 rounded-3xl border border-purple-500/20 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fancyPink/30 to-fancyPurple/30 border border-fancyPink/40 text-pink-300 flex items-center justify-center shadow-lg">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{device.model}</h3>
                  <p className="text-xs text-pink-300 font-bold mt-0.5">{device.owner}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> Online
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-purple-500/20">
              <div className="flex items-center gap-2 text-xs text-purple-200/80">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span>Battery: <strong className="text-white font-extrabold">{device.battery}%</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-200/80">
                <Signal className="w-4 h-4 text-fancyCyan" />
                <span>Signal: <strong className="text-white font-extrabold">{device.signal}</strong></span>
              </div>
            </div>

            {/* Dual SIM Slots */}
            <div className="mt-5 space-y-2.5">
              <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">Connected Dual SIM Slots</p>
              <div className="grid grid-cols-2 gap-3">
                {device.simSlots.map((sim) => (
                  <div key={sim.slot} className="p-3 rounded-2xl bg-[#180f33]/90 border border-purple-500/30 text-xs shadow-inner">
                    <span className="text-[10px] text-pink-300 font-extrabold uppercase block">{sim.simType} ({sim.operator})</span>
                    <span className="text-white font-mono font-bold mt-0.5 block">{sim.number}</span>
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
