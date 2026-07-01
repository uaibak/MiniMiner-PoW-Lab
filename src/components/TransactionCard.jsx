import { ArrowRight, Sparkles } from 'lucide-react';
import { formatCoins, formatDate, shortHash } from '../utils/format';
import CopyButton from './CopyButton';

export default function TransactionCard({ transaction }) {
  const isReward = transaction.from === 'SYSTEM';

  return (
    <article className={`rounded-lg border p-4 ${isReward ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
          <span title={transaction.from}>{shortHash(transaction.from, 8, 6)}</span>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <span title={transaction.to}>{shortHash(transaction.to, 8, 6)}</span>
        </div>
        <span
          className={`rounded px-2 py-1 text-xs font-semibold ${
            transaction.status === 'confirmed'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {transaction.status}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p className="text-lg font-semibold text-slate-950">{formatCoins(transaction.amount)}</p>
        {isReward ? (
          <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
            <Sparkles className="h-3.5 w-3.5" />
            Mining reward
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-slate-500">{formatDate(transaction.timestamp)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <CopyButton value={transaction.id} label="Copy ID" />
        <CopyButton value={transaction.from} label="Copy From" />
        <CopyButton value={transaction.to} label="Copy To" />
      </div>
    </article>
  );
}
