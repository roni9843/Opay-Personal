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
    <div className="min-h-screen bg-[#110922] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-fancyPink/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-fancyPurple/25 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-fancyCyan/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl z-10 my-8">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fancyPink/15 border border-fancyPink/30 text-pink-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-fancyPink/20">
            <Sparkles className="w-4 h-4 text-fancyPink animate-pulse" /> Merchant Registration
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Create Merchant Account
          </h1>
          <p className="text-purple-200/70 text-sm mt-2 font-medium">
            Automate Bkash, Nagad & Rocket payment gateways with OTP verification
          </p>
        </div>

        {/* Form Container */}
        <div className="fancy-container p-8 rounded-3xl shadow-2xl border border-purple-500/20 relative">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="w-5 h-5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Apex Tech Ltd"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#1b1038]/80 border border-purple-500/30 rounded-2xl text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-fancyPink focus:ring-1 focus:ring-fancyPink transition-all"
                  />
                </div>
              </div>

              {/* Owner Full Name */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                  Owner Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Tanvir Hossain"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#1b1038]/80 border border-purple-500/30 rounded-2xl text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-fancyPink focus:ring-1 focus:ring-fancyPink transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@company.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#1b1038]/80 border border-purple-500/30 rounded-2xl text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-fancyPink focus:ring-1 focus:ring-fancyPink transition-all"
                  />
                </div>
              </div>

              {/* Phone Number & Send OTP Button */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                  Mobile Number (Verification)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-5 h-5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="01712345678"
                      className="w-full pl-11 pr-3 py-3.5 bg-[#1b1038]/80 border border-purple-500/30 rounded-2xl text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-fancyPink focus:ring-1 focus:ring-fancyPink transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || timer > 0}
                    className="px-4 py-3.5 btn-fancy-purple disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-lg"
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
              <div className="p-4 rounded-2xl bg-fancyPink/10 border border-fancyPink/40">
                <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Enter 6-Digit OTP Verification Code</span>
                  <span className="text-[11px] text-pink-400 font-medium">O-SMS Gateway Active</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="w-5 h-5 text-fancyPink absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="otp"
                    required
                    maxLength={6}
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter 6-digit OTP code"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#1b1038] border border-fancyPink/60 rounded-2xl text-base font-mono tracking-widest text-pink-200 placeholder-purple-400/40 focus:outline-none focus:border-fancyPink focus:ring-1 focus:ring-fancyPink transition-all"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#1b1038]/80 border border-purple-500/30 rounded-2xl text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-fancyPink focus:ring-1 focus:ring-fancyPink transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#1b1038]/80 border border-purple-500/30 rounded-2xl text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-fancyPink focus:ring-1 focus:ring-fancyPink transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 btn-fancy-pink text-white font-extrabold rounded-2xl text-sm transition-all shadow-xl flex items-center justify-center gap-2 tracking-wide"
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
          <div className="text-center mt-6 pt-6 border-t border-purple-500/20">
            <p className="text-sm text-purple-200/70">
              Already have a merchant account?{' '}
              <Link to="/login" className="text-pink-400 font-extrabold hover:text-pink-300 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
