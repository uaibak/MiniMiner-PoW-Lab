import { useMemo, useState } from 'react';
import WalletCard from '../components/WalletCard';
import { calculateBalances } from '../core/blockchain';
import { useMinerStore } from '../store/useMinerStore';

export default function Wallets() {
  const wallets = useMinerStore((state) => state.wallets);
  const chain = useMinerStore((state) => state.chain);
  const pendingTransactions = useMinerStore((state) => state.pendingTransactions);
  const createWallet = useMinerStore((state) => state.createWallet);
  const balances = useMemo(
    () => calculateBalances(chain, pendingTransactions),
    [chain, pendingTransactions],
  );
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const result = createWallet(name);
    setMessage(result.ok ? 'Wallet created.' : result.error);
    if (result.ok) setName('');
  }

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-normal text-slate-950">Wallets</h1>
      <p className="mt-2 text-slate-600">
        Create simulated wallets. Balances are derived from confirmed blockchain transactions.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <label className="text-sm font-medium text-slate-700" htmlFor="wallet-name">
          Wallet name
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="wallet-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
            placeholder="Ada Lovelace"
          />
          <button className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800">
            Create Wallet
          </button>
        </div>
        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
      </form>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {wallets.map((wallet) => (
          <WalletCard key={wallet.id} wallet={wallet} balance={balances[wallet.address] || 0} />
        ))}
      </div>
    </section>
  );
}
