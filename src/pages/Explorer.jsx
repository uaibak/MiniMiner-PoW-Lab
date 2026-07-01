import { useMemo, useState } from 'react';
import BlockCard from '../components/BlockCard';
import EmptyState from '../components/EmptyState';
import { validateBlock } from '../core/validation';
import { useMinerStore } from '../store/useMinerStore';
import { Blocks } from 'lucide-react';

export default function Explorer() {
  const chain = useMinerStore((state) => state.chain);
  const [query, setQuery] = useState('');
  const [expandSignal, setExpandSignal] = useState(0);
  const normalizedQuery = query.trim().toLowerCase();
  const blockValidations = useMemo(
    () =>
      chain.map((block, index) =>
        validateBlock(block, index > 0 ? chain[index - 1] : null),
      ),
    [chain],
  );
  const filteredBlocks = useMemo(() => {
    if (!normalizedQuery) return chain;
    return chain.filter((block) => {
      const haystack = [
        String(block.index),
        block.hash,
        block.previousHash,
        block.minerAddress,
        ...block.transactions.flatMap((transaction) => [
          transaction.id,
          transaction.from,
          transaction.to,
          String(transaction.amount),
        ]),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [chain, normalizedQuery]);

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-normal text-slate-950">Blockchain Explorer</h1>
      <p className="mt-2 text-slate-600">Inspect every block, hash, nonce, miner, transaction, and mining statistic.</p>

      <div className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-soft lg:grid-cols-[1fr_auto]">
        <label>
          <span className="text-sm font-medium text-slate-700">Search blocks, hashes, wallets, or transaction IDs</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
            placeholder="Block index, hash, address, amount..."
          />
        </label>
        <div className="flex flex-col gap-2 sm:flex-row lg:items-end">
          <button
            type="button"
            onClick={() => setExpandSignal((value) => Math.abs(value) + 1)}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={() => setExpandSignal((value) => -(Math.abs(value) + 1))}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {filteredBlocks.length ? (
          filteredBlocks.map((block) => (
            <BlockCard
              key={block.index}
              block={block}
              expandSignal={expandSignal}
              validation={blockValidations[block.index]}
            />
          ))
        ) : (
          <EmptyState
            icon={Blocks}
            title="No blocks match that search"
            message="Try searching by block index, hash prefix, miner address, transaction ID, or amount."
          />
        )}
      </div>
    </section>
  );
}
