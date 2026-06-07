'use client';
import { useState } from 'react';
import { Settings, X, Eye, EyeOff, Check } from 'lucide-react';

interface Props {
  currentKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

export default function SettingsModal({ currentKey, onSave, onClose }: Props) {
  const [key, setKey] = useState(currentKey);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(key.trim());
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1117] shadow-2xl shadow-black/60 p-6 space-y-5">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <Settings className="w-5 h-5 text-white/60" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Settings</h2>
            <p className="text-xs text-white/50">Configure your Claude API key</p>
          </div>
        </div>

        <div>
          <label className="text-xs text-white/50 block mb-2">Claude API Key (optional)</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              placeholder="sk-ant-... (leave blank to use shared key)"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 pr-10"
            />
            <button
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-white/30 mt-2">
            Your key is never stored. It's sent only during API calls and stays server-side.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-sm hover:from-emerald-400 hover:to-emerald-300 transition-all flex items-center justify-center gap-2"
        >
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
