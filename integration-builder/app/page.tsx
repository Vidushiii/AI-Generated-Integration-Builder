'use client';
import { useReducer, useState } from 'react';
import { initialState, type AppState } from '@/app/lib/state';
import { mockParsedDoc, mockGeneratedOutput, mockSandboxResult } from '@/app/lib/mockData';

import Screen1Input from '@/app/components/Screen1Input';
import Screen2Confirm from '@/app/components/Screen2Confirm';
import Screen3Generating from '@/app/components/Screen3Generating';
import Screen4Output from '@/app/components/Screen4Output';
import Screen5Sandbox from '@/app/components/Screen5Sandbox';
import Screen6Production from '@/app/components/Screen6Production';
import ApiKeyModal from '@/app/components/ApiKeyModal';
import SettingsModal from '@/app/components/SettingsModal';

function reducer(state: AppState, patch: Partial<AppState>): AppState {
  return { ...state, ...patch };
}

export default function Home() {
  const [state, update] = useReducer(reducer, initialState);
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [generatingError, setGeneratingError] = useState('');
  const [keyRejected, setKeyRejected] = useState(false);

  const patch = (p: Partial<AppState>) => update(p);

  // ——— Screen 1 → 2: parse doc understanding ———
  const handleScreen1Continue = async () => {
    if (state.mode === 'demo') {
      patch({ parsedDoc: mockParsedDoc, step: 2 });
      return;
    }
    // Live: quick parse then show confirm screen
    patch({ step: 3, parsedDoc: null, generatedOutput: null });
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docText: state.docText,
          selectedOutputs: [],
          userKey: state.userApiKey || undefined,
          parsedDoc: null,
        }),
      });
      const data = await res.json();
      if (res.status === 401 || data.error === 'API_KEY_REQUIRED') {
        setKeyRejected(!!state.userApiKey);
        patch({ showApiKeyModal: true, step: 1 });
        return;
      }
      if (!res.ok) throw new Error(data.error ?? 'Failed to parse documentation');
      patch({ parsedDoc: data.parsedDoc, step: 2 });
    } catch (err: any) {
      setGeneratingError(err.message);
      patch({ step: 1 });
    }
  };

  // ——— Screen 2 → 3 → 4: generate code ———
  const handleGenerate = async () => {
    if (state.mode === 'demo') {
      patch({ step: 3, generatedOutput: null });
      await new Promise((r) => setTimeout(r, 3500));
      patch({ generatedOutput: mockGeneratedOutput, step: 4 });
      return;
    }
    patch({ step: 3, generatedOutput: null });
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docText: state.docText,
          selectedOutputs: state.selectedOutputs,
          userKey: state.userApiKey || undefined,
          parsedDoc: state.parsedDoc,
        }),
      });
      const data = await res.json();
      if (res.status === 401 || data.error === 'API_KEY_REQUIRED') {
        setKeyRejected(!!state.userApiKey);
        patch({ showApiKeyModal: true, step: 2 });
        return;
      }
      if (!res.ok) throw new Error(data.error ?? 'Code generation failed');
      patch({ generatedOutput: data.generatedOutput, step: 4 });
    } catch (err: any) {
      setGeneratingError(err.message);
      patch({ step: 2 });
    }
  };

  // ——— Screen 5: sandbox (always simulated per spec) ———
  const handleRunSandbox = async () => {
    setSandboxRunning(true);
    patch({ sandboxError: null });
    await new Promise((r) => setTimeout(r, 2500));
    patch({ sandboxResult: mockSandboxResult });
    setSandboxRunning(false);
  };

  // ——— Reset ———
  const handleDone = () => {
    patch({
      step: 1,
      docText: '',
      docUrl: '',
      uploadedFileName: '',
      selectedPrompt: '',
      parsedDoc: null,
      generatedOutput: null,
      sandboxResult: null,
      sandboxError: null,
    });
  };

  return (
    <div className="min-h-screen bg-[#080b10] text-white relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#080b10] via-[#0a0f1a] to-[#080b10]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(52,211,153,1) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Screens */}
      <div className="relative z-10">
        {state.step === 1 && (
          <Screen1Input state={state} update={patch} onContinue={handleScreen1Continue} />
        )}
        {state.step === 2 && state.parsedDoc && (
          <Screen2Confirm
            state={state}
            update={patch}
            onBack={() => patch({ step: 1 })}
            onContinue={handleGenerate}
          />
        )}
        {state.step === 3 && (
          <Screen3Generating onCancel={() => patch({ step: 2 })} />
        )}
        {state.step === 4 && state.generatedOutput && (
          <Screen4Output
            state={state}
            update={patch}
            onBack={() => patch({ step: 2 })}
            onContinue={() => patch({ step: 5, sandboxResult: null, sandboxError: null })}
          />
        )}
        {state.step === 5 && (
          <Screen5Sandbox
            state={state}
            update={patch}
            onBack={() => patch({ step: 4 })}
            onPromote={() => patch({ step: 6 })}
            onRunSandbox={handleRunSandbox}
            sandboxRunning={sandboxRunning}
          />
        )}
        {state.step === 6 && state.parsedDoc && (
          <Screen6Production state={state} onDone={handleDone} />
        )}
      </div>

      {/* Modals */}
      {state.showApiKeyModal && (
        <ApiKeyModal
          onSubmit={(key) => { setKeyRejected(false); patch({ userApiKey: key, showApiKeyModal: false }); }}
          onClose={() => { setKeyRejected(false); patch({ showApiKeyModal: false }); }}
          keyRejected={keyRejected}
        />
      )}
      {state.showSettingsModal && (
        <SettingsModal
          currentKey={state.userApiKey}
          onSave={(key) => patch({ userApiKey: key })}
          onClose={() => patch({ showSettingsModal: false })}
        />
      )}

      {/* Error toast */}
      {generatingError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm flex items-center gap-3 shadow-xl">
          {generatingError}
          <button onClick={() => setGeneratingError('')} className="text-red-300/50 hover:text-red-300 ml-1">×</button>
        </div>
      )}
    </div>
  );
}
