import React, { useState } from 'react';
import { History, Search, ArrowDownLeft, CheckCircle2, RefreshCw } from 'lucide-react';

export default function Transactions() {
  const [trxList] = useState([
    { id: '1', trxId: 'BKS9K2L1M0P', method: 'Bkash', sender: '01711998877', receiver: '01712345678', amount: 1500, status: 'Completed', date: '2026-09-27 21:40' },
    { id: '2', trxId: 'NGD7X4P2Q9W', method: 'Nagad', sender: '01822334455', receiver: '01798765432', amount: 500, status: 'Completed', date: '2026-09-27 20:15' },
    { id: '3', trxId: 'RCK3M9N8B7V', method: 'Rocket', sender: '01933445566', receiver: '01811223344', amount: 2000, status: 'Completed', date: '2026-09-27 18:02' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" />
            AutoPayment Transactions
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time incoming payment SMS transaction logs verified by device SIMs
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search TrxID or Sender Phone..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <span className="text-xs text-slate-400">Total Logged: 3 Trx</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-950/40">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Sender Phone</th>
                <th className="py-3.5 px-4">Receiver SIM</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {trxList.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-purple-300">{trx.trxId}</td>
                  <td className="py-4 px-4 font-semibold text-white">{trx.method}</td>
                  <td className="py-4 px-4 text-slate-300 font-mono">{trx.sender}</td>
                  <td className="py-4 px-4 text-slate-300 font-mono">{trx.receiver}</td>
                  <td className="py-4 px-4 font-bold text-emerald-400">৳{trx.amount}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" /> {trx.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-xs text-right">{trx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
