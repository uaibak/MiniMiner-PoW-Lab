import { calculateHash } from './block';
import { createRewardTransaction } from './transaction';
import { mineBlockWithWasm } from '../wasm/minerWasm';

const DEFAULT_BATCH_SIZE = 10000;

function yieldToBrowser() {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export async function mineBlock(input, callbacks = {}) {
  if (input.engine !== 'javascript') {
    try {
      return await mineBlockWithWasm(input, callbacks);
    } catch {
      if (input.engine === 'wasm') {
        throw new Error('C++ WebAssembly miner is not available. Run npm run wasm:build first.');
      }
    }
  }

  const {
    transactions,
    previousHash,
    difficulty,
    minerAddress,
    index = 1,
    batchSize = DEFAULT_BATCH_SIZE,
    timestamp = new Date().toISOString(),
  } = input;

  const target = '0'.repeat(Number(difficulty));
  const startedAt = performance.now();
  let attempts = 0;
  let nonce = 0;
  let currentHash = '';

  const block = {
    index,
    timestamp,
    transactions,
    previousHash,
    nonce,
    hash: '',
    difficulty: Number(difficulty),
    minerAddress,
    miningStats: null,
  };

  while (true) {
    if (callbacks.shouldStop?.()) {
      const elapsedMs = performance.now() - startedAt;
      return {
        stopped: true,
        block: null,
        stats: {
          attempts,
          elapsedMs,
          hashRate: elapsedMs > 0 ? attempts / (elapsedMs / 1000) : 0,
          stopped: true,
          engine: 'javascript',
        },
      };
    }

    for (let i = 0; i < batchSize; i += 1) {
      block.nonce = nonce;
      currentHash = calculateHash(block);
      attempts += 1;

      if (currentHash.startsWith(target)) {
        const elapsedMs = performance.now() - startedAt;
        const miningStats = {
          attempts,
          elapsedMs,
          hashRate: elapsedMs > 0 ? attempts / (elapsedMs / 1000) : attempts,
          stopped: false,
          engine: 'javascript',
        };

        return {
          stopped: false,
          block: {
            ...block,
            hash: currentHash,
            miningStats,
          },
          stats: miningStats,
        };
      }

      nonce += 1;
    }

    const elapsedMs = performance.now() - startedAt;
    callbacks.onProgress?.({
      nonce,
      currentHash,
      attempts,
      elapsedMs,
      hashRate: elapsedMs > 0 ? attempts / (elapsedMs / 1000) : 0,
      engine: 'javascript',
    });

    await yieldToBrowser();
  }
}

export async function runBenchmark(onResult) {
  const results = [];

  for (const difficulty of [2, 3, 4, 5]) {
    const result = await mineBlock({
      transactions: [createRewardTransaction('BENCHMARK', 1)],
      previousHash: 'benchmark',
      difficulty,
      minerAddress: 'BENCHMARK',
      index: difficulty,
      batchSize: 15000,
    });

    const entry = {
      difficulty,
      attempts: result.stats.attempts,
      timeSeconds: result.stats.elapsedMs / 1000,
      hashRate: result.stats.hashRate,
    };

    results.push(entry);
    onResult?.([...results]);
  }

  return results;
}
