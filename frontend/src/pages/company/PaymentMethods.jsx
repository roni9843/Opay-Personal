import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { CreditCard, Plus, Smartphone, CheckCircle, X } from 'lucide-react';

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    deviceId: '',
    provider: 'bkash',
    gateway: 'personal',
    accountNumber: '',
    simIndex: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mRes, dRes] = await Promise.all([
        API.get('/company/payment-methods'),
        API.get('/company/devices'),
      ]);
      setMethods(mRes.data.data);
      setDevices(dRes.data.data);
      if (dRes.data.data.length > 0) {
        setFormData((prev) => ({ ...prev, deviceId: dRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/company/payment-methods', formData);
      setIsModalOpen(false);
      setFormData({ deviceId: devices[0]?._id || '', provider: 'bkash', gateway: 'personal', accountNumber: '', simIndex: 1 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving number');
    }
  };

  const getProviderBadge = (provider) => {
    switch (provider.toLowerCase()) {
      case 'bkash':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">bKash</span>;
      case 'nagad':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">Nagad</span>;
      case 'rocket':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Rocket</span>;
      case 'upay':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Upay</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Mobile Banking SIM Numbers</h2>
          <p className="text-xs text-slate-400 mt-1">Configure bKash, Nagad, Rocket, Upay numbers for SIM 1 & SIM 2 on your devices</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Payment Number</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-slate-400 text-center py-8">Loading payment numbers...</div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Provider</th>
                  <th className="py-3.5 px-4 font-semibold">Account Number</th>
                  <th className="py-3.5 px-4 font-semibold">Gateway Type</th>
                  <th className="py-3.5 px-4 font-semibold">Device & SIM Slot</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned Agent</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {methods.map((method) => (
                  <tr key={method._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">{getProviderBadge(method.provider)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">{method.accountNumber}</td>
                    <td className="py-3.5 px-4 uppercase text-slate-400 font-semibold">{method.gateway}</td>
                    <td className="py-3.5 px-4">
                      <p className="text-white font-medium">{method.device?.deviceName || 'Unknown Device'}</p>
                      <p className="text-slate-500">Slot: SIM {method.simIndex}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {method.assignedAgent?.name || 'Company Owner'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {method.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/10 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Add Payment SIM Number</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Select Registered Device</label>
                <select
                  value={formData.deviceId}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                >
                  {devices.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.deviceName} ({d.deviceCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Provider</label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="upay">Upay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Gateway Type</label>
                  <select
                    value={formData.gateway}
                    onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="personal">Personal Account</option>
                    <option value="agent">Agent Account</option>
                    <option value="merchant">Merchant Account</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="01700000000"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">SIM Slot</label>
                  <select
                    value={formData.simIndex}
                    onChange={(e) => setFormData({ ...formData, simIndex: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>SIM 1</option>
                    <option value={2}>SIM 2</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-glow"
                >
                  Save Payment Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
