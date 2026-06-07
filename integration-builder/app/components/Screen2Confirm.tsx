'use client';
import { useState } from 'react';
import { ChevronLeft, Globe, Lock, Zap, Settings2 } from 'lucide-react';
import RiskBadge from './RiskBadge';
import AskDocPanel from './AskDocPanel';
import { OUTPUT_CHOICES } from '@/app/lib/state';
import type { AppState, OutputChoiceId } from '@/app/lib/state';

interface Props {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function Screen2Confirm({ state, update, onBack, onContinue }: Props) {
  const doc = state.parsedDoc!;
  const [editing, setEditing] = useState(false);
  const [editBaseUrl, setEditBaseUrl] = useState(doc.baseUrl);
  const [editAuth, setEditAuth] = useState(doc.authModel);

  const toggleOutput = (id: OutputChoiceId) => {
    const current = state.selectedOutputs;
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    update({ selectedOutputs: next });
  };

  const saveEdits = () => {
    update({ parsedDoc: { ...doc, baseUrl: editBaseUrl, authModel: editAuth } });
    setEditing(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 lg:p-10">
      {/* Top nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-xs text-white/20 font-mono">Step 2 of 6</span>
      </div>

      {/* Main layout: heading + two-column content */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full gap-6">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white">Here's what I understood</h2>
          <p className="text-white/40 text-sm">Review the parsed API details and choose what to generate. Edit anything that looks wrong.</p>
        </div>

        {/* Two-column layout */}
        <div className="flex-1 grid lg:grid-cols-2 gap-5">
          {/* Left: parsed API details */}
          <div className="space-y-4">
            {/* Base URL */}
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-white/40 uppercase tracking-widest">Base URL</span>
              </div>
              {editing ? (
                <input
                  value={editBaseUrl}
                  onChange={(e) => setEditBaseUrl(e.target.value)}
                  className="w-full bg-black/30 border border-emerald-500/40 rounded-lg px-3 py-2 text-sm text-white font-mono outline-none"
                />
              ) : (
                <p className="text-base font-mono text-white break-all">{doc.baseUrl}</p>
              )}
            </div>

            {/* Auth */}
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-white/40 uppercase tracking-widest">Auth Model</span>
              </div>
              {editing ? (
                <input
                  value={editAuth}
                  onChange={(e) => setEditAuth(e.target.value)}
                  className="w-full bg-black/30 border border-emerald-500/40 rounded-lg px-3 py-2 text-sm text-white outline-none"
                />
              ) : (
                <p className="text-base text-white">{doc.authModel}</p>
              )}
            </div>

            {/* Rate limit */}
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-white/40 uppercase tracking-widest">Published Rate Limit</span>
              </div>
              <p className="text-base text-white">{doc.rateLimit}</p>
            </div>

            {/* Risk */}
            <RiskBadge risk={doc.risk} />
          </div>

          {/* Right: endpoints + output checkboxes */}
          <div className="space-y-4">
            {/* Endpoints */}
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-5 space-y-4">
              <span className="text-xs text-white/40 uppercase tracking-widest">Detected Endpoints</span>
              <div className="space-y-2">
                {doc.endpoints.map((ep, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded shrink-0 ${
                      ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                      ep.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                      ep.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{ep.method}</span>
                    <span className="text-xs font-mono text-white/70 truncate flex-1">{ep.path}</span>
                    <span className="text-xs text-white/30 hidden sm:block truncate max-w-[120px]">{ep.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Output checkboxes */}
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-5 space-y-4">
              <span className="text-xs text-white/40 uppercase tracking-widest">What to generate</span>
              <div className="grid grid-cols-2 gap-2">
                {OUTPUT_CHOICES.map((choice) => {
                  const checked = state.selectedOutputs.includes(choice.id);
                  return (
                    <button
                      key={choice.id}
                      onClick={() => toggleOutput(choice.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-sm text-left transition-all ${
                        checked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        checked ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'
                      }`}>
                        {checked && <span className="text-[10px] text-black font-bold">✓</span>}
                      </div>
                      {choice.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={saveEdits} className="flex-1 py-3 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm font-medium transition-colors"
              >
                <Settings2 className="w-4 h-4" /> Edit Understanding
              </button>
              <button
                onClick={onContinue}
                disabled={state.selectedOutputs.length === 0}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-sm hover:from-emerald-400 hover:to-emerald-300 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-30"
              >
                Continue to Generate →
              </button>
            </>
          )}
        </div>
      </div>

      <AskDocPanel
        mode={state.mode}
        docText={state.docText}
        userKey={state.userApiKey}
        onKeyError={() => update({ showApiKeyModal: true })}
      />
    </div>
  );
}
