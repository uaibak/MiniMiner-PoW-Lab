import { calculateHash } from './block';
import { SYSTEM_ADDRESS } from './transaction';

export function validateBlock(block, previousBlock) {
  if (!block) {
    return { valid: false, reason: 'Block is missing.', blockIndex: null };
  }

  const recalculatedHash = calculateHash(block);
  if (block.hash !== recalculatedHash) {
    return {
      valid: false,
      reason: 'Block hash does not match its contents. The block may have been tampered with.',
      blockIndex: block.index,
    };
  }

  if (!block.hash.startsWith('0'.repeat(Number(block.difficulty)))) {
    return {
      valid: false,
      reason: 'Block hash does not satisfy its recorded difficulty.',
      blockIndex: block.index,
    };
  }

  if (previousBlock && block.previousHash !== previousBlock.hash) {
    return {
      valid: false,
      reason: 'Block previousHash does not match the previous block hash.',
      blockIndex: block.index,
    };
  }

  return { valid: true, reason: 'Block is valid.', blockIndex: block.index };
}

export function validateChain(chain) {
  if (!Array.isArray(chain) || chain.length === 0) {
    return { valid: false, reason: 'Genesis block is missing.', blockIndex: null };
  }

  if (chain[0].index !== 0 || chain[0].previousHash !== '0') {
    return {
      valid: false,
      reason: 'Genesis block is malformed.',
      blockIndex: 0,
    };
  }

  const balances = {};

  for (let i = 0; i < chain.length; i += 1) {
    const block = chain[i];
    const previousBlock = i > 0 ? chain[i - 1] : null;
    const blockResult = validateBlock(block, previousBlock);

    if (!blockResult.valid) {
      return blockResult;
    }

    for (const transaction of block.transactions || []) {
      const amount = Number(transaction.amount);

      if (!transaction.id || !transaction.from || !transaction.to) {
        return {
          valid: false,
          reason: 'A transaction is missing a required field.',
          blockIndex: block.index,
        };
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        return {
          valid: false,
          reason: 'A transaction contains a non-positive amount.',
          blockIndex: block.index,
        };
      }

      if (transaction.from !== SYSTEM_ADDRESS) {
        balances[transaction.from] = (balances[transaction.from] || 0) - amount;
        if (balances[transaction.from] < -0.0000001) {
          return {
            valid: false,
            reason: 'A confirmed transaction makes a wallet balance negative.',
            blockIndex: block.index,
          };
        }
      }

      balances[transaction.to] = (balances[transaction.to] || 0) + amount;
    }
  }

  return { valid: true, reason: 'Blockchain is valid.', blockIndex: null };
}
