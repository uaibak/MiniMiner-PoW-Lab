import { Wallet } from 'lucide-react';
import { formatCoins, formatDate, shortHash } from '../utils/format';
import CopyButton from './CopyButton';

export default function WalletCard({ wallet, balance, pendingOutgoing = 0, isLastMiner = false }) {
  const availableBalance = Math.max(0, Number(balance || 0) - Number(pendingOutgoing || 0));

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
            {isLastMiner ? (
              <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-900">
                Last miner
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-500">{formatDate(wallet.createdAt)}</p>
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-950">{formatCoins(balance)}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md bg-slate-50 p-2">
          <p className="text-xs font-medium text-slate-500">Pending out</p>
          <p className="mt-1 font-semibold text-slate-900">{formatCoins(pendingOutgoing)}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <p className="text-xs font-medium text-slate-500">Available</p>
          <p className="mt-1 font-semibold text-slate-900">{formatCoins(availableBalance)}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs text-slate-500 mono-hash" title={wallet.address}>
          {shortHash(wallet.address, 14, 10)}
        </p>
        <CopyButton value={wallet.address} label="Copy" />
      </div>
    </article>
  );
}
