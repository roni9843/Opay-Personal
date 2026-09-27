import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Package, Plus, CheckCircle, Trash2, Edit2, Shield, X } from 'lucide-react';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    durationMonths: 1,
    price: 1500,
    maxDevices: 3,
    maxAgents: 5,
    featuresStr: 'Realtime SMS Sync, Webhook Callbacks, 24/7 Socket Listener',
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await API.get('/super-admin/packages');
      setPackages(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (pkg = null) => {
    if (pkg) {
      setEditingPkg(pkg);
      setFormData({
        title: pkg.title,
        durationMonths: pkg.durationMonths,
        price: pkg.price,
        maxDevices: pkg.maxDevices,
        maxAgents: pkg.maxAgents,
        featuresStr: pkg.features ? pkg.features.join(', ') : '',
      });
    } else {
      setEditingPkg(null);
      setFormData({
        title: '',
        durationMonths: 1,
        price: 1500,
        maxDevices: 3,
        maxAgents: 5,
        featuresStr: 'Realtime SMS Sync, Webhook Callbacks, 24/7 Socket Listener',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      features: formData.featuresStr.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingPkg) {
        await API.put(`/super-admin/packages/${editingPkg._id}`, payload);
      } else {
        await API.post('/super-admin/packages', payload);
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving package');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    try {
      await API.delete(`/super-admin/packages/${id}`);
      fetchPackages();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting package');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Subscription Packages</h2>
          <p className="text-xs text-slate-400 mt-1">Configure subscription plans, durations, device & agent limits</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Package</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-slate-400 text-center py-8">Loading packages...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-indigo-500/30 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {pkg.durationMonths} Month{pkg.durationMonths > 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(pkg)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg._id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white">{pkg.title}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">৳ {pkg.price}</span>
                  <span className="text-xs text-slate-400">/ {pkg.durationMonths}mo</span>
                </div>

                <div className="my-5 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Allowed Devices:</span>
                    <strong className="text-indigo-400">{pkg.maxDevices} Devices</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Allowed Agents:</span>
                    <strong className="text-purple-400">{pkg.maxAgents} Agents</strong>
                  </div>
                </div>

                {pkg.features && pkg.features.length > 0 && (
                  <ul className="space-y-2 text-xs text-slate-400 mb-6">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-white/10 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editingPkg ? 'Edit Package' : 'Create Subscription Package'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Package Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Starter 1 Month"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Price (BDT)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Max SIM Devices</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.maxDevices}
                    onChange={(e) => setFormData({ ...formData, maxDevices: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Max Staff Agents</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.maxAgents}
                    onChange={(e) => setFormData({ ...formData, maxAgents: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Features (Comma separated)</label>
                <textarea
                  rows="3"
                  value={formData.featuresStr}
                  onChange={(e) => setFormData({ ...formData, featuresStr: e.target.value })}
                  placeholder="Realtime SMS Sync, Instant Webhook Callbacks"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                ></textarea>
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
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
