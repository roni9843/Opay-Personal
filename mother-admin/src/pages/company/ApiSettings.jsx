import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Key, Copy, RefreshCw, Send, Check, ExternalLink } from 'lucide-react';

export default function ApiSettings() {
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testAmount, setTestAmount] = useState(500);
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    fetchApiSettings();
  }, []);

  const fetchApiSettings = async () => {
    try {
      const res = await API.get('/company/api-settings');
      setApiData(res.data.data);
      setWebhookUrl(res.data.data.apiCallbackUrl || '');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (apiData?.apiKey) {
      navigator.clipboard.writeText(apiData.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm('Regenerating API Key will invalidate your existing API integration. Continue?')) return;
    try {
      const res = await API.post('/company/regenerate-api-key');
      setApiData({ ...apiData, apiKey: res.data.apiKey });
      alert('API key regenerated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Regeneration failed');
    }
  };

  const handleSaveWebhook = async () => {
    try {
      await API.put('/company/update-webhook', { apiCallbackUrl: webhookUrl });
      alert('Webhook Callback URL updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Webhook update failed');
    }
  };

  const handleGenerateTestCheckout = async () => {
    try {
      const res = await API.post('/external/checkout/create', {
        apiKey: apiData?.apiKey,
        amount: Number(testAmount),
        customerRef: 'TEST_CUST_' + Math.floor(1000 + Math.random() * 9000),
        callbackUrl: webhookUrl,
      });

      setGeneratedLink(res.data.payment_url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate test checkout');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading API settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white">API Keys & Webhooks</h2>
        <p className="text-xs text-slate-400 mt-1">Integrate Opay-Personal automated payment gateway into your website</p>
      </div>

      {/* API Key Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Merchant Live API Key</h3>
          </div>
          <button
            onClick={handleRegenerateKey}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate API Key
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={apiData?.apiKey || ''}
            className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-indigo-300 focus:outline-none"
          />
          <button
            onClick={handleCopyKey}
            className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Webhook Callback Settings */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white">Webhook Callback URL</h3>
        <p className="text-xs text-slate-400">
          When a payment is matched and verified, our server will send an instant HTTP POST JSON payload to this URL.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://yourwebsite.com/api/opay-webhook"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSaveWebhook}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow flex items-center gap-1.5 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Save Webhook</span>
          </button>
        </div>
      </div>

      {/* Test Payment Link Generator */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white">Test Payment Checkout Generator</h3>

        <div className="flex items-center gap-3">
          <input
            type="number"
            value={testAmount}
            onChange={(e) => setTestAmount(e.target.value)}
            className="w-36 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
            placeholder="Amount (BDT)"
          />
          <button
            onClick={handleGenerateTestCheckout}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow flex items-center gap-2"
          >
            <span>Generate Test Payment Link</span>
          </button>
        </div>

        {generatedLink && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-2">
            <p className="text-slate-300 font-semibold">Generated Payment URL:</p>
            <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg">
              <span className="font-mono text-indigo-300 truncate mr-2">{generatedLink}</span>
              <a
                href={generatedLink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-500 flex items-center gap-1 shrink-0"
              >
                <span>Open Checkout</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
