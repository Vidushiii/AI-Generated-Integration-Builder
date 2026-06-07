'use client';
import { useState } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import type { Mode } from '@/app/lib/state';
import { mockQnA } from '@/app/lib/mockData';

interface Props {
  mode: Mode;
  docText: string;
  userKey?: string;
  onKeyError?: () => void;
  /** If false, the panel is hidden entirely. Defaults to true. */
  show?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function AskDocPanel({ mode, docText, userKey, onKeyError, show = true }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const getMockAnswer = (q: string) => {
    const lower = q.toLowerCase();
    if (lower.includes('auth') || lower.includes('token') || lower.includes('oauth')) return mockQnA.auth;
    if (lower.includes('rate') || lower.includes('limit')) return mockQnA.rate;
    if (lower.includes('endpoint') || lower.includes('api')) return mockQnA.endpoint;
    return mockQnA.default;
  };

  const ask = async () => {
    const q = input.trim();
    if (!q) return;

    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);

    if (mode === 'demo' || !docText) {
      await new Promise((r) => setTimeout(r, 600));
      setMessages((m) => [...m, { role: 'assistant', text: getMockAnswer(q) }]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docText, question: q, userKey }),
      });

      const data = await res.json();

      if (res.status === 401 || data.error === 'API_KEY_REQUIRED') {
        onKeyError?.();
        setMessages((m) => [...m, { role: 'assistant', text: 'API key required. Please add your key in Settings.' }]);
      } else {
        setMessages((m) => [...m, { role: 'assistant', text: data.answer ?? data.error }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Failed to reach the server.' }]);
    }

    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 w-80 rounded-2xl border border-white/10 bg-[#0f1117]/95 backdrop-blur-xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
            <span className="text-sm font-semibold text-white">Ask about the docs</span>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white text-lg leading-none">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72">
            {messages.length === 0 && (
              <p className="text-xs text-white/30 text-center mt-4">Ask anything about the API documentation.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-xl px-3 py-2 max-w-[90%] text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                      : 'bg-white/5 text-white/80 border border-white/10'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl px-3 py-2 bg-white/5 border border-white/10">
                  <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-3 flex gap-2">
            <input
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50"
              placeholder="How does auth work?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ask()}
            />
            <button
              onClick={ask}
              disabled={loading || !input.trim()}
              className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black disabled:opacity-40 transition-colors"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105"
      >
        <MessageCircle className="w-4 h-4" />
        Ask about the doc
      </button>
    </div>
  );
}
