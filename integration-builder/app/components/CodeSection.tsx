'use client';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChevronDown, ChevronRight, Copy, Check, Pencil, Save } from 'lucide-react';

interface Props {
  id: string;
  title: string;
  language: string;
  code: string;
  editable?: boolean;
  onSave?: (id: string, newCode: string) => void;
}

export default function CodeSection({ id, title, language, code, editable, onSave }: Props) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(code);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave?.(id, editValue);
    setEditing(false);
  };

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden bg-black/30 backdrop-blur-sm">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => !editing && setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="w-4 h-4 text-emerald-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-white/40" />
          )}
          <span className="text-sm font-semibold text-white">{title}</span>
          <span className="text-xs text-white/30 font-mono">.ts</span>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {editable && !editing && (
            <button
              onClick={() => { setEditValue(code); setEditing(true); setOpen(true); }}
              className="flex items-center gap-1 px-3 py-1 rounded-md text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 transition-all"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
          {editing && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1 rounded-md text-xs bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all"
            >
              <Save className="w-3 h-3" /> Save
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 rounded-md text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 transition-all"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10">
          {editing ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full bg-[#1a1a2e] text-emerald-300 font-mono text-sm p-4 outline-none resize-y"
              style={{ minHeight: 300 }}
              spellCheck={false}
            />
          ) : (
            <div className="overflow-x-auto text-sm">
              <SyntaxHighlighter
                language={language}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  background: 'transparent',
                  padding: '1rem',
                  fontSize: '0.8125rem',
                }}
                wrapLongLines={false}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
