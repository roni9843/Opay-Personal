import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Smartphone, Receipt, BatteryCharging, CheckCircle, Clock } from 'lucide-react';

export default function AgentDashboard() {
  const [devices, setDevices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAgentData();
  }, []);

  const fetchAgentData = async () => {
    try {
      const [devRes, txRes] = await Promise.all([
        API.get('/agent/assigned-devices'),
        API.get('/agent/transactions'),
      ]);
      setDevices(devRes.data.data);
      setTransactions(txRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Staff Agent Workspace</h2>
        <p className="text-xs text-slate-400 mt-1">Monitored devices & real-time SMS stream assigned to your account</p>
      </div>

      {isLoading ? (
        <div className="text-slate-400 text-center py-8">Loading workspace...</div>
      ) : (
        <>
          {/* Assigned Devices */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Assigned Devices ({devices.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((dev) => (
                <div key={dev._id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${dev.state ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                      <span className="text-xs font-semibold text-slate-200">{dev.deviceName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <BatteryCharging className="w-4 h-4 text-emerald-400" />
                      <span>{dev.batteryLevel}%</span>
                    </div>
                  </div>

                  {dev.paymentMethods && dev.paymentMethods.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      {dev.paymentMethods.map((m) => (
                        <div key={m._id} className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-lg">
                          <span className="uppercase font-bold text-indigo-400">SIM {m.simIndex}: {m.provider}</span>
                          <span className="font-mono text-white font-semibold">{m.accountNumber}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Transactions Stream */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Recent Transactions Stream
            </h3>
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-semibold">TrxID</th>
                      <th className="py-3 px-4 font-semibold">Provider</th>
                      <th className="py-3 px-4 font-semibold">Amount</th>
                      <th className="py-3 px-4 font-semibold">Sender</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-white/5">
                        <td className="py-3 px-4 font-mono font-bold text-white">{tx.trxID}</td>
                        <td className="py-3 px-4 uppercase font-semibold text-indigo-400">{tx.provider}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">৳ {tx.amount}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{tx.from}</td>
                        <td className="py-3 px-4">
                          {tx.verify ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400">
                              VERIFIED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400">
                              UNVERIFIED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{new Date(tx.createdAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
