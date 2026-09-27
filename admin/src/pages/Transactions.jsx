import React, { useState } from 'react';
import { History, Search, CheckCircle2 } from 'lucide-react';

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
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-fancyPink" />
            AutoPayment Transactions
          </h1>
          <p className="text-purple-200/70 text-sm mt-1 font-medium">
            Real-time incoming payment SMS transaction logs verified by device SIMs
          </p>
        </div>
      </div>

      <div className="fancy-container rounded-3xl border border-purple-500/20 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search TrxID or Sender Phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#180f33]/80 border border-purple-500/30 rounded-2xl text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-fancyPink"
            />
          </div>
          <span className="text-xs text-purple-200/80 font-bold bg-purple-950/60 px-3.5 py-1.5 rounded-full border border-purple-500/30">
            Total Logged: 3 Trx
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider bg-[#150c2d]/70">
                <th className="py-4 px-5">Transaction ID</th>
                <th className="py-4 px-5">Method</th>
                <th className="py-4 px-5">Sender Phone</th>
                <th className="py-4 px-5">Receiver SIM</th>
                <th className="py-4 px-5">Amount</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 text-sm">
              {trxList.map((trx) => (
                <tr key={trx.id} className="hover:bg-purple-900/20 transition-colors">
                  <td className="py-4 px-5 font-mono font-extrabold text-pink-300">{trx.trxId}</td>
                  <td className="py-4 px-5 font-bold text-white">{trx.method}</td>
                  <td className="py-4 px-5 text-purple-200/80 font-mono font-medium">{trx.sender}</td>
                  <td className="py-4 px-5 text-purple-200/80 font-mono font-medium">{trx.receiver}</td>
                  <td className="py-4 px-5 font-extrabold text-emerald-300">৳{trx.amount}</td>
                  <td className="py-4 px-5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {trx.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-purple-200/60 text-xs text-right font-medium">{trx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
