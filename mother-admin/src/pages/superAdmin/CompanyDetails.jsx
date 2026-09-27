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
  ShieldAlert
} from 'lucide-react';

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/super-admin/companies/${id}`);
      if (res.data.success) {
        setDetails(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
    </div>
  );
}
