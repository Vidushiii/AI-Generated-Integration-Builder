'use client';
import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

interface Props {
  onCancel: () => void;
}

const STAGES = [
  'Parsing API documentation…',
  'Identifying authentication model…',
  'Mapping endpoints and data structures…',
  'Generating API client…',
  'Writing auth setup…',
  'Building data retrieval layer…',
  'Adding error handling & retry logic…',
  'Setting up pagination helpers…',
  'Wiring in structured logging…',
  'Running final checks…',
];

const CODE_LINES = [
  "export class CalendlyClient {",
  "  private client: AxiosInstance;",
  "  constructor(private token: string) {",
  "    this.client = axios.create({",
  "      baseURL: 'https://api.calendly.com',",
  "      headers: { Authorization: `Bearer ${token}` },",
  "    });",
  "  }",
  "  async get<T>(path: string): Promise<T> {",
  "    const res = await this.client.get(path);",
  "    return res.data;",
  "  }",
  "}",
  "",
  "export async function getAuthToken(config: AuthConfig) {",
  "  if (config.accessToken) return config.accessToken;",
  "  const res = await fetch('/oauth/token', {",
  "    method: 'POST',",
  "    body: new URLSearchParams({ grant_type: 'client_credentials' }),",
  "  });",
];

export default function Screen3Generating({ onCancel }: Props) {
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 1));
      setProgress((p) => Math.min(p + 10, 95));
      setVisibleLines((l) => Math.min(l + 2, CODE_LINES.length));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col p-6 lg:p-10">
      {/* Top nav */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
          <span className="text-sm text-white/60">Generating integration…</span>
        </div>
        <span className="text-xs text-white/20 font-mono">Step 3 of 6</span>
      </div>

      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full gap-8 justify-center">
        {/* Main layout */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: status */}
          <div className="space-y-8">
            {/* Glow orb */}
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-emerald-500/25 blur-2xl animate-pulse" />
                <div className="relative w-16 h-16 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Generating your integration</h2>
                <p className="text-sm text-white/40 mt-1">Claude is writing production-ready TypeScript</p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">Progress</span>
                <span className="text-xs text-emerald-400 font-mono">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-emerald-400/80 font-mono min-h-[1.25rem]">{STAGES[stageIdx]}</p>
            </div>

            {/* Stage checklist */}
            <div className="space-y-2">
              {STAGES.slice(0, 6).map((stage, i) => (
                <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i <= stageIdx ? 'opacity-100' : 'opacity-20'}`}>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    i < stageIdx ? 'bg-emerald-500 border-emerald-500' : i === stageIdx ? 'border-emerald-400' : 'border-white/20'
                  }`}>
                    {i < stageIdx && <span className="text-[9px] text-black font-bold">✓</span>}
                    {i === stageIdx && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  </div>
                  <span className={`text-xs ${i === stageIdx ? 'text-emerald-300' : i < stageIdx ? 'text-white/40' : 'text-white/20'}`}>
                    {stage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: code stream */}
          <div className="rounded-2xl border border-white/10 bg-black/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>
              <span className="text-xs text-white/30 font-mono ml-2">calendly-integration.ts</span>
              <div className="ml-auto">
                <Loader2 className="w-3 h-3 text-emerald-400/60 animate-spin" />
              </div>
            </div>
            <div className="p-4 font-mono text-xs text-emerald-300/70 h-72 overflow-hidden relative">
              {CODE_LINES.slice(0, visibleLines).map((line, i) => (
                <div key={i} className={`leading-6 ${i === visibleLines - 1 ? 'animate-pulse' : ''}`}>
                  {line || ' '}
                </div>
              ))}
              {/* Blinking cursor */}
              <div className="inline-block w-1.5 h-4 bg-emerald-400/70 animate-pulse ml-0.5" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white text-sm transition-colors"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
