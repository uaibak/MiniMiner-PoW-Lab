import { Activity, Hash, Timer, Zap } from 'lucide-react';
import { formatNumber, shortHash } from '../utils/format';

export default function MiningProgress({ progress }) {
  if (!progress) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
        Mining progress will appear here after a job starts.
      </div>
    );
  }

  const items = [
    { label: 'Current nonce', value: formatNumber(progress.nonce), icon: Hash },
    { label: 'Attempts', value: formatNumber(progress.attempts), icon: Activity },
    { label: 'Elapsed time', value: `${formatNumber(progress.elapsedMs / 1000, 2)}s`, icon: Timer },
    { label: 'Hash rate', value: `${formatNumber(progress.hashRate)} H/s`, icon: Zap },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-md bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Icon className="h-4 w-4" />
                {item.label}
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-950">{item.value}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-4 font-mono text-sm text-slate-600 mono-hash">
        {shortHash(progress.currentHash, 28, 18)}
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        Engine: {progress.engine || 'auto'}
      </p>
    </div>
  );
}
