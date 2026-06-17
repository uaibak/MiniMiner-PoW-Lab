import { sha256, stableStringify } from './hash';

export function blockPayload(block) {
  return {
    index: block.index,
    timestamp: block.timestamp,
    transactions: block.transactions,
    previousHash: block.previousHash,
    difficulty: block.difficulty,
    minerAddress: block.minerAddress,
  };
}

export function calculateHash(block) {
  return sha256(`${stableStringify(blockPayload(block))}:${block.nonce}`);
}

export function createGenesisBlock() {
  const block = {
    index: 0,
    timestamp: new Date().toISOString(),
    transactions: [],
    previousHash: '0',
    nonce: 0,
    hash: '',
    difficulty: 0,
    minerAddress: 'SYSTEM',
    miningStats: {
      attempts: 1,
      elapsedMs: 0,
      hashRate: 0,
      stopped: false,
    },
  };

  block.hash = calculateHash(block);
  return block;
}
