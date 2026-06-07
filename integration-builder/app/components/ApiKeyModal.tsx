'use client';
import { useState } from 'react';
import { Key, X, Eye, EyeOff, ExternalLink, AlertCircle } from 'lucide-react';

interface Props {
  onSubmit: (key: string) => void;
  onClose: () => void;
  keyRejected?: boolean;
}

export default function ApiKeyModal({ onSubmit, onClose, keyRejected }: Props) {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);

  const steps = [
    <>Go to <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-0.5">console.anthropic.com <ExternalLink className="w-3 h-3" /></a> and sign in (or create an account).</>,
    <>Open <span className="text-white font-medium">API Keys</span> in the left menu → <span className="text-white font-medium">Create Key</span>.</>,
    <>Copy the key (it starts with <span className="font-mono text-emerald-400">sk-ant-…</span>) — it's shown only once.</>,
    <>Add a little credit under <span className="text-white font-medium">Billing</span> (even $5 is plenty for testing).</>,
    <>Paste your key below.</>,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c0f16] shadow-2xl shadow-black/70 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />

        <div className="p-7 space-y-6">
          <button onClick={onClose} className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
              <Key className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Use Live Mode with your own key</h2>
              <p className="text-sm text-white/50 mt-1 leading-relaxed">
                Live Mode generates real integration code using your own Anthropic API key. We use{' '}
                <span className="font-mono text-white/70 text-xs">claude-sonnet-4-20250514</span> — strong at code
                generation and reading long API docs. Your key is sent directly to Anthropic for this session only
                and is never stored.
              </p>
            </div>
          </div>

          {/* Rejected key error */}
          {keyRejected && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-300">
                That key was rejected or has no credit — please check and re-enter.
              </p>
            </div>
          )}

          {/* Steps */}
          <div className="rounded-xl bg-white/[0.03] border border-white/8 p-5 space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-4">How to get your key</p>
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-white/65 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          {/* Key input */}
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              placeholder="sk-ant-…"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && key.trim() && onSubmit(key.trim())}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-500/50 transition-colors pr-10 font-mono"
              autoFocus
            />
            <button
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/70 transition-colors"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={() => { if (key.trim()) onSubmit(key.trim()); }}
            disabled={!key.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-sm hover:from-emerald-400 hover:to-emerald-300 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Save & Continue
          </button>

          {/* Fallback note */}
          <p className="text-center text-xs text-white/30 leading-relaxed">
            New here?{' '}
            <button onClick={onClose} className="text-emerald-400/70 hover:text-emerald-400 transition-colors">
              Try Demo Mode first
            </button>{' '}
            — it runs the full flow on sample Calendly data, no key needed.
          </p>
        </div>
      </div>
    </div>
  );
}
