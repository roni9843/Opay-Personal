import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/useAuthStore';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSendOtp = async () => {
    if (!formData.phone) {
      setError('Please enter a valid phone number first');
      return;
    }

    setSendingOtp(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/auth/send-otp', { phone: formData.phone });
      if (res.data.success) {
        setOtpSent(true);
        setTimer(60);
        setSuccessMsg(`OTP Sent via SMS to ${formData.phone}`);
      } else {
        setError(res.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending OTP code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.otp) {
      setError('Please enter the OTP verification code sent to your mobile');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register-company', formData);
      if (res.data.success) {
        setAuth(res.data.user, res.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create merchant account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-pink-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl z-10 my-8">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Merchant Admin Registration
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Create Merchant Company Account
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Automate your Bkash, Nagad & Rocket payment gateways securely
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-white/10 relative">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Apex Tech Ltd"
                    className="w-full pl-11 pr-4 py-3 bg-[#131b2e] border border-slate-700/70 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* Owner Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Owner Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Tanvir Hossain"
                    className="w-full pl-11 pr-4 py-3 bg-[#131b2e] border border-slate-700/70 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@company.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#131b2e] border border-slate-700/70 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* Phone Number & Send OTP Button */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Mobile Number (For Verification)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="01712345678"
                      className="w-full pl-11 pr-3 py-3 bg-[#131b2e] border border-slate-700/70 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || timer > 0}
                    className="px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
                  >
                    {sendingOtp ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : timer > 0 ? (
                      `${timer}s`
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* OTP Input Section */}
            {otpSent && (
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30">
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Enter 6-Digit Verification OTP Code</span>
                  <span className="text-[11px] text-purple-400 font-normal">Sent via O-SMS Gateway</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="w-5 h-5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="otp"
                    required
                    maxLength={6}
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter 6-digit OTP code"
                    className="w-full pl-11 pr-4 py-3 bg-[#131b2e] border border-purple-500/50 rounded-xl text-base font-mono tracking-widest text-purple-200 placeholder-slate-600 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-[#131b2e] border border-slate-700/70 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-[#131b2e] border border-slate-700/70 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Create Account & Start Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-6 pt-6 border-t border-slate-800">
            <p className="text-sm text-slate-400">
              Already have a merchant account?{' '}
              <Link to="/login" className="text-purple-400 font-semibold hover:text-purple-300 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
