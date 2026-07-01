import { Activity, ArrowRight, Blocks, CheckCircle2, Gauge, Hash, Send, Wallet, Zap } from 'lucide-react';
import StatCard from '../components/StatCard';
import { calculateBalances } from '../core/blockchain';
import { useMinerStore } from '../store/useMinerStore';
import { formatNumber, shortHash } from '../utils/format';

export default function Dashboard({ onNavigate }) {
  const chain = useMinerStore((state) => state.chain);
  const wallets = useMinerStore((state) => state.wallets);
  const pendingTransactions = useMinerStore((state) => state.pendingTransactions);
  const difficulty = useMinerStore((state) => state.difficulty);
  const latestMiningResult = useMinerStore((state) => state.latestMiningResult);
  const miningHistory = useMinerStore((state) => state.miningHistory);
  const validate = useMinerStore((state) => state.validate);
  const validation = validate();
  const latestBlock = chain[chain.length - 1];
  const balances = calculateBalances(chain, pendingTransactions);
  const realWallets = wallets.filter((wallet) => wallet.address !== 'SYSTEM');
  const fundedWallets = realWallets.filter((wallet) => (balances[wallet.address] || 0) > 0);
  const averageHashRate =
    miningHistory.length > 0
      ? miningHistory.reduce((sum, item) => sum + item.hashRate, 0) / miningHistory.length
      : 0;
  const nextStep = (() => {
    if (!validation.valid) {
      return {
        title: 'Inspect the invalid chain',
        message: 'Validation found a problem. Open the Validate page to see which rule failed.',
        label: 'Open Validate',
        page: 'validate',
        tone: 'rose',
      };
    }

    if (realWallets.length === 0) {
      return {
        title: 'Create your first wallet',
        message: 'Start with one normal wallet. It can receive the first mining reward.',
        label: 'Go to Wallets',
        page: 'wallets',
        tone: 'sky',
      };
    }

    if (fundedWallets.length === 0) {
      return {
        title: 'Mine your first reward',
        message: 'Choose your wallet as the miner and mine a reward block from SYSTEM.',
        label: 'Start Mining',
        page: 'mine',
        tone: 'emerald',
      };
    }

    if (realWallets.length < 2) {
      return {
        title: 'Create a second wallet',
        message: 'A second wallet lets you send coins and watch pending transactions become confirmed.',
        label: 'Add Wallet',
        page: 'wallets',
        tone: 'sky',
      };
    }

    if (pendingTransactions.length > 0) {
      return {
        title: 'Confirm pending transactions',
        message: 'Mine a new block to move the pending pool into the blockchain.',
        label: 'Mine Pending',
        page: 'mine',
        tone: 'amber',
      };
    }

    return {
      title: 'Try the tamper demo',
      message: 'Edit an old transaction amount and see validation catch the changed hash.',
      label: 'Open Validate',
      page: 'validate',
      tone: 'slate',
    };
  })();
  const guideTones = {
    slate: 'border-slate-200 bg-white',
    sky: 'border-sky-200 bg-sky-50',
    emerald: 'border-emerald-200 bg-emerald-50',
    amber: 'border-amber-200 bg-amber-50',
    rose: 'border-rose-200 bg-rose-50',
  };

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Watch the simulated chain, mempool, difficulty, and mining performance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('mine')}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Zap className="h-4 w-4" />
          Mine a Block
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Blocks} label="Total blocks" value={formatNumber(chain.length)} />
        <StatCard icon={Wallet} label="Total wallets" value={formatNumber(wallets.length)} />
        <StatCard icon={Send} label="Pending transactions" value={formatNumber(pendingTransactions.length)} />
        <StatCard icon={Gauge} label="Current difficulty" value={difficulty} helper={`${difficulty} leading zeroes`} />
        <StatCard icon={Hash} label="Latest block hash" value={shortHash(latestBlock?.hash, 14, 10)} />
        <StatCard
          icon={CheckCircle2}
          label="Chain validity"
          value={validation.valid ? 'Valid' : 'Invalid'}
          tone={validation.valid ? 'green' : 'red'}
          helper={validation.reason}
        />
        <StatCard
          icon={Activity}
          label="Latest mining result"
          value={
            latestMiningResult
              ? `${formatNumber(latestMiningResult.attempts)} attempts`
              : 'None yet'
          }
          helper={latestMiningResult ? `${formatNumber(latestMiningResult.hashRate)} H/s` : 'Mine a block to start history'}
        />
        <StatCard icon={Zap} label="Average hash rate" value={`${formatNumber(averageHashRate)} H/s`} />
      </div>

      <div className={`mt-6 rounded-lg border p-5 shadow-soft ${guideTones[nextStep.tone]}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Next step</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{nextStep.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{nextStep.message}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(nextStep.page)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {nextStep.label}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
