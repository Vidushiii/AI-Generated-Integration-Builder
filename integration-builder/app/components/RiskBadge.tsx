import type { RiskLevel } from '@/app/lib/state';

interface Props {
  risk: RiskLevel;
}

const config: Record<RiskLevel, { label: string; color: string; note: string }> = {
  low: {
    label: 'Low Risk',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    note: 'Read-only operations — no approval required.',
  },
  medium: {
    label: 'Medium Risk',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    note: 'Write operations — review recommended.',
  },
  high: {
    label: 'High Risk',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    note: 'PII or bulk writes — engineer approval required.',
  },
};

export default function RiskBadge({ risk }: Props) {
  const c = config[risk];
  return (
    <div className={`inline-flex flex-col gap-1 rounded-lg border px-4 py-2 ${c.color}`}>
      <span className="text-xs font-bold uppercase tracking-widest">{c.label}</span>
      <span className="text-xs opacity-80">{c.note}</span>
    </div>
  );
}
