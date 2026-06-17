import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatDate, formatNumber, shortHash } from '../utils/format';
import TransactionCard from './TransactionCard';

export default function BlockCard({ block }) {
  const [open, setOpen] = useState(block.index === 0);

  return (
    <article className="rounded-lg border border-slate-200 bg-white shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
      >
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Block #{block.index}</h3>
          <p className="text-sm text-slate-500">{formatDate(block.timestamp)}</p>
        </div>
        {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="border-t border-slate-200 p-4">
          <dl className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500">Previous hash</dt>
              <dd className="mt-1 font-mono mono-hash text-slate-900">{block.previousHash}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Current hash</dt>
              <dd className="mt-1 font-mono mono-hash text-slate-900">{block.hash}</dd>
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
