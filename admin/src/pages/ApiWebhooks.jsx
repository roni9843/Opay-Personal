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
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Code2 className="w-6 h-6 text-purple-400" />
          API Keys & Webhooks Documentation
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Integrate automated mobile banking payment verification into your website or e-commerce shop
        </p>
      </div>

      {/* Private API Key Box */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-slate-900 to-indigo-950/20">
        <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
          Your Private API Secret Key
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              readOnly
              value={apiKey}
              className="w-full pl-4 pr-10 py-3 bg-black/50 border border-slate-700/80 rounded-xl text-sm font-mono text-purple-200 focus:outline-none"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-purple-600/20"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Key'}</span>
          </button>
        </div>
      </div>

      {/* Webhook Settings */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          Payment Notification Webhook Endpoint
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          When an SMS payment (Bkash/Nagad/Rocket) is received by your Android phone, O-Pay instantly posts payment JSON to this URL.
        </p>

        <div className="flex gap-3">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://yourwebsite.com/api/payment-webhook"
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-2 shrink-0">
            <Send className="w-4 h-4" /> Save Webhook URL
          </button>
        </div>
      </div>

      {/* REST API Example */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          Node.js Payment Verification Request Example
        </h3>

        <pre className="p-4 rounded-xl bg-black/70 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
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
