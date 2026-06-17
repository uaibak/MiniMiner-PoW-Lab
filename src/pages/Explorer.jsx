import BlockCard from '../components/BlockCard';
import { useMinerStore } from '../store/useMinerStore';

export default function Explorer() {
  const chain = useMinerStore((state) => state.chain);

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-normal text-slate-950">Blockchain Explorer</h1>
      <p className="mt-2 text-slate-600">Inspect every block, hash, nonce, miner, transaction, and mining statistic.</p>

      <div className="mt-6 grid gap-4">
        {chain.map((block) => (
          <BlockCard key={block.index} block={block} />
        ))}
      </div>
    </section>
  );
}
