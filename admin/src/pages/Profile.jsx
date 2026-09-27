import React, { useState } from 'react';
import { UserCheck, Building2, User, Mail, Phone, Save, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';

export default function Profile() {
  const { user, setAuth, token } = useAuthStore();
  const [formData, setFormData] = useState({
    companyName: user?.companyName || '',
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    try {
      const res = await api.put('/auth/update-profile', {
        name: formData.name,
        phone: formData.phone,
        companyName: formData.companyName
      });

      if (res.data.success) {
        setAuth(res.data.user, token);
        setMsg('Profile updated successfully');
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-purple-400" />
          Company Profile Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your merchant company details and owner contact profile
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        {msg && (
          <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>{msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Company Name
            </label>
            <div className="relative">
              <Building2 className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Owner Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address (Account ID)
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
}
