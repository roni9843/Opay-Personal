import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Building2, Plus, RefreshCw, ShieldAlert, CheckCircle2, UserCheck, X } from 'lucide-react';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    packageId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [compRes, pkgRes] = await Promise.all([
        API.get('/super-admin/companies'),
        API.get('/super-admin/packages'),
      ]);
      setCompanies(compRes.data.data);
      setPackages(pkgRes.data.data);
      if (pkgRes.data.data.length > 0) {
        setFormData((prev) => ({ ...prev, packageId: pkgRes.data.data[0]._id }));
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
      await API.post('/super-admin/companies', formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        password: '',
        packageId: packages[0]?._id || '',
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating company');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await API.patch(`/super-admin/companies/${id}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleExtendSub = async (companyId) => {
    if (packages.length === 0) return alert('No packages available');
    const selectedPkgId = prompt('Enter Package ID to assign/extend or leave default:', packages[0]._id);
    if (!selectedPkgId) return;

    try {
      await API.post(`/super-admin/companies/${companyId}/extend-subscription`, { packageId: selectedPkgId });
      alert('Subscription extended successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Extension failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Company Owners & Merchants</h2>
          <p className="text-xs text-slate-400 mt-1">Manage platform company accounts, assigned packages & statuses</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Company Owner</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-slate-400 text-center py-8">Loading company accounts...</div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Company / Owner</th>
                  <th className="py-3.5 px-4 font-semibold">Contact</th>
                  <th className="py-3.5 px-4 font-semibold">Active Plan</th>
                  <th className="py-3.5 px-4 font-semibold">Devices / Agents</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {companies.map((comp) => {
                  const sub = comp.subscription;
                  const isExpired = sub ? new Date(sub.endDate) < new Date() : true;
                  return (
                    <tr key={comp._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div>
                          <p className="text-sm font-semibold">{comp.companyName || 'N/A'}</p>
                          <p className="text-slate-400">{comp.name}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p>{comp.email}</p>
                        <p className="text-slate-500">{comp.phone || 'N/A'}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        {sub ? (
                          <div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-medium ${
                                isExpired
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {sub.package?.title || 'Active Package'}
                            </span>
                            <p className="text-slate-500 text-[10px] mt-1">
                              Expires: {new Date(sub.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-rose-400 font-medium">No Active Plan</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p>
                            Devices: <span className="text-indigo-400 font-semibold">{comp.deviceCount}</span>
                          </p>
                          <p>
                            Agents: <span className="text-purple-400 font-semibold">{comp.agentCount}</span>
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-medium ${
                            comp.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {comp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleExtendSub(comp._id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
                          title="Renew / Extend Subscription"
                        >
                          <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Extend
                        </button>
                        <button
                          onClick={() => handleToggleStatus(comp._id, comp.status)}
                          className={`px-2.5 py-1 rounded-lg ${
                            comp.status === 'active'
                              ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {comp.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-white/10 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Create New Company Owner</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Pay Ltd"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Owner Full Name"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="owner@company.com"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01700000000"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Account Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Assign Initial Package</label>
                <select
                  value={formData.packageId}
                  onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                >
                  {packages.map((pkg) => (
                    <option key={pkg._id} value={pkg._id}>
                      {pkg.title} ({pkg.durationMonths}mo - ৳{pkg.price})
                    </option>
                  ))}
                </select>
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
                  Create Company Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
