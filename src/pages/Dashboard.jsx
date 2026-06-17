import { Activity, Blocks, CheckCircle2, Gauge, Hash, Send, Wallet, Zap } from 'lucide-react';
import StatCard from '../components/StatCard';
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
  const averageHashRate =
    miningHistory.length > 0
      ? miningHistory.reduce((sum, item) => sum + item.hashRate, 0) / miningHistory.length
      : 0;

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
    </section>
  );
}
