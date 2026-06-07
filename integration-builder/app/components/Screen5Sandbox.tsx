'use client';
import {
  ChevronLeft, Shield, ShieldCheck, ShieldAlert,
  CheckCircle, XCircle, Loader2, AlertCircle,
  FlaskConical, Server, Zap, Lock, Database, Bug,
} from 'lucide-react';
import type { AppState } from '@/app/lib/state';

interface Props {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  onBack: () => void;
  onPromote: () => void;
  onRunSandbox: () => void;
  sandboxRunning: boolean;
}

function StatusRow({ label, passed, value }: { label: string; passed: boolean; value?: string }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        {passed
          ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
        <span className="text-sm text-white/70">{label}</span>
      </div>
      {value && <span className="text-xs text-white/40 font-mono">{value}</span>}
    </div>
  );
}

const WHAT_HAPPENS = [
  { icon: Lock, label: 'Auth check', desc: 'Verifies your credentials authenticate successfully with a test token' },
  { icon: Database, label: 'Data retrieval', desc: 'Pulls a small sample of data to confirm endpoints respond correctly' },
  { icon: Bug, label: 'Error handling', desc: 'Triggers intentional errors to verify retry logic and 4xx/5xx handling' },
  { icon: Zap, label: 'Rate limit probe', desc: 'Measures headroom against the documented rate limit' },
  { icon: Shield, label: 'Security scan', desc: 'Checks for hardcoded secrets, over-scoped permissions, and unsafe patterns' },
];

export default function Screen5Sandbox({ state, update, onBack, onPromote, onRunSandbox, sandboxRunning }: Props) {
  const result = state.sandboxResult;
  const doc = state.parsedDoc!;
  const output = state.generatedOutput!;
  const needsApproval = doc.risk !== 'low';

  return (
    <div className="min-h-screen flex flex-col p-6 lg:p-10">
      {/* Top nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to code
        </button>
        <span className="text-xs text-white/20 font-mono">Step 5 of 6</span>
      </div>

      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full gap-6">
        {/* Header */}
        <div className="flex items-start gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-xl" />
            <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <FlaskConical className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">Sandbox Test</h2>
            <p className="text-white/40 text-sm mt-1">
              Dry-run with a test token — nothing writes to production. All checks simulated.
            </p>
          </div>
        </div>

        {/* Error from previous run */}
        {state.sandboxError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-red-400 mb-1">Test failed</div>
              <div className="text-xs text-red-300/80">{state.sandboxError}</div>
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="flex-1 grid lg:grid-cols-2 gap-5">
          {/* Left: what will be tested */}
          <div className="space-y-5">
            {/* Integration summary */}
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-white/40" />
                <span className="text-xs text-white/40 uppercase tracking-widest">Integration to test</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Target API</span>
                  <span className="text-xs font-mono text-white/70 truncate max-w-[180px]">{doc.baseUrl}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Auth method</span>
                  <span className="text-xs text-white/70">{doc.authModel.split('/')[0].trim()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Code sections</span>
                  <span className="text-xs text-emerald-400 font-medium">{output.sections.length} modules</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Risk level</span>
                  <span className={`text-xs font-medium ${
                    doc.risk === 'low' ? 'text-emerald-400' : doc.risk === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{doc.risk.charAt(0).toUpperCase() + doc.risk.slice(1)}</span>
                </div>
              </div>
            </div>

            {/* What the test covers */}
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-5 space-y-4">
              <span className="text-xs text-white/40 uppercase tracking-widest">What gets tested</span>
              <div className="space-y-4">
                {WHAT_HAPPENS.map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-emerald-400/70 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm text-white/70 font-medium">{label}</div>
                      <div className="text-xs text-white/30 mt-0.5 leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: run button / results */}
          <div className="space-y-4">
            {/* Run button (pre-results state) */}
            {!result && (
              <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-8 flex flex-col items-center justify-center gap-6 h-full min-h-[300px]">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl" />
                  <div className="relative w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    {sandboxRunning
                      ? <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                      : <FlaskConical className="w-7 h-7 text-emerald-400" />}
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-white font-semibold">
                    {sandboxRunning ? 'Running sandbox tests…' : 'Ready to test'}
                  </p>
                  <p className="text-xs text-white/35 leading-relaxed max-w-[220px] mx-auto">
                    {sandboxRunning
                      ? 'Checking auth, data retrieval, error handling, and security…'
                      : 'Runs 5 checks against your integration code using a test token.'}
                  </p>
                </div>
                <button
                  onClick={onRunSandbox}
                  disabled={sandboxRunning}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-sm hover:from-emerald-400 hover:to-emerald-300 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-40 flex items-center gap-2"
                >
                  {sandboxRunning ? <><Loader2 className="w-4 h-4 animate-spin" /> Running…</> : 'Run Sandbox Test'}
                </button>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-4">
                {/* Security scan */}
                <div className={`rounded-2xl border p-5 flex items-start gap-3 ${
                  result.securityScanPassed
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  {result.securityScanPassed
                    ? <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    : <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <div className={`font-semibold text-sm ${result.securityScanPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                      Security scan: {result.securityScanPassed ? 'Passed' : 'Failed'}
                    </div>
                    {result.securityIssues.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {result.securityIssues.map((issue, i) => (
                          <li key={i} className="text-xs text-red-300/80">• {issue}</li>
                        ))}
                      </ul>
                    )}
                    {!result.securityScanPassed && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={onBack} className="px-3 py-1.5 rounded-lg text-xs bg-white/10 text-white hover:bg-white/20 transition-colors">
                          Manually Review
                        </button>
                        <button onClick={onBack} className="px-3 py-1.5 rounded-lg text-xs bg-red-500 text-white hover:bg-red-400 transition-colors">
                          Fix Automatically
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Test rows */}
                <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-5">
                  <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Test Results</div>
                  <StatusRow label="Authentication" passed={result.authPassed} />
                  <StatusRow label="Data retrieval" passed={result.dataPulled} />
                  <StatusRow label="Error handling" passed={result.errorCount === 0} value={`${result.errorCount} errors`} />
                  <StatusRow label="Rate limit buffer" passed={true} value={result.rateLimitBuffer} />
                </div>

                {/* Promote / fix */}
                {result.securityScanPassed && result.authPassed && result.dataPulled ? (
                  needsApproval ? (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-yellow-400 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-yellow-400">Engineer approval required</div>
                          <div className="text-xs text-yellow-300/70 mt-0.5">Medium/High risk — a team member must review before production.</div>
                        </div>
                      </div>
                      <button className="w-full py-3 rounded-xl border border-yellow-500/30 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/10 transition-colors">
                        Request Review →
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={onPromote}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-base hover:from-emerald-400 hover:to-emerald-300 transition-all shadow-lg shadow-emerald-500/30"
                    >
                      Promote to Production →
                    </button>
                  )
                ) : (
                  <button
                    onClick={onBack}
                    className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors"
                  >
                    ← Fix Issues in Code Editor
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
