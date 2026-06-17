import { ArrowRight } from 'lucide-react';
import { formatCoins, formatDate, shortHash } from '../utils/format';

export default function TransactionCard({ transaction }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
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
      <p className="mt-3 text-lg font-semibold text-slate-950">{formatCoins(transaction.amount)}</p>
      <p className="mt-1 text-sm text-slate-500">{formatDate(transaction.timestamp)}</p>
    </article>
  );
}
