import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Smartphone, 
  Users, 
  CreditCard, 
  ExternalLink, 
  AlertTriangle,
  RefreshCw,
  Check
} from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { useSearchParams } from 'react-router-dom';

export default function Packages() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('status');

  const [packages, setPackages] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [smsRateData, setSmsRateData] = useState({ smsPerRate: 0.50, minSmsPurchaseQty: 100 });
  const [smsQtyInput, setSmsQtyInput] = useState(100);
  const [buyingSms, setBuyingSms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState(null);
  const [msg, setMsg] = useState(paymentStatus === 'success' ? 'Payment processed! Syncing your subscription...' : '');

  useEffect(() => {
    fetchPackagesAndSubscription();
  }, []);

  const fetchPackagesAndSubscription = async () => {
    setLoading(true);
    try {
      // 1. Fetch Subscription Packages
      const pkgRes = await api.get('/payment/public-packages').catch(() => api.get('/super-admin/packages'));
      if (pkgRes.data.success) {
        setPackages(pkgRes.data.data);
      }

      // 2. Fetch Active User Subscription
      const subRes = await api.get('/company/api-settings').catch(() => null);
      if (subRes && subRes.data.success) {
        setActiveSub(subRes.data.data);
      }

      // 3. Fetch SMS Rate Settings
      const smsRateRes = await api.get('/company/sms-rate').catch(() => null);
      if (smsRateRes && smsRateRes.data.success) {
        setSmsRateData(smsRateRes.data.data);
        if (smsRateRes.data.data.minSmsPurchaseQty) {
          setSmsQtyInput(smsRateRes.data.data.minSmsPurchaseQty);
        }
      }
    } catch (err) {
      console.log('Error fetching package data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseExtraSms = async () => {
    if (!activeSub || !activeSub.active) {
      setMsg('You must have an active package subscription before purchasing extra SMS. Please buy a package first below.');
      return;
    }

    setBuyingSms(true);
    setMsg('');
    try {
      const res = await api.post('/company/purchase-sms', { quantity: Number(smsQtyInput) });
      if (res.data.success) {
        if (res.data.payment_page_url) {
          window.open(res.data.payment_page_url, '_blank');
          setMsg(`Payment page generated for ${smsQtyInput} SMS. Please complete payment on OraclePay Gateway.`);
        } else {
          setMsg(res.data.message);
        }
        fetchPackagesAndSubscription();
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to purchase extra SMS. Make sure you have an active package.');
    } finally {
      setBuyingSms(false);
    }
  };

  const handlePurchase = async (pkg) => {
    setPurchasingId(pkg._id);
    setMsg('');
    try {
      const res = await api.post('/payment/purchase-package', { packageId: pkg._id });
      if (res.data.success && res.data.payment_page_url) {
        // Open OraclePay Auto Deposit Payment Gateway in a new tab
        window.open(res.data.payment_page_url, '_blank');
        setMsg(`Payment link generated for "${pkg.title}". Please complete the payment on OraclePay Gateway.`);
      } else {
        setMsg(res.data.message || 'Failed to generate payment link');
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Payment service error. Please try again later.');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-fancyPink/20 border border-fancyPink/40 text-pink-300 text-xs font-bold uppercase tracking-wider mb-2 shadow-lg shadow-fancyPink/20">
            <Sparkles className="w-4 h-4 text-fancyPink animate-pulse" /> Subscription Plans & Extra SMS
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Choose Subscription Package & SMS Bundles
          </h1>
          <p className="text-purple-200/70 text-sm mt-1 font-medium">
            Select a package to activate automated Bkash, Nagad & Rocket SIM Gateway or buy extra SMS bundles
          </p>
        </div>
      </div>

      {/* No Active Subscription Warning */}
      {!activeSub && !loading && (
        <div className="p-5 rounded-3xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-start gap-4 shadow-xl">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-base text-amber-300">No Active Package Subscription</h4>
            <p className="text-xs text-amber-200/80 mt-1 font-medium">
              You currently do not have an active package. Please select a package below and complete payment via OraclePay Business Gateway to enable SIM Devices & Staff Agents.
            </p>
          </div>
        </div>
      )}

      {/* Extra SMS Purchase Panel */}
      <div className="fancy-container p-6 rounded-3xl border border-purple-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-pink-950/40">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> SMS Bundle Add-on
          </div>
          <h3 className="text-xl font-extrabold text-white">Buy Extra SMS Quota</h3>
          <p className="text-xs text-purple-200/80 font-medium">
            Current SMS Rate set by Mother Admin: <strong className="text-pink-300 font-mono text-sm">৳{smsRateData.smsPerRate} BDT / SMS</strong> (Min quantity: {smsRateData.minSmsPurchaseQty} SMS)
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <input
              type="number"
              min={smsRateData.minSmsPurchaseQty || 100}
              step="50"
              value={smsQtyInput}
              onChange={(e) => setSmsQtyInput(Number(e.target.value))}
              className="w-full md:w-36 px-4 py-3 rounded-2xl bg-[#180f33] border border-purple-500/30 text-white font-mono text-sm font-bold focus:outline-none focus:border-fancyPink"
              placeholder="Qty"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-purple-300 font-bold">SMS</span>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-purple-300 uppercase block font-bold">Total Cost</span>
            <span className="text-lg font-extrabold text-emerald-300 font-mono">
              ৳{(smsQtyInput * smsRateData.smsPerRate).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handlePurchaseExtraSms}
            disabled={buyingSms}
            className="px-5 py-3.5 btn-fancy-pink text-white text-xs font-extrabold rounded-2xl shadow-xl flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {buyingSms ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>Buy {smsQtyInput} SMS</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-fancyPink/20 border border-fancyPink/40 text-pink-200 text-xs font-bold flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-pink-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const isActive = activeSub?.package?._id === pkg._id;

          return (
            <div
              key={pkg._id}
              className={`fancy-card p-6 md:p-8 rounded-3xl border relative flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-fancyPink shadow-2xl bg-gradient-to-br from-fancyPink/30 via-purple-950/60 to-slate-950/90 ring-2 ring-fancyPink/40'
                  : 'border-purple-500/20 hover:border-fancyPink/40'
              }`}
            >
              {isActive && (
                <div className="absolute -top-3.5 right-6 px-4 py-1 rounded-full bg-gradient-to-r from-fancyPink to-fancyPurple text-white text-xs font-extrabold shadow-lg flex items-center gap-1.5 border border-white/20">
                  <CheckCircle2 className="w-4 h-4" /> Active Plan
                </div>
              )}

              <div>
                <h3 className="text-xl font-extrabold text-white">{pkg.title}</h3>
                <p className="text-xs text-purple-300/80 mt-1 font-medium">
                  Valid for {pkg.durationMonths} Month(s)
                </p>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">৳{pkg.price}</span>
                  {pkg.regularPrice > pkg.price && (
                    <span className="text-sm text-purple-300/60 line-through">৳{pkg.regularPrice}</span>
                  )}
                  <span className="text-xs text-pink-300 font-bold ml-1">/ {pkg.durationMonths} Mo</span>
                </div>

                {/* Specs List */}
                <div className="mt-6 space-y-3 pt-5 border-t border-purple-500/20 text-xs">
                  <div className="flex items-center justify-between text-purple-200 font-medium">
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-fancyPink" /> Admin Devices:
                    </span>
                    <strong className="text-white font-extrabold">{pkg.maxAdminDevices} Device</strong>
                  </div>

                  <div className="flex items-center justify-between text-purple-200 font-medium">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-fancyCyan" /> Staff Agents:
                    </span>
                    <strong className="text-white font-extrabold">{pkg.maxAgents} Agents</strong>
                  </div>

                  <div className="flex items-center justify-between text-purple-200 font-medium">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" /> SIM Capacity:
                    </span>
                    <strong className="text-emerald-300 font-extrabold">{(pkg.maxDevices || 3) * 2} SIM Slots</strong>
                  </div>

                  <div className="flex items-center justify-between text-purple-200 font-medium">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" /> Free SMS Quota:
                    </span>
                    <strong className="text-amber-300 font-extrabold">{pkg.freeSmsCount !== undefined ? pkg.freeSmsCount : 1000} SMS</strong>
                  </div>

                  <div className="flex items-center justify-between text-purple-200 font-medium">
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-fancyPink" /> Per Trx Charge:
                    </span>
                    <strong className="text-pink-300 font-extrabold">
                      {pkg.chargeValue || 0} {pkg.chargeType === 'flat' ? 'BDT' : '%'}
                    </strong>
                  </div>
                </div>

                {/* Feature Bullet Points */}
                {pkg.features && pkg.features.length > 0 && (
                  <div className="mt-5 space-y-2 pt-4 border-t border-purple-500/20 text-xs text-purple-200/80">
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-fancyPink shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-2.5">
                {isActive ? (
                  <button
                    disabled
                    className="w-full py-3.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Active & Selected
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(pkg)}
                    disabled={purchasingId === pkg._id}
                    className="w-full py-3.5 btn-fancy-pink text-white rounded-2xl text-xs font-extrabold transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    {purchasingId === pkg._id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Buy Now via OraclePay</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
