import { Wallet } from 'lucide-react';
import { formatCoins, formatDate, shortHash } from '../utils/format';

export default function WalletCard({ wallet, balance }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-slate-100 p-2">
          <Wallet className="h-5 w-5 text-slate-700" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-950">{wallet.name}</h3>
            {wallet.address === 'SYSTEM' ? (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                Genesis/System
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-500">{formatDate(wallet.createdAt)}</p>
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-950">{formatCoins(balance)}</p>
      <p className="mt-2 font-mono text-xs text-slate-500 mono-hash" title={wallet.address}>
        {shortHash(wallet.address, 14, 10)}
      </p>
    </article>
  );
}
