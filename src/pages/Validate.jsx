import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useMinerStore } from '../store/useMinerStore';

export default function Validate() {
  const chain = useMinerStore((state) => state.chain);
  const validate = useMinerStore((state) => state.validate);
  const tamperTransactionAmount = useMinerStore((state) => state.tamperTransactionAmount);
  const resetSimulation = useMinerStore((state) => state.resetSimulation);
  const validation = validate();
  const tamperableTransactions = useMemo(
    () =>
      chain
        .filter((block) => block.index > 0 && block.transactions.length)
        .flatMap((block) =>
          block.transactions.map((transaction) => ({
            blockIndex: block.index,
            transaction,
          })),
        ),
    [chain],
  );
  const [target, setTarget] = useState('');
  const [amount, setAmount] = useState('');

  function handleTamper(event) {
    event.preventDefault();
    const [blockIndex, transactionId] = target.split(':');
    tamperTransactionAmount({ blockIndex, transactionId, amount });
  }

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-normal text-slate-950">Validate & Tamper Demo</h1>
      <p className="mt-2 text-slate-600">
        Validate hashes, previous-hash links, difficulty, transaction amounts, and balance safety.
      </p>

      <div
        className={`mt-6 rounded-lg border p-5 shadow-soft ${
          validation.valid ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
        }`}
      >
        <div className="flex items-start gap-3">
          {validation.valid ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-700" />
          ) : (
            <ShieldAlert className="h-6 w-6 text-rose-700" />
          )}
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              {validation.valid ? 'Blockchain is valid' : 'Blockchain is invalid'}
            </h2>
            <p className="mt-1 text-slate-700">
              {validation.reason}
              {validation.blockIndex !== null ? ` Block #${validation.blockIndex}.` : ''}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleTamper} className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-soft md:grid-cols-3">
        <label className="md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Transaction to edit</span>
          <select
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          >
            <option value="">Choose a confirmed transaction</option>
            {tamperableTransactions.map(({ blockIndex, transaction }) => (
              <option key={`${blockIndex}:${transaction.id}`} value={`${blockIndex}:${transaction.id}`}>
                Block #{blockIndex} · {transaction.from} to {transaction.to} · {transaction.amount}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium text-slate-700">New amount</span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            min="0"
            step="0.0001"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <div className="flex flex-col gap-3 md:col-span-3 sm:flex-row">
          <button
            type="submit"
            disabled={!tamperableTransactions.length}
            className="rounded-md bg-rose-700 px-4 py-2 font-semibold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Tamper With Block Data
          </button>
          <button
            type="button"
            onClick={resetSimulation}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
          >
            Reset Simulation
          </button>
        </div>
      </form>

      {!tamperableTransactions.length ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-5 text-slate-500">
          Mine at least one block before trying the tamper demo.
        </p>
      ) : null}
    </section>
  );
}
