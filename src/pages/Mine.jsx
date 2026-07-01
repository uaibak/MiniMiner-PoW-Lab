import { Blocks, Pickaxe, Square, Wallet } from 'lucide-react';
import { useState } from 'react';
import EmptyState from '../components/EmptyState';
import MiningProgress from '../components/MiningProgress';
import TransactionCard from '../components/TransactionCard';
import { createRewardTransaction } from '../core/transaction';
import { useMinerStore } from '../store/useMinerStore';
import { formatCoins, formatNumber, shortHash } from '../utils/format';

export default function Mine({ onNavigate }) {
  const wallets = useMinerStore((state) => state.wallets);
  const chain = useMinerStore((state) => state.chain);
  const pendingTransactions = useMinerStore((state) => state.pendingTransactions);
  const difficulty = useMinerStore((state) => state.difficulty);
  const miningReward = useMinerStore((state) => state.miningReward);
  const isMining = useMinerStore((state) => state.isMining);
  const miningProgress = useMinerStore((state) => state.miningProgress);
  const latestMiningResult = useMinerStore((state) => state.latestMiningResult);
  const minePendingTransactions = useMinerStore((state) => state.minePendingTransactions);
  const stopMining = useMinerStore((state) => state.stopMining);
  const realWallets = wallets.filter((wallet) => wallet.address !== 'SYSTEM');
  const [minerAddress, setMinerAddress] = useState(realWallets[0]?.address || '');
  const [message, setMessage] = useState('');
  const selectedMiner = realWallets.find((wallet) => wallet.address === minerAddress);
  const rewardPreview = minerAddress ? createRewardTransaction(minerAddress, miningReward) : null;
  const previousBlock = chain[chain.length - 1];
  const nextBlockIndex = previousBlock.index + 1;

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

      {realWallets.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Wallet}
            title="Create a wallet before mining"
            message="A normal wallet is required to receive the SYSTEM mining reward."
            actionLabel="Go to Wallets"
            onAction={() => onNavigate('wallets')}
          />
        </div>
      ) : null}

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
        <div className="rounded-md bg-slate-50 p-3 lg:col-span-2">
          <p className="text-sm font-medium text-slate-500">Next block preview</p>
          <p className="mt-2 font-semibold text-slate-950">Block #{nextBlockIndex}</p>
          <p className="mt-1 font-mono text-xs text-slate-500 mono-hash">
            Previous {shortHash(previousBlock.hash, 14, 10)}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-500">Target prefix</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-950">{'0'.repeat(difficulty)}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-500">Reward recipient</p>
          <p className="mt-2 truncate font-semibold text-slate-950">{selectedMiner?.name || 'Not selected'}</p>
          <p className="mt-1 text-xs text-slate-500">{formatCoins(miningReward)}</p>
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

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Transactions to Include</h2>
          <div className="mt-3 grid gap-3">
            {pendingTransactions.length ? (
              pendingTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <EmptyState
                icon={Blocks}
                title="No pending transactions"
                message="Mining still creates a valid block because the reward transaction will be included."
                actionLabel="Create Transaction"
                onAction={() => onNavigate('transactions')}
              />
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Reward Transaction</h2>
          <div className="mt-3">
            {rewardPreview ? (
              <TransactionCard transaction={rewardPreview} />
            ) : (
              <EmptyState
                icon={Wallet}
                title="Choose a miner wallet"
                message="The selected wallet receives the SYSTEM reward when the block is found."
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <MiningProgress progress={miningProgress} />
      </div>

      {latestMiningResult ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Latest mined block</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            Block #{latestMiningResult.blockIndex} · {formatNumber(latestMiningResult.attempts)} attempts · {formatNumber(latestMiningResult.hashRate)} H/s
          </p>
          <p className="mt-1 font-mono text-xs text-slate-600 mono-hash">{latestMiningResult.hash}</p>
        </div>
      ) : null}
    </section>
  );
}
