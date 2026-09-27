import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Building2, Plus, RefreshCw, Eye, Edit3, Key, X, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedComp, setSelectedComp] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    packageId: '',
  });

  const [editData, setEditData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComp) return;
    try {
      await API.put(`/super-admin/companies/${selectedComp._id}`, editData);
      setEditModalOpen(false);
      alert('Company details updated successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating company details');
    }
  };

  const openEditModal = (comp) => {
    setSelectedComp(comp);
    setEditData({
      name: comp.name || '',
      companyName: comp.companyName || '',
      email: comp.email || '',
      phone: comp.phone || '',
      password: '',
    });
    setEditModalOpen(true);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-fancyPink" /> Company Owners & Merchants
          </h2>
          <p className="text-xs text-purple-200/70 mt-1">Manage platform merchant accounts, purchased packages, passwords & statuses</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl btn-fancy-pink text-white text-xs font-bold shadow-lg flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Merchant Company</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-purple-300 text-center py-8">Loading merchant accounts...</div>
      ) : (
        <div className="fancy-container rounded-3xl border border-purple-500/20 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#150c2d]/70 border-b border-purple-500/20 text-purple-300 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-4 px-5">Company / Owner</th>
                  <th className="py-4 px-5">Contact</th>
                  <th className="py-4 px-5">Active Plan</th>
                  <th className="py-4 px-5">Devices / Agents</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 text-purple-200">
                {companies.map((comp) => {
                  const sub = comp.subscription;
                  const isExpired = sub ? new Date(sub.endDate) < new Date() : true;
                  return (
                    <tr key={comp._id} className="hover:bg-purple-900/20 transition-colors">
                      <td className="py-4 px-5 font-bold text-white">
                        <div
                          onClick={() => navigate(`/super-admin/companies/${comp._id}`)}
                          className="cursor-pointer group"
                        >
                          <p className="text-sm font-extrabold text-white group-hover:text-pink-300 transition-colors flex items-center gap-1.5">
                            {comp.companyName || 'N/A'}
                            <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-pink-300 transition-all" />
                          </p>
                          <p className="text-purple-200/70 text-xs font-normal">{comp.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-medium">
                        <p>{comp.email}</p>
                        <p className="text-purple-300/60 font-mono text-[11px]">{comp.phone || 'N/A'}</p>
                      </td>
                      <td className="py-4 px-5">
                        {sub ? (
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isExpired
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {sub.package?.title || 'Active Package'}
                            </span>
                            <p className="text-purple-300/60 text-[10px] mt-1 font-medium">
                              Expires: {new Date(sub.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            No Active Plan
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <div className="space-y-0.5 font-medium">
                          <p>
                            Devices: <span className="text-fancyCyan font-bold">{comp.deviceCount}</span>
                          </p>
                          <p>
                            Agents: <span className="text-pink-300 font-bold">{comp.agentCount}</span>
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            comp.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {comp.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/super-admin/companies/${comp._id}`)}
                          className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 font-bold"
                          title="View Full Details"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" /> View
                        </button>
                        <button
                          onClick={() => openEditModal(comp)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/30 font-bold"
                          title="Edit Details & Password"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(comp._id, comp.status)}
                          className={`px-3 py-1.5 rounded-xl font-bold ${
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

      {/* Edit Details & Password Modal */}
      {editModalOpen && selectedComp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="fancy-container w-full max-w-lg p-6 md:p-8 rounded-3xl border border-purple-500/30 relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute right-4 top-4 text-purple-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-fancyPink" /> Edit Company Owner Details & Password
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-200 font-bold mb-1 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editData.companyName}
                    onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#180f33] border border-purple-500/30 text-white focus:outline-none focus:border-fancyPink"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 font-bold mb-1 uppercase tracking-wider">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#180f33] border border-purple-500/30 text-white focus:outline-none focus:border-fancyPink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-200 font-bold mb-1 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#180f33] border border-purple-500/30 text-white focus:outline-none focus:border-fancyPink"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 font-bold mb-1 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#180f33] border border-purple-500/30 text-white focus:outline-none focus:border-fancyPink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 font-bold mb-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Change Password</span>
                  <span className="text-[10px] text-purple-400 font-normal">Leave blank if unchanged</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter new password (min 6 chars)"
                    value={editData.password}
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#180f33] border border-purple-500/30 text-white focus:outline-none focus:border-fancyPink font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-purple-500/20">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-purple-950/60 text-purple-300 border border-purple-500/30 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 btn-fancy-pink text-white font-extrabold rounded-2xl shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="fancy-container w-full max-w-lg p-6 md:p-8 rounded-3xl border border-purple-500/30 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-purple-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white mb-4">Create New Merchant Company</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-200 font-bold mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Pay Ltd"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#180f33] border border-purple-500/30 text-white focus:outline-none focus:border-fancyPink"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 font-bold mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Owner Full Name"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#180f33] border border-purple-500/30 text-white focus:outline-none focus:border-fancyPink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-200 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="owner@company.com"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#180f33] border border-purple-500/30 text-white focus:outline-none focus:border-fancyPink"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01700000000"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#180f33] border border-purple-500/30 text-white focus:outline-none focus:border-fancyPink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 font-bold mb-1">Account Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#180f33] border border-purple-500/30 text-white focus:outline-none focus:border-fancyPink"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-purple-500/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-purple-950/60 text-purple-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 btn-fancy-pink text-white font-extrabold rounded-2xl shadow-lg"
                >
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
