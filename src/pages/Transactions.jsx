import { useMemo, useState } from 'react';
import { Pickaxe, Send, Wallet } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import TransactionCard from '../components/TransactionCard';
import { calculateBalances } from '../core/blockchain';
import { useMinerStore } from '../store/useMinerStore';
import { formatCoins, shortHash } from '../utils/format';

export default function Transactions({ onNavigate }) {
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
  const pendingOutgoingByWallet = useMemo(() => {
    const totals = {};
    for (const transaction of pendingTransactions) {
      if (transaction.from === 'SYSTEM') continue;
      totals[transaction.from] = (totals[transaction.from] || 0) + Number(transaction.amount || 0);
    }
    return totals;
  }, [pendingTransactions]);
  const selectedSenderBalance = balances[form.from] || 0;
  const selectedPendingOutgoing = pendingOutgoingByWallet[form.from] || 0;
  const selectedAvailableBalance = Math.max(0, selectedSenderBalance - selectedPendingOutgoing);
  const receiverOptions = realWallets.filter((wallet) => wallet.address !== form.from);

  const confirmedTransactions = useMemo(
    () => chain.flatMap((block) => block.transactions.map((transaction) => ({ ...transaction, blockIndex: block.index }))).reverse(),
    [chain],
  );

  function update(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'from' && next.to === value) {
        next.to = '';
      }
      return next;
    });
  }

  function setAmountByRatio(ratio) {
    setForm((current) => ({
      ...current,
      amount: String(Number((selectedAvailableBalance * ratio).toFixed(4))),
    }));
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
              <option
                key={wallet.id}
                value={wallet.address}
                disabled={Math.max(0, (balances[wallet.address] || 0) - (pendingOutgoingByWallet[wallet.address] || 0)) <= 0}
              >
                {wallet.name} ({formatCoins(Math.max(0, (balances[wallet.address] || 0) - (pendingOutgoingByWallet[wallet.address] || 0)))})
              </option>
            ))}
          </select>
          {form.from ? (
            <p className="mt-2 text-xs text-slate-500">
              Confirmed {formatCoins(selectedSenderBalance)} · Pending out {formatCoins(selectedPendingOutgoing)} · Available {formatCoins(selectedAvailableBalance)}
            </p>
          ) : null}
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
            {receiverOptions.map((wallet) => (
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
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAmountByRatio(0.25)}
              disabled={!form.from || selectedAvailableBalance <= 0}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              25%
            </button>
            <button
              type="button"
              onClick={() => setAmountByRatio(0.5)}
              disabled={!form.from || selectedAvailableBalance <= 0}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => setAmountByRatio(1)}
              disabled={!form.from || selectedAvailableBalance <= 0}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Max
            </button>
          </div>
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
              <EmptyState
                icon={Send}
                title="No pending transactions"
                message="Send coins between two wallets, then mine a block to confirm the pending pool."
                actionLabel={realWallets.length < 2 ? 'Create Wallets' : undefined}
                onAction={realWallets.length < 2 ? () => onNavigate('wallets') : undefined}
              />
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
              <EmptyState
                icon={chain.length > 1 ? Wallet : Pickaxe}
                title="No confirmed transfers yet"
                message="Mine a reward block first, then send coins and mine again to confirm that transfer."
                actionLabel="Go to Mine"
                onAction={() => onNavigate('mine')}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
