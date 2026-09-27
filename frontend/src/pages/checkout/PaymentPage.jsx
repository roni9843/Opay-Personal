import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Copy, Check, Clock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function PaymentPage() {
  const { sessionToken } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [trxID, setTrxID] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 mins in seconds

  useEffect(() => {
    fetchSession();
  }, [sessionToken]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchSession = async () => {
    try {
      const res = await axios.get(`/api/external/checkout/resolve/${sessionToken}`);
      setSessionData(res.data.session);

      if (res.data.session?.paymentMethods?.length > 0) {
        setSelectedMethod(res.data.session.paymentMethods[0]);
      }

      if (res.data.status === 'paid') {
        setSuccessData(res.data.session);
      }

      // Calculate time remaining
      if (res.data.session?.expiresAt) {
        const diffSec = Math.max(0, Math.floor((new Date(res.data.session.expiresAt) - new Date()) / 1000));
        setTimeLeft(diffSec);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Payment link is invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyNumber = (num) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleVerifyTrx = async (e) => {
    e.preventDefault();
    if (!trxID.trim()) return;

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const res = await axios.post(`/api/external/checkout/verify/${sessionToken}`, {
        trxID: trxID.trim(),
        provider: selectedMethod?.provider || 'bkash',
      });

      if (res.data.success && res.data.status === 'paid') {
        setSuccessData(res.data.data);
        if (res.data.data.successRedirectUrl) {
          setTimeout(() => {
            window.location.href = res.data.data.successRedirectUrl;
          }, 3000);
        }
      } else {
        setErrorMsg(res.data.message || 'Transaction ID not verified yet.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Verification failed. Please check your TrxID.');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darkBg text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Loading Secure Payment Gateway...</p>
        </div>
      </div>
    );
  }

  if (errorMsg && !sessionData) {
    return (
      <div className="min-h-screen bg-darkBg text-white flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">Payment Link Expired</h3>
          <p className="text-xs text-slate-400">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (successData) {
    return (
      <div className="min-h-screen bg-darkBg text-white flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-5 border border-emerald-500/30">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white">Payment Verified!</h3>
          <p className="text-xs text-slate-400">
            Your payment of <strong className="text-emerald-400 text-sm">৳ {sessionData?.amount} BDT</strong> has been successfully received & verified.
          </p>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
            TrxID: {successData.trxID || successData.trxid}
          </div>
          {successData.successRedirectUrl && (
            <p className="text-[11px] text-indigo-400 animate-pulse">Redirecting back to merchant website...</p>
          )}
        </div>
      </div>
    );
  }

  const methods = sessionData?.paymentMethods || [];

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-lg relative z-10">
        {/* Header Bar */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Secure Checkout</span>
              <h2 className="text-xl font-bold text-white">{sessionData?.companyName}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Amount</span>
              <span className="text-2xl font-extrabold text-emerald-400">৳ {sessionData?.amount} BDT</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Time Remaining to Complete Payment:</span>
            </div>
            <strong className="font-mono text-sm">{formatTime(timeLeft)}</strong>
          </div>

          {/* Payment Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Select Mobile Banking Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              {methods.map((method, idx) => {
                const isSelected = selectedMethod?._id === method._id;
                const p = method.provider.toLowerCase();
                let colorClass = 'border-white/10 text-white';
                if (p === 'bkash') colorClass = isSelected ? 'border-pink-500 bg-pink-500/20 text-pink-300' : 'hover:border-pink-500/50';
                if (p === 'nagad') colorClass = isSelected ? 'border-orange-500 bg-orange-500/20 text-orange-300' : 'hover:border-orange-500/50';
                if (p === 'rocket') colorClass = isSelected ? 'border-purple-500 bg-purple-500/20 text-purple-300' : 'hover:border-purple-500/50';
                if (p === 'upay') colorClass = isSelected ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' : 'hover:border-emerald-500/50';

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedMethod(method)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${colorClass}`}
                  >
                    <div>
                      <p className="font-bold text-sm uppercase">{method.provider}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{method.gateway} Account</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Number & Steps */}
          {selectedMethod && (
            <div className="space-y-4 pt-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                2. Send Money to this Number
              </label>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">
                    {selectedMethod.provider.toUpperCase()} ({selectedMethod.gateway.toUpperCase()})
                  </p>
                  <p className="text-xl font-mono font-bold text-white tracking-wider">
                    {selectedMethod.accountNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyNumber(selectedMethod.accountNumber)}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow flex items-center gap-1.5 transition-all"
                >
                  {copiedNumber ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedNumber ? 'Copied' : 'Copy Number'}</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-indigo-300">How to pay:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Go to your {selectedMethod.provider.toUpperCase()} Mobile App or dial USSD code</li>
                  <li>Select <strong className="text-white font-medium">Send Money</strong> option</li>
                  <li>Enter Number: <strong className="text-white font-mono">{selectedMethod.accountNumber}</strong></li>
                  <li>Enter Amount: <strong className="text-emerald-400 font-bold">৳ {sessionData.amount} BDT</strong></li>
                  <li>Copy the <strong className="text-white">Transaction ID (TrxID)</strong> from confirmation SMS</li>
                </ol>
              </div>
            </div>
          )}

          {/* TrxID Verification Input */}
          <form onSubmit={handleVerifyTrx} className="space-y-4 pt-2 border-t border-white/10">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              3. Enter Transaction ID (TrxID)
            </label>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                required
                value={trxID}
                onChange={(e) => setTrxID(e.target.value.toUpperCase())}
                placeholder="e.g. BKH9837261"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isVerifying}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-glow flex items-center gap-2 disabled:opacity-50 transition-all shrink-0"
              >
                {isVerifying ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Verify Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
