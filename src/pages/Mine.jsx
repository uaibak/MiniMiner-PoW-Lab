import { Pickaxe, Square } from 'lucide-react';
import { useState } from 'react';
import MiningProgress from '../components/MiningProgress';
import { useMinerStore } from '../store/useMinerStore';
import { formatNumber } from '../utils/format';

export default function Mine() {
  const wallets = useMinerStore((state) => state.wallets);
  const pendingTransactions = useMinerStore((state) => state.pendingTransactions);
  const difficulty = useMinerStore((state) => state.difficulty);
  const miningReward = useMinerStore((state) => state.miningReward);
  const isMining = useMinerStore((state) => state.isMining);
  const miningProgress = useMinerStore((state) => state.miningProgress);
  const minePendingTransactions = useMinerStore((state) => state.minePendingTransactions);
  const stopMining = useMinerStore((state) => state.stopMining);
  const realWallets = wallets.filter((wallet) => wallet.address !== 'SYSTEM');
  const [minerAddress, setMinerAddress] = useState(realWallets[0]?.address || '');
  const [message, setMessage] = useState('');

  async function startMining() {
    const result = await minePendingTransactions(minerAddress);
    if (result.ok) setMessage(`Block #${result.block.index} mined successfully.`);
    else setMessage(result.error || 'Mining stopped.');
  }

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-normal text-slate-950">Mine</h1>
      <p className="mt-2 text-slate-600">
        Mine all pending transactions plus a SYSTEM reward transaction into the next block.
      </p>

      <div className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-soft lg:grid-cols-4">
        <label className="lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">Reward wallet</span>
          <select
            value={minerAddress}
            onChange={(event) => setMinerAddress(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            disabled={isMining}
          >
            <option value="">Choose miner wallet</option>
            {realWallets.map((wallet) => (
              <option key={wallet.id} value={wallet.address}>
                {wallet.name}
              </option>
            ))}
          </select>
        </label>
        <div>
          <p className="text-sm font-medium text-slate-500">Pending transactions</p>
          <p className="mt-2 text-2xl font-semibold">{formatNumber(pendingTransactions.length)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Reward / difficulty</p>
          <p className="mt-2 text-2xl font-semibold">{miningReward} / {difficulty}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4">
          <button
            type="button"
            onClick={startMining}
            disabled={isMining || !minerAddress}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <Pickaxe className="h-4 w-4" />
            Start Mining
          </button>
          <button
            type="button"
            onClick={stopMining}
            disabled={!isMining}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <Square className="h-4 w-4" />
            Stop
          </button>
        </div>
        {message ? <p className="lg:col-span-4 text-sm text-slate-600">{message}</p> : null}
      </div>

      <div className="mt-6">
        <MiningProgress progress={miningProgress} />
      </div>
    </section>
  );
}
