'use client';
import { ChevronLeft, AlertTriangle, Wand2 } from 'lucide-react';
import CodeSection from './CodeSection';
import AskDocPanel from './AskDocPanel';
import type { AppState } from '@/app/lib/state';

const QUICK_EDITS = [
  'Change OAuth scope to read-only',
  'Add retry logic for 429 errors',
  'Add TypeScript strict mode types',
  'Switch to fetch() instead of axios',
];

interface Props {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function Screen4Output({ state, update, onBack, onContinue }: Props) {
  const output = state.generatedOutput!;

  const handleCodeSave = (id: string, newCode: string) => {
    const sections = output.sections.map((s) => (s.id === id ? { ...s, code: newCode } : s));
    update({ generatedOutput: { ...output, sections } });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-xs text-white/30 font-mono">
            {output.sections.length} sections generated
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Your integration is ready</h2>
          <p className="text-white/40 text-sm">Review, edit, then run a sandbox test before promoting.</p>
        </div>

        {/* Gaps */}
        {output.gaps.length > 0 && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" /> Gaps found — action required
            </div>
            <ul className="space-y-1">
              {output.gaps.map((g) => (
                <li key={g.id} className="text-xs text-red-300/80 flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">•</span>
                  {g.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick-edit chips */}
        <div className="space-y-2">
          <div className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Wand2 className="w-3 h-3" /> Quick edits
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_EDITS.map((q) => (
              <button
                key={q}
                className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-white/50 border border-white/10 hover:border-white/30 hover:text-white/80 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Code sections */}
        <div className="space-y-3">
          {output.sections.map((section) => (
            <CodeSection
              key={section.id}
              {...section}
              editable
              onSave={handleCodeSave}
            />
          ))}
        </div>

        {/* Run sandbox */}
        <div className="sticky bottom-6 flex justify-center">
          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-base hover:from-emerald-400 hover:to-emerald-300 transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02]"
          >
            Run Sandbox Test →
          </button>
        </div>

        <div className="h-16" />
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
