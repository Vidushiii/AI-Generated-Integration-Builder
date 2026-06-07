'use client';
import type { Mode } from '@/app/lib/state';

interface Props {
  mode: Mode;
  onChange: (m: Mode) => void;
}

export default function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex items-center justify-center">
      <div className="relative flex bg-black/40 border border-white/10 rounded-lg p-1 gap-1">
        {(['demo', 'live'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`relative px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
              mode === m
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-lg shadow-emerald-500/30'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {m === 'demo' ? 'Demo Mode' : 'Live Mode'}
          </button>
        ))}
      </div>
    </div>
  );
}
