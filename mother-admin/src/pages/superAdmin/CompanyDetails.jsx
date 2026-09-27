import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Smartphone, 
  Users, 
  Sparkles, 
  CreditCard,
  History,
  Edit3,
  Trash2,
  Key,
  X,
  ShieldAlert
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [editData, setEditData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    packageId: '',
    status: 'active',
  });

  useEffect(() => {
    fetchCompanyDetails();
    fetchPackages();
  }, [id]);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/super-admin/companies/${id}`);
      if (res.data.success) {
        setDetails(res.data.data);
        const comp = res.data.data.company;
        const sub = res.data.data.subscription;
        setEditData({
          name: comp.name || '',
          companyName: comp.companyName || '',
          email: comp.email || '',
          phone: comp.phone || '',
          password: '',
          packageId: sub?.package?._id || '',
          status: comp.status || 'active',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await API.get('/super-admin/packages');
      if (res.data.success) setPackages(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const { showToast } = useToast();

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/super-admin/companies/${id}`, editData);
      setEditModalOpen(false);
      showToast('Company details & package updated successfully', 'success');
      fetchCompanyDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating details', 'error');
    }
  };

  const handleToggleStatus = async () => {
    const currentStatus = details?.company?.status;
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await API.patch(`/super-admin/companies/${id}/status`, { status: newStatus });
      showToast(`Company status changed to ${newStatus}`, newStatus === 'active' ? 'success' : 'warning');
      fetchCompanyDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to PERMANENTLY DELETE merchant company "${details?.company?.companyName}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      await API.delete(`/super-admin/companies/${id}`);
      showToast('Company account and all resources deleted successfully', 'success');
      navigate('/super-admin/companies');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete company', 'error');
    }
  };

  if (loading) {
    return <div className="text-purple-300 text-center py-12">Loading merchant company details...</div>;
  }

  if (!details) {
    return (
      <div className="text-center py-12 text-rose-400">
        Company not found. <button onClick={() => navigate('/super-admin/companies')} className="underline">Back to list</button>
      </div>
    );
  }

  const { company, subscription, devices = [], agents = [], purchases = [] } = details;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/super-admin/companies')}
            className="p-2.5 rounded-2xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Building2 className="w-7 h-7 text-fancyPink" />
              {company.companyName || 'Merchant Details'}
            </h2>
            <p className="text-xs text-purple-200/70 mt-0.5">
              Owner: <strong className="text-white">{company.name}</strong> ({company.email})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setEditModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl btn-fancy-pink text-white text-xs font-extrabold shadow-lg flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" /> Edit Details & Package
          </button>

          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold border ${
              company.status === 'active'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {company.status === 'active' ? 'Suspend Account' : 'Activate Account'}
          </button>

          <button
            onClick={handleDeleteUser}
            className="px-4 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-extrabold shadow-lg flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        </div>
      </div>

      {/* Account Suspended Alert Banner if Suspended */}
      {company.status === 'suspended' && (
        <div className="p-5 rounded-3xl bg-rose-500/20 border-2 border-rose-500 text-rose-200 flex items-center gap-4 shadow-2xl">
          <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
          <div>
            <h4 className="text-lg font-extrabold text-rose-300 uppercase tracking-wide">ACCOUNT SUSPENDED BY SUPER ADMIN</h4>
            <p className="text-xs text-rose-200/90 mt-0.5 font-medium">
              This merchant user is currently suspended. Access to their merchant dashboard is blocked.
            </p>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Merchant Info */}
        <div className="fancy-card p-6 rounded-3xl border border-purple-500/20">
          <h3 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-fancyPink" /> Owner Contact Profile
          </h3>
          <div className="space-y-2 text-xs text-purple-200/80 font-medium">
            <p className="flex justify-between">
              <span>Owner Name:</span> <strong className="text-white">{company.name}</strong>
            </p>
            <p className="flex justify-between">
              <span>Email:</span> <strong className="text-white">{company.email}</strong>
            </p>
            <p className="flex justify-between">
              <span>Phone:</span> <strong className="text-white font-mono">{company.phone || 'N/A'}</strong>
            </p>
            <p className="flex justify-between items-center">
              <span>Account Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                company.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {company.status}
              </span>
            </p>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="fancy-card p-6 rounded-3xl border border-fancyPink/30 bg-gradient-to-br from-fancyPink/20 to-purple-950/70">
          <h3 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-fancyPink" /> Active Subscription Plan
          </h3>
          {subscription ? (
            <div className="space-y-2 text-xs text-purple-200/80 font-medium">
              <p className="text-base font-extrabold text-pink-300">{subscription.package?.title || 'Active Package'}</p>
              <p className="flex justify-between">
                <span>Start Date:</span> <strong className="text-white">{new Date(subscription.startDate).toLocaleDateString()}</strong>
              </p>
              <p className="flex justify-between">
                <span>Expires:</span> <strong className="text-white">{new Date(subscription.endDate).toLocaleDateString()}</strong>
              </p>
              <p className="flex justify-between">
                <span>Allowed SIM Capacity:</span> <strong className="text-emerald-300">{subscription.maxDevicesSnapshot * 2} SIM Slots</strong>
              </p>
            </div>
          ) : (
            <p className="text-xs text-rose-400 font-bold">No active package subscription assigned</p>
          )}
        </div>

        {/* System Usage */}
        <div className="fancy-card p-6 rounded-3xl border border-purple-500/20">
          <h3 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-fancyCyan" /> Gateway Resource Usage
          </h3>
          <div className="space-y-3 text-xs text-purple-200/80 font-medium">
            <div className="flex justify-between items-center">
              <span>Connected Devices:</span>
              <span className="px-3 py-1 rounded-full bg-fancyCyan/20 text-cyan-300 font-extrabold border border-fancyCyan/40">{devices.length} Devices</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Staff Agents:</span>
              <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 font-extrabold border border-pink-500/40">{agents.length} Agents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Purchases History */}
      <div className="fancy-container p-6 rounded-3xl border border-purple-500/20 shadow-xl">
        <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-fancyPink" /> Subscription Purchase Logs
        </h3>

        {purchases.length === 0 ? (
          <p className="text-xs text-purple-300/60 font-medium">No purchase logs found for this company.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#150c2d]/70 border-b border-purple-500/20 text-purple-300 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Gateway</th>
                  <th className="py-3 px-4">Trx ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 text-purple-200">
                {purchases.map((p) => (
                  <tr key={p._id}>
                    <td className="py-3 px-4 font-mono font-bold text-white">{p.invoiceNumber}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-300">৳{p.amount}</td>
                    <td className="py-3 px-4 font-semibold text-purple-300 uppercase">{p.bank || 'OraclePay'}</td>
                    <td className="py-3 px-4 font-mono text-purple-200/80">{p.transactionId || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-purple-300/60">{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Details & Package Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="fancy-container w-full max-w-lg p-6 md:p-8 rounded-3xl border border-purple-500/30 relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute right-4 top-4 text-purple-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-fancyPink" /> Edit Company Owner & Subscription Package
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
                <label className="block text-purple-200 font-bold mb-1 uppercase tracking-wider">
                  Assign / Change Package
                </label>
                <select
                  value={editData.packageId}
                  onChange={(e) => setEditData({ ...editData, packageId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#180f33] border border-purple-500/30 text-white focus:outline-none focus:border-fancyPink"
                >
                  <option value="">-- Select Package --</option>
                  {packages.map((pkg) => (
                    <option key={pkg._id} value={pkg._id}>
                      {pkg.title} ({pkg.durationMonths}mo - ৳{pkg.price})
                    </option>
                  ))}
                </select>
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
                  Save Changes & Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
