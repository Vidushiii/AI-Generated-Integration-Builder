'use client';
import { CheckCircle, Key, ClipboardList, ArrowLeft, ExternalLink } from 'lucide-react';
import type { AppState } from '@/app/lib/state';

interface Props {
  state: AppState;
  onDone: () => void;
}

const AUDIT_LOG = [
  { ts: new Date().toISOString(), event: 'Integration promoted to production', actor: 'you' },
  { ts: new Date(Date.now() - 60_000).toISOString(), event: 'Sandbox test passed (5/5 checks)', actor: 'system' },
  { ts: new Date(Date.now() - 180_000).toISOString(), event: 'Code reviewed and saved', actor: 'you' },
  { ts: new Date(Date.now() - 300_000).toISOString(), event: 'Integration generated', actor: 'Claude Sonnet' },
  { ts: new Date(Date.now() - 420_000).toISOString(), event: 'API documentation parsed', actor: 'Claude Sonnet' },
];

export default function Screen6Production({ state, onDone }: Props) {
  const doc = state.parsedDoc!;
  const output = state.generatedOutput!;
  const clientId = 'ce_prod_' + Math.random().toString(36).slice(2, 10);

  return (
    <div className="min-h-screen flex flex-col p-6 lg:p-10">
      {/* Top nav */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Production</span>
        </div>
        <span className="text-xs text-white/20 font-mono">Step 6 of 6</span>
      </div>

      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full gap-6">
        {/* Hero */}
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-black/40 to-black/60 backdrop-blur-sm p-8 flex items-center gap-6">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-2xl" />
            <div className="relative w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">Integration live in production</h2>
            <p className="text-white/50 text-sm mt-1">
              {output.sections.length} code modules deployed · {doc.authModel.split('/')[0].trim()} auth · Read-only scope
            </p>
          </div>
        </div>

        {/* Two columns */}
        <div className="flex-1 grid lg:grid-cols-2 gap-5">
          {/* Left: credentials */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Scoped Production Credentials</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Client ID', value: clientId, mono: true },
                  { label: 'Secret', value: '••••••••••••••••••••••••', mono: true },
                  { label: 'Permissions', value: 'read:users read:events', mono: false },
                  { label: 'Base URL', value: doc.baseUrl, mono: true },
                  { label: 'Environment', value: 'production', mono: false },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-white/40 shrink-0">{label}</span>
                    <span className={`text-xs text-right truncate max-w-[220px] ${mono ? 'font-mono text-emerald-300/80' : 'text-white/70'}`}>{value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/25 pt-1">
                Minimal permissions scoped to read-only. Rotate credentials via your Calendly app settings.
              </p>
            </div>

            {/* Next steps */}
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-5 space-y-4">
              <span className="text-xs text-white/40 uppercase tracking-widest">Next steps</span>
              <div className="space-y-3">
                {[
                  'Store credentials in your secrets manager (not in code)',
                  'Set up monitoring on /users/me to detect auth failures',
                  'Review rate limit alerts — current buffer is 94%',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-white/55 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: audit log + actions */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-white/40" />
                <span className="text-sm font-semibold text-white">Audit Log</span>
              </div>
              <div className="space-y-1">
                {AUDIT_LOG.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white/70">{entry.event}</div>
                      <div className="text-xs text-white/25 font-mono mt-0.5">
                        {new Date(entry.ts).toLocaleTimeString()} · {entry.actor}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Modules', value: String(output.sections.length) },
                { label: 'Tests passed', value: '5/5' },
                { label: 'Gaps fixed', value: String(output.gaps.length) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
                  <div className="text-xl font-black text-emerald-400">{value}</div>
                  <div className="text-xs text-white/30 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                onClick={() => alert('Full audit history — coming in v2')}
              >
                <ExternalLink className="w-3.5 h-3.5" /> Audit History
              </button>
              <button
                onClick={onDone}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-sm hover:from-emerald-400 hover:to-emerald-300 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Build another
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
