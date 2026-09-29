import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Settings, Save, CheckCircle2, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function SmsSettings() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    smsPerRate: 0.50,
    minSmsPurchaseQty: 100,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSmsSettings();
  }, []);

  const fetchSmsSettings = async () => {
    setIsLoading(true);
    try {
      const res = await API.get('/super-admin/sms-settings');
      if (res.data.success && res.data.data) {
        setSettings({
          smsPerRate: res.data.data.smsPerRate !== undefined ? res.data.data.smsPerRate : 0.50,
          minSmsPurchaseQty: res.data.data.minSmsPurchaseQty !== undefined ? res.data.data.minSmsPurchaseQty : 100,
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Error fetching SMS rate settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await API.put('/super-admin/sms-settings', settings);
      if (res.data.success) {
        showToast('SMS rate settings updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save SMS settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-fancyPink" />
            SMS Rate Settings & Plan
          </h2>
          <p className="text-xs text-purple-200/70 mt-1 font-medium">
            Configure per SMS cost in BDT & minimum purchase limits for O-Pay Personal companies
          </p>
        </div>
        <button
          onClick={fetchSmsSettings}
          className="px-4 py-2 rounded-2xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="text-purple-300 text-center py-10 font-bold">Loading SMS rate settings...</div>
      ) : (
        <div className="fancy-container p-6 md:p-8 rounded-3xl border border-purple-500/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Per SMS Rate Field */}
              <div className="p-4 rounded-2xl bg-[#180f33]/80 border border-purple-500/30 space-y-2">
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider">
                  Per SMS Rate (BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-300 font-bold text-sm">৳</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={settings.smsPerRate}
                    onChange={(e) => setSettings({ ...settings, smsPerRate: Number(e.target.value) })}
                    placeholder="0.50"
                    className="w-full pl-9 pr-4 py-3 bg-[#110826] border border-purple-500/30 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-fancyPink"
                  />
                </div>
                <p className="text-[11px] text-purple-300/60">
                  Companies will be charged this amount per SMS when purchasing extra SMS bundles.
                </p>
              </div>

              {/* Min Purchase Qty Field */}
              <div className="p-4 rounded-2xl bg-[#180f33]/80 border border-purple-500/30 space-y-2">
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider">
                  Minimum Purchase Quantity
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-fancyCyan absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    required
                    value={settings.minSmsPurchaseQty}
                    onChange={(e) => setSettings({ ...settings, minSmsPurchaseQty: Number(e.target.value) })}
                    placeholder="100"
                    className="w-full pl-9 pr-4 py-3 bg-[#110826] border border-purple-500/30 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-fancyPink"
                  />
                </div>
                <p className="text-[11px] text-purple-300/60">
                  Minimum number of SMS that an admin company can buy at once.
                </p>
              </div>
            </div>

            {/* Quick Demo Preview */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-fancyPink/15 to-purple-900/40 border border-fancyPink/30 space-y-2 text-xs">
              <h4 className="font-extrabold text-pink-300 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Pricing Preview Calculation
              </h4>
              <p className="text-purple-200">
                • 100 SMS bundle = <strong className="text-white">৳{(100 * settings.smsPerRate).toFixed(2)} BDT</strong>
              </p>
              <p className="text-purple-200">
                • 1,000 SMS bundle = <strong className="text-white">৳{(1000 * settings.smsPerRate).toFixed(2)} BDT</strong>
              </p>
              <p className="text-purple-200">
                • 5,000 SMS bundle = <strong className="text-white">৳{(5000 * settings.smsPerRate).toFixed(2)} BDT</strong>
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3.5 btn-fancy-pink text-white text-xs font-extrabold rounded-2xl shadow-xl flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Rate Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
