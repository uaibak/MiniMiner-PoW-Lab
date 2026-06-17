import { createGenesisBlock } from './block';
import { SYSTEM_ADDRESS } from './transaction';
import { createSystemWallet } from './wallet';

export const DEFAULT_DIFFICULTY = 4;
export const DEFAULT_REWARD = 50;

export function createInitialSimulation() {
  return {
    chain: [createGenesisBlock()],
    wallets: [createSystemWallet()],
    pendingTransactions: [],
    difficulty: DEFAULT_DIFFICULTY,
    miningReward: DEFAULT_REWARD,
    miningHistory: [],
    latestMiningResult: null,
  };
}

export function addTransaction(transaction, wallets, pendingTransactions, balances) {
  const sender = wallets.find((wallet) => wallet.address === transaction.from);
  const receiver = wallets.find((wallet) => wallet.address === transaction.to);

  if (!sender) {
    return { ok: false, error: 'Sender wallet does not exist.' };
  }

  if (!receiver) {
    return { ok: false, error: 'Receiver wallet does not exist.' };
  }

  if (transaction.from === transaction.to) {
    return { ok: false, error: 'Sender and receiver must be different wallets.' };
  }

  if (!Number.isFinite(transaction.amount) || transaction.amount <= 0) {
    return { ok: false, error: 'Amount must be a positive number.' };
  }

  if (transaction.from === SYSTEM_ADDRESS) {
    return { ok: false, error: 'Only mining rewards can be sent from SYSTEM.' };
  }

  const pendingOutgoing = pendingTransactions
    .filter((pending) => pending.from === transaction.from)
    .reduce((sum, pending) => sum + Number(pending.amount), 0);
  const availableBalance = (balances[transaction.from] || 0) - pendingOutgoing;

  if (availableBalance < transaction.amount) {
    return { ok: false, error: 'Sender does not have enough available balance.' };
  }

  return { ok: true, transaction };
}

export function calculateBalances(chain, pendingTransactions = []) {
  const balances = {};

  for (const block of chain) {
    for (const transaction of block.transactions || []) {
      const amount = Number(transaction.amount);
      if (!Number.isFinite(amount)) continue;

      if (transaction.from && transaction.from !== SYSTEM_ADDRESS) {
        balances[transaction.from] = (balances[transaction.from] || 0) - amount;
      }

      if (transaction.to) {
        balances[transaction.to] = (balances[transaction.to] || 0) + amount;
      }
    }
  }

  for (const transaction of pendingTransactions) {
    const amount = Number(transaction.amount);
    if (!Number.isFinite(amount) || transaction.from === SYSTEM_ADDRESS) continue;
    balances[`${transaction.from}:available`] =
      (balances[transaction.from] || 0) -
      pendingTransactions
        .filter((pending) => pending.from === transaction.from)
        .reduce((sum, pending) => sum + Number(pending.amount || 0), 0);
  }

  return balances;
}
