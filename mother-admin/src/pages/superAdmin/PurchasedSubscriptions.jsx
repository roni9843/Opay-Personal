import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { CreditCard, Search, RefreshCw, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function PurchasedSubscriptions() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await API.get('/super-admin/purchased-subscriptions');
      if (res.data.success) {
        setPurchases(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-fancyPink" />
            Purchased Subscription Logs
          </h2>
          <p className="text-xs text-purple-200/70 mt-1 font-medium">
            List of all O-Pay Personal package purchases processed via OraclePay Auto Deposit Gateway
          </p>
        </div>

        <button
          onClick={fetchPurchases}
          className="px-4 py-2.5 rounded-2xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Logs
        </button>
      </div>

      {loading ? (
        <div className="text-purple-300 text-center py-10">Loading subscription purchases...</div>
      ) : (
        <div className="fancy-container rounded-3xl border border-purple-500/20 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Invoice # or Company Email..."
                className="w-full pl-10 pr-4 py-2 bg-[#180f33] border border-purple-500/30 rounded-2xl text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-fancyPink"
              />
            </div>
            <span className="text-xs text-purple-200/80 font-bold bg-purple-950/60 px-3.5 py-1.5 rounded-full border border-purple-500/30">
              Total Purchases: {purchases.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#150c2d]/70 border-b border-purple-500/20 text-purple-300 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-4 px-5">Invoice Number</th>
                  <th className="py-4 px-5">O-Pay Personal User / Company</th>
                  <th className="py-4 px-5">Package Purchased</th>
                  <th className="py-4 px-5">Amount</th>
                  <th className="py-4 px-5">Gateway & TrxID</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 text-purple-200 font-medium">
                {purchases.map((item) => (
                  <tr key={item._id} className="hover:bg-purple-900/20 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-pink-300">{item.invoiceNumber}</td>
                    <td className="py-4 px-5">
                      <p className="font-extrabold text-white">{item.companyOwner?.companyName || 'O-Pay Personal User'}</p>
                      <p className="text-purple-300/60 text-[11px]">{item.companyOwner?.email}</p>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-500/30">
                        {item.package?.title || 'Subscription Package'}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-extrabold text-emerald-300">৳{item.amount}</td>
                    <td className="py-4 px-5 font-mono text-[11px]">
                      <p className="text-purple-300 font-bold uppercase">{item.bank || 'OraclePay'}</p>
                      <p className="text-purple-200/60">{item.transactionId || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase flex items-center gap-1 w-fit ${
                          item.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {item.status === 'COMPLETED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right text-purple-300/60 text-[11px]">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
