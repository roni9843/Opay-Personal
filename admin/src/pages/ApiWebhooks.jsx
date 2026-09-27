import React, { useState } from 'react';
import { Code2, Copy, Check, Eye, EyeOff, Terminal, Globe, Send } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function ApiWebhooks() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://mywebsite.com/api/opay-webhook');

  const apiKey = 'opay_live_8f7b2a9c3d4e5f6a1b2c3d4e';

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Code2 className="w-7 h-7 text-fancyPink" />
          API Keys & Webhooks Documentation
        </h1>
        <p className="text-purple-200/70 text-sm mt-1 font-medium">
          Integrate automated mobile banking payment verification into your website or e-commerce shop
        </p>
      </div>

      {/* Private API Key Box */}
      <div className="fancy-card p-6 md:p-8 rounded-3xl border border-fancyPink/30 bg-gradient-to-r from-purple-950/60 via-pink-950/30 to-slate-950/80 shadow-2xl">
        <label className="block text-xs font-extrabold text-pink-300 uppercase tracking-wider mb-2.5">
          Your Private API Secret Key
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type={showKey ? 'text' : 'password'}
              readOnly
              value={apiKey}
              className="w-full pl-4 pr-10 py-3.5 bg-[#140c29] border border-purple-500/40 rounded-2xl text-sm font-mono text-pink-200 focus:outline-none"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto px-5 py-3.5 btn-fancy-pink text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Key'}</span>
          </button>
        </div>
      </div>

      {/* Webhook Settings */}
      <div className="fancy-container p-6 md:p-8 rounded-3xl border border-purple-500/20 shadow-xl">
        <h3 className="text-base font-extrabold text-white mb-2 flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-fancyCyan" />
          Payment Notification Webhook Endpoint
        </h3>
        <p className="text-xs text-purple-200/70 mb-5 font-medium">
          When an SMS payment (Bkash/Nagad/Rocket) is received by your Android phone, O-Pay instantly posts payment JSON to this URL.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://yourwebsite.com/api/payment-webhook"
            className="flex-1 px-4 py-3.5 bg-[#180f33]/80 border border-purple-500/30 rounded-2xl text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-fancyPink"
          />
          <button className="px-6 py-3.5 btn-fancy-purple text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg">
            <Send className="w-4 h-4" /> Save Webhook URL
          </button>
        </div>
      </div>

      {/* REST API Example */}
      <div className="fancy-container p-6 md:p-8 rounded-3xl border border-purple-500/20 shadow-xl">
        <h3 className="text-base font-extrabold text-white mb-3 flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-emerald-400" />
          Node.js Payment Verification Request Example
        </h3>

        <pre className="p-5 rounded-2xl bg-[#0d071a] border border-purple-500/30 text-xs font-mono text-emerald-300 overflow-x-auto shadow-inner">
{`const fetch = require('node-fetch');

const response = await fetch('http://localhost:5000/api/payment/verify-trx', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    trxId: '9K82L1M0P',
    method: 'bkash',
    amount: 500
  })
});

const data = await response.json();
console.log(data); // { success: true, verified: true, amount: 500 }`}
        </pre>
      </div>
    </div>
  );
}
