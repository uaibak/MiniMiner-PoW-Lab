import { useMemo, useState } from 'react';
import TransactionCard from '../components/TransactionCard';
import { calculateBalances } from '../core/blockchain';
import { useMinerStore } from '../store/useMinerStore';
import { formatCoins, shortHash } from '../utils/format';

export default function Transactions() {
  const wallets = useMinerStore((state) => state.wallets);
  const chain = useMinerStore((state) => state.chain);
  const pendingTransactions = useMinerStore((state) => state.pendingTransactions);
  const createTransaction = useMinerStore((state) => state.createTransaction);
  const balances = useMemo(
    () => calculateBalances(chain, pendingTransactions),
    [chain, pendingTransactions],
  );
  const realWallets = wallets.filter((wallet) => wallet.address !== 'SYSTEM');
  const [form, setForm] = useState({ from: '', to: '', amount: '' });
  const [message, setMessage] = useState('');

  const confirmedTransactions = useMemo(
    () => chain.flatMap((block) => block.transactions.map((transaction) => ({ ...transaction, blockIndex: block.index }))).reverse(),
    [chain],
  );

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = createTransaction(form);
    setMessage(result.ok ? 'Transaction added to pending transactions.' : result.error);
    if (result.ok) setForm((current) => ({ ...current, amount: '' }));
  }

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-normal text-slate-950">Transactions</h1>
      <p className="mt-2 text-slate-600">Send simulated coins between wallets and mine pending transactions into a block.</p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-soft lg:grid-cols-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Sender</span>
          <select
            value={form.from}
            onChange={(event) => update('from', event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          >
            <option value="">Choose sender</option>
            {realWallets.map((wallet) => (
              <option key={wallet.id} value={wallet.address}>
                {wallet.name} ({formatCoins(balances[wallet.address] || 0)})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Receiver</span>
          <select
            value={form.to}
            onChange={(event) => update('to', event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          >
            <option value="">Choose receiver</option>
            {realWallets.map((wallet) => (
              <option key={wallet.id} value={wallet.address}>
                {wallet.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Amount</span>
          <input
            value={form.amount}
            onChange={(event) => update('amount', event.target.value)}
            type="number"
            min="0"
            step="0.0001"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <div className="flex items-end">
          <button className="w-full rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800">
            Add Transaction
          </button>
        </div>
        {message ? <p className="lg:col-span-4 text-sm text-slate-600">{message}</p> : null}
      </form>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Pending Transactions</h2>
          <div className="mt-3 grid gap-3">
            {pendingTransactions.length ? (
              pendingTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-slate-500">
                No pending transactions.
              </p>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Confirmed Transactions</h2>
          <div className="mt-3 grid gap-3">
            {confirmedTransactions.length ? (
              confirmedTransactions.map((transaction) => (
                <div key={`${transaction.blockIndex}-${transaction.id}`}>
                  <p className="mb-1 text-xs font-medium text-slate-500">Block #{transaction.blockIndex} · {shortHash(transaction.id, 8, 4)}</p>
                  <TransactionCard transaction={transaction} />
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-slate-500">
                No confirmed transactions yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
