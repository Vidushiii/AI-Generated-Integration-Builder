'use client';
import { useRef, useState, useEffect } from 'react';
import { FileText, Link, Upload, Settings, Loader2, Zap, Code2, Lock, Database } from 'lucide-react';
import ModeToggle from './ModeToggle';
import AskDocPanel from './AskDocPanel';
import type { AppState } from '@/app/lib/state';

const DEMO_URL = 'https://developer.calendly.com/api-docs/4b402d5ab3edd-calendly-developer';

const PROMPTS = [
  'Get users and usage data',
  'Set up authentication',
  'Generate the full integration',
];

const FEATURE_PILLS = [
  { icon: Code2, label: 'API client' },
  { icon: Lock, label: 'Auth setup' },
  { icon: Database, label: 'Data retrieval' },
  { icon: Zap, label: 'Error handling' },
];

type Tab = 'text' | 'url' | 'file';

interface Props {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  onContinue: () => void;
}

export default function Screen1Input({ state, update, onContinue }: Props) {
  const isDemo = state.mode === 'demo';

  const [tab, setTab] = useState<Tab>(isDemo ? 'url' : 'text');
  const [urlInput, setUrlInput] = useState(isDemo ? DEMO_URL : state.docUrl);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync tab + URL when mode changes
  useEffect(() => {
    if (isDemo) {
      setTab('url');
      setUrlInput(DEMO_URL);
      // Ensure app state reflects the pre-filled URL so hasDoc is true
      if (!state.docUrl) {
        update({ docUrl: DEMO_URL, docText: '', uploadedFileName: '' });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo]);

  // On first mount in demo mode, set the URL in state
  useEffect(() => {
    if (isDemo && !state.docUrl) {
      update({ docUrl: DEMO_URL, docText: '', uploadedFileName: '' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasDoc = isDemo || !!(state.docText || state.docUrl || state.uploadedFileName);
  const canContinue = hasDoc && !!state.selectedPrompt;
  const showPanel = isDemo || hasDoc;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      update({ docText: ev.target?.result as string, uploadedFileName: file.name, docUrl: '' });
    };
    reader.readAsText(file);
  };

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    if (isDemo) {
      update({ docUrl: urlInput.trim(), docText: '', uploadedFileName: '' });
      return;
    }
    setFetching(true);
    setFetchError('');
    try {
      const res = await fetch('/api/fetch-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setFetchError(data.error ?? 'Failed to fetch'); return; }
      update({ docText: data.text, docUrl: urlInput.trim(), uploadedFileName: '' });
    } catch {
      setFetchError('Network error — check the URL and try again.');
    } finally {
      setFetching(false);
    }
  };

  const handleModeChange = (m: typeof state.mode) => {
    if (m === 'live') {
      update({ mode: m, showApiKeyModal: true });
    } else {
      update({ mode: m });
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 lg:p-10">
      {/* Top nav */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <span className="text-sm font-bold text-white/80 tracking-tight">CloudEagle</span>
          <span className="text-white/20 mx-1">·</span>
          <span className="text-xs text-white/40">Integration Builder</span>
        </div>
        <button
          onClick={() => update({ showSettingsModal: true })}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" /> Settings
        </button>
      </div>

      {/* Main two-column layout */}
      <div className="flex-1 flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto w-full">

        {/* Left: hero + feature pills */}
        <div className="xl:flex-1 flex flex-col justify-center space-y-8 xl:pr-8">
          <div className="space-y-5">
            <ModeToggle mode={state.mode} onChange={handleModeChange} />
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight">
                Build any API<br />
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                  integration
                </span>{' '}
                in seconds
              </h1>
              <p className="text-white/50 text-base xl:text-lg leading-relaxed max-w-md">
                Point me at any API doc and I'll generate a complete, production-ready integration — auth, error handling, pagination, and logging included.
              </p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {FEATURE_PILLS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/8">
                <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm text-white/60">{label}</span>
              </div>
            ))}
          </div>

          {/* Demo mode callout */}
          {isDemo && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 flex items-start gap-3 max-w-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <p className="text-xs text-emerald-300/80 leading-relaxed">
                Demo Mode — pre-loaded with the Calendly API. Pick a prompt and continue to see the full flow instantly. No API key needed.
              </p>
            </div>
          )}
        </div>

        {/* Right: input card */}
        <div className="xl:w-[560px] shrink-0">
          <div className="rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl shadow-black/50 p-7 space-y-6 h-full flex flex-col">

            {/* Input tabs */}
            <div className="space-y-4">
              <div className="flex gap-1.5 bg-black/30 rounded-xl p-1">
                {([['text', 'Paste text', FileText], ['url', 'Paste URL', Link], ['file', 'Upload file', Upload]] as const).map(([t, label, Icon]) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      tab === t
                        ? 'bg-white/10 text-white'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {tab === 'text' && (
                <textarea
                  className="w-full h-44 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/40 resize-none font-mono leading-relaxed transition-colors"
                  placeholder="Paste your API documentation here…"
                  value={state.docText}
                  onChange={(e) => update({ docText: e.target.value, docUrl: '', uploadedFileName: '' })}
                />
              )}

              {tab === 'url' && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/40 transition-colors font-mono text-xs"
                      placeholder="https://developer.calendly.com/api-docs"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        // In live mode, clear docUrl until explicitly fetched
                        if (!isDemo) update({ docUrl: '', docText: '', uploadedFileName: '' });
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
                    />
                    <button
                      onClick={handleFetchUrl}
                      disabled={fetching || !urlInput.trim()}
                      className="px-4 py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white text-sm font-medium transition-all disabled:opacity-40 flex items-center gap-2 shrink-0"
                    >
                      {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : isDemo ? 'Use URL' : 'Fetch'}
                    </button>
                  </div>
                  {fetchError && <p className="text-xs text-red-400">{fetchError}</p>}
                  {isDemo && (
                    <p className="text-xs text-emerald-400/70">
                      ✓ Pre-filled with Calendly API docs — Demo Mode runs on built-in data
                    </p>
                  )}
                  {!isDemo && state.docUrl && !fetchError && (
                    <p className="text-xs text-emerald-400">✓ Doc fetched from {state.docUrl}</p>
                  )}
                </div>
              )}

              {tab === 'file' && (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-emerald-500/40 transition-colors text-white/40 hover:text-white/60 space-y-2"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">Click to upload PDF, Markdown, or text file</span>
                  <span className="text-xs text-white/25">PDF, .md, .txt, .json</span>
                  {state.uploadedFileName && (
                    <span className="text-xs text-emerald-400">✓ {state.uploadedFileName}</span>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.md,.txt,.json"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              )}
            </div>

            {/* Prompt chips */}
            <div className="space-y-3 flex-1">
              <label className={`text-xs uppercase tracking-widest transition-colors ${hasDoc ? 'text-white/40' : 'text-white/20'}`}>
                What to generate
              </label>
              <div className="flex flex-wrap gap-2">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    disabled={!hasDoc}
                    onClick={() => update({ selectedPrompt: p })}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      !hasDoc
                        ? 'bg-white/[0.02] text-white/20 border-white/5 cursor-not-allowed'
                        : state.selectedPrompt === p
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                        : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30 hover:text-white/80'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Continue */}
            <div className="space-y-3 pt-2">
              <button
                onClick={onContinue}
                disabled={!canContinue}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-base hover:from-emerald-400 hover:to-emerald-300 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.01] disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isDemo ? 'Continue with Calendly demo →' : 'Analyze & Continue →'}
              </button>
              <p className="text-center text-xs text-white/25">
                {isDemo
                  ? 'Instant demo — no API key needed'
                  : hasDoc
                  ? 'Uses Claude Sonnet to analyze your doc'
                  : 'Add a doc above to continue'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <AskDocPanel
        mode={state.mode}
        docText={state.docText}
        userKey={state.userApiKey}
        onKeyError={() => update({ showApiKeyModal: true })}
        show={showPanel}
      />
    </div>
  );
}
