import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { MessageSquare, RefreshCw, Send, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';

export default function SmsLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchSmsLogs(1);
  }, []);

  const fetchSmsLogs = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await API.get('/super-admin/sms-logs', { params: { page, limit: 20 } });
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">SMS Gateway & OTP Logs</h2>
          <p className="text-xs text-slate-400 mt-1">
            Realtime history of sent verification OTPs and SMS messages via O-SMS API
          </p>
        </div>
        <button
          onClick={() => fetchSmsLogs(pagination.page)}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-slate-400 text-center py-8">Loading SMS Gateway Logs...</div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Recipient Phone</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">OTP Code</th>
                  <th className="py-3.5 px-4 font-semibold">Message Body</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Sent Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                      {log.recipient}
                    </td>
                    <td className="py-3.5 px-4 uppercase font-bold text-indigo-400">
                      {log.type}
                    </td>
                    <td className="py-3.5 px-4">
                      {log.otp ? (
                        <span className="px-2.5 py-0.5 rounded font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {log.otp}
                        </span>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                      {log.message || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      {log.status === 'sent' ? (
                        <span className="px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> SENT
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 w-fit">
                          <AlertCircle className="w-3 h-3" /> FAILED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchSmsLogs(pagination.page - 1)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchSmsLogs(pagination.page + 1)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
