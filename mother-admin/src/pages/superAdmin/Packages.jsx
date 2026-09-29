import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Package, Plus, CheckCircle, Trash2, Edit2, Shield, X, Tag } from 'lucide-react';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    durationMonths: 1,
    regularPrice: 2000,
    price: 1500, // Offer Price
    maxAdminDevices: 2,
    maxAgents: 3,
    maxDevicesPerAgent: 2,
    freeSmsCount: 1000,
    chargeType: 'percentage',
    chargeValue: 1.5,
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
        regularPrice: pkg.regularPrice || pkg.price,
        price: pkg.price,
        maxAdminDevices: pkg.maxAdminDevices || 1,
        maxAgents: pkg.maxAgents || 1,
        maxDevicesPerAgent: pkg.maxDevicesPerAgent || 1,
        freeSmsCount: pkg.freeSmsCount !== undefined ? pkg.freeSmsCount : 1000,
        chargeType: pkg.chargeType || 'percentage',
        chargeValue: pkg.chargeValue !== undefined ? pkg.chargeValue : 0,
        featuresStr: pkg.features ? pkg.features.join(', ') : '',
      });
    } else {
      setEditingPkg(null);
      setFormData({
        title: '',
        durationMonths: 1,
        regularPrice: 2000,
        price: 1500,
        maxAdminDevices: 2,
        maxAgents: 3,
        maxDevicesPerAgent: 2,
        freeSmsCount: 1000,
        chargeType: 'percentage',
        chargeValue: 1.5,
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
          <p className="text-xs text-slate-400 mt-1">Configure pricing, discount offers, admin & staff agent device limits</p>
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
          {packages.map((pkg) => {
            const hasOffer = pkg.regularPrice && pkg.regularPrice > pkg.price;
            return (
              <div
                key={pkg._id}
                className="fancy-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-indigo-500/30 transition-all group relative overflow-hidden"
              >
                {hasOffer && (
                  <div className="absolute -right-12 top-6 bg-gradient-to-r from-fancyPink to-rose-600 text-white text-[10px] font-extrabold uppercase px-12 py-1 rotate-45 shadow-md">
                    OFFER!
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {pkg.durationMonths} Month{pkg.durationMonths > 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={() => handleOpenModal(pkg)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg._id)}
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white">{pkg.title}</h3>

                  {/* Pricing Display with Offer & Regular Price */}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">৳ {pkg.price}</span>
                    {hasOffer && (
                      <span className="text-sm font-semibold text-slate-400 line-through">
                        ৳ {pkg.regularPrice}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">/ {pkg.durationMonths}mo</span>
                  </div>

                  {/* Limits Breakdown */}
                  {(() => {
                    const adminDevs = pkg.maxAdminDevices || 1;
                    const agentCount = pkg.maxAgents || 1;
                    const devsPerAgent = pkg.maxDevicesPerAgent || 1;
                    const totalDevices = adminDevs + agentCount * devsPerAgent;
                    const totalSimCapacity = totalDevices * 2;
                    return (
                      <div className="my-5 p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-300">
                        <div className="flex justify-between items-center">
                          <span>Admin Devices:</span>
                          <strong className="text-emerald-400 font-semibold">{adminDevs} Devices</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Staff Agents:</span>
                          <strong className="text-purple-400 font-semibold">{agentCount} Agents</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Devices per Agent:</span>
                          <strong className="text-cyan-400 font-semibold">{devsPerAgent} Device/Agent</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Free SMS Quota:</span>
                          <strong className="text-amber-300 font-semibold">{pkg.freeSmsCount !== undefined ? pkg.freeSmsCount : 1000} SMS</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Per Trx Charge:</span>
                          <strong className="text-emerald-300 font-semibold">
                            {pkg.chargeValue || 0} {pkg.chargeType === 'flat' ? 'BDT' : '%'}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center pt-1.5 border-t border-white/10 text-[11px]">
                          <span className="text-slate-400">Total Devices:</span>
                          <strong className="text-white font-bold">{totalDevices} Devices</strong>
                        </div>
                        <div className="flex justify-between items-center font-extrabold text-xs">
                          <span className="text-slate-300">Total SIM Capacity:</span>
                          <span className="text-fancyPink font-mono">{totalSimCapacity} SIMs ({totalDevices} × 2)</span>
                        </div>
                      </div>
                    );
                  })()}

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
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-white/10 relative max-h-[90vh] overflow-y-auto">
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
                <label className="block text-slate-300 mb-1 font-semibold">Package Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Starter Offer Pack"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Duration (Mo)</label>
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
                  <label className="block text-slate-300 mb-1 font-semibold">Regular Price (৳)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.regularPrice}
                    onChange={(e) => setFormData({ ...formData, regularPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold text-fancyPink">Offer Price (৳)</label>
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

              {/* SMS Limit & Per Transaction Charge Config */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <p className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">SMS Quota & Transaction Fee Setup</p>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Free SMS Count</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.freeSmsCount}
                      onChange={(e) => setFormData({ ...formData, freeSmsCount: Number(e.target.value) })}
                      placeholder="e.g. 1000"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Charge Type</label>
                    <select
                      value={formData.chargeType}
                      onChange={(e) => setFormData({ ...formData, chargeType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#180f33] border border-white/10 text-white focus:outline-none focus:border-indigo-500 font-semibold"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Fixed / Flat (BDT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">
                      Charge Rate ({formData.chargeType === 'flat' ? '৳' : '%'})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.chargeValue}
                      onChange={(e) => setFormData({ ...formData, chargeValue: Number(e.target.value) })}
                      placeholder={formData.chargeType === 'flat' ? 'e.g. 5 BDT' : 'e.g. 1.5%'}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Device Limits Config */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <p className="font-bold text-indigo-300 text-[11px] uppercase tracking-wider">Device & Agent Limits Setup</p>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Admin Devices</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.maxAdminDevices}
                      onChange={(e) => setFormData({ ...formData, maxAdminDevices: Number(e.target.value) })}
                      placeholder="Devices for Admin"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Staff Agents</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.maxAgents}
                      onChange={(e) => setFormData({ ...formData, maxAgents: Number(e.target.value) })}
                      placeholder="Staff Agents count"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Devices / Agent</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.maxDevicesPerAgent}
                      onChange={(e) => setFormData({ ...formData, maxDevicesPerAgent: Number(e.target.value) })}
                      placeholder="Devices per Agent"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Features (Comma separated)</label>
                <textarea
                  rows="3"
                  value={formData.featuresStr}
                  onChange={(e) => setFormData({ ...formData, featuresStr: e.target.value })}
                  placeholder="Realtime SMS Sync, Instant Webhook Callbacks"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
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
                  className="px-5 py-2.5 rounded-xl btn-fancy-pink text-white font-semibold shadow-fancyGlow"
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
