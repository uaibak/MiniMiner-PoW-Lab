import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, ShieldAlert } from 'lucide-react';
import { formatDate, formatNumber, shortHash } from '../utils/format';
import CopyButton from './CopyButton';
import TransactionCard from './TransactionCard';

export default function BlockCard({ block, initiallyOpen = false, expandSignal = 0, validation }) {
  const [open, setOpen] = useState(initiallyOpen || block.index === 0);

  useEffect(() => {
    if (expandSignal > 0) setOpen(true);
    if (expandSignal < 0) setOpen(false);
  }, [expandSignal]);

  return (
    <article className="rounded-lg border border-slate-200 bg-white shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-950">Block #{block.index}</h3>
            {validation ? (
              <span
                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${
                  validation.valid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {validation.valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                {validation.valid ? 'Valid' : 'Invalid'}
              </span>
            ) : null}
            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
              {block.transactions.length} tx
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{formatDate(block.timestamp)}</p>
          {!open ? (
            <p className="mt-1 font-mono text-xs text-slate-500 mono-hash">{shortHash(block.hash, 16, 10)}</p>
          ) : null}
        </div>
        {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="border-t border-slate-200 p-4">
          <dl className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500">Previous hash</dt>
              <dd className="mt-1 font-mono mono-hash text-slate-900">{block.previousHash}</dd>
              <CopyButton value={block.previousHash} label="Copy Hash" className="mt-2" />
            </div>
            <div>
              <dt className="font-medium text-slate-500">Current hash</dt>
              <dd className="mt-1 font-mono mono-hash text-slate-900">{block.hash}</dd>
              <CopyButton value={block.hash} label="Copy Hash" className="mt-2" />
            </div>
            <div>
              <dt className="font-medium text-slate-500">Nonce</dt>
              <dd className="mt-1 text-slate-900">{formatNumber(block.nonce)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Difficulty</dt>
              <dd className="mt-1 text-slate-900">{block.difficulty}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Miner</dt>
              <dd className="mt-1 font-mono mono-hash text-slate-900">{shortHash(block.minerAddress, 12, 8)}</dd>
              <CopyButton value={block.minerAddress} label="Copy Miner" className="mt-2" />
            </div>
            <div>
              <dt className="font-medium text-slate-500">Mining stats</dt>
              <dd className="mt-1 text-slate-900">
                {formatNumber(block.miningStats?.attempts)} attempts,{' '}
                {formatNumber(block.miningStats?.hashRate, 0)} H/s
                {block.miningStats?.engine ? `, ${block.miningStats.engine}` : ''}
              </dd>
            </div>
          </dl>

          {validation && !validation.valid ? (
            <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-900">
              {validation.reason}
            </p>
          ) : null}

          <h4 className="mt-5 font-semibold text-slate-950">Transactions</h4>
          <div className="mt-3 grid gap-3">
            {block.transactions.length ? (
              block.transactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">
                Genesis block has no transactions.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}
