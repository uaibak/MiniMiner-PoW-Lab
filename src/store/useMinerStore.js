import { create } from 'zustand';
import { addTransaction as validatePendingTransaction, calculateBalances, createInitialSimulation } from '../core/blockchain';
import { mineBlock } from '../core/miner';
import {
  exportSimulation as exportSimulationCore,
  importSimulation as importSimulationCore,
  resetSimulation as resetSimulationCore,
} from '../core/simulation';
import { createRewardTransaction, createTransaction } from '../core/transaction';
import { validateChain } from '../core/validation';
import { createWallet } from '../core/wallet';
import { clearSimulation, loadSimulation, saveSimulation } from '../utils/storage';

const initial = loadSimulation();

function persistable(state) {
  return exportSimulationCore(state);
}

export const useMinerStore = create((set, get) => ({
  ...initial,
  isMining: false,
  miningProgress: null,
  stopRequested: false,
  lastError: '',
  lastMessage: '',

  persist: () => saveSimulation(persistable(get())),

  getBalances: () => calculateBalances(get().chain, get().pendingTransactions),

  createWallet: (name) => {
    const cleanName = String(name || '').trim();
    if (!cleanName) return { ok: false, error: 'Wallet name is required.' };

    const duplicate = get().wallets.some(
      (wallet) => wallet.name.toLowerCase() === cleanName.toLowerCase(),
    );
    if (duplicate) return { ok: false, error: 'A wallet with that name already exists.' };

    const wallet = createWallet(cleanName);
    set((state) => ({ wallets: [...state.wallets, wallet], lastMessage: 'Wallet created.', lastError: '' }));
    get().persist();
    return { ok: true, wallet };
  },

  createTransaction: ({ from, to, amount }) => {
    const transaction = createTransaction(from, to, amount);
    const result = validatePendingTransaction(
      transaction,
      get().wallets,
      get().pendingTransactions,
      get().getBalances(),
    );

    if (!result.ok) {
      set({ lastError: result.error, lastMessage: '' });
      return result;
    }

    set((state) => ({
      pendingTransactions: [...state.pendingTransactions, result.transaction],
      lastMessage: 'Transaction added to pending pool.',
      lastError: '',
    }));
    get().persist();
    return { ok: true, transaction: result.transaction };
  },

  setDifficulty: (difficulty) => {
    set({ difficulty: Number(difficulty) });
    get().persist();
  },

  setMiningReward: (reward) => {
    set({ miningReward: Math.max(1, Number(reward) || 1) });
    get().persist();
  },

  stopMining: () => set({ stopRequested: true }),

  minePendingTransactions: async (minerAddress) => {
    if (get().isMining) {
      return { ok: false, error: 'A mining job is already running.' };
    }

    const miner = get().wallets.find((wallet) => wallet.address === minerAddress);
    if (!miner || miner.address === 'SYSTEM') {
      return { ok: false, error: 'Choose a real wallet to receive the mining reward.' };
    }

    const pendingTransactions = get().pendingTransactions.map((transaction) => ({
      ...transaction,
      status: 'confirmed',
    }));
    const rewardTransaction = createRewardTransaction(minerAddress, get().miningReward);
    const transactions = [...pendingTransactions, rewardTransaction];
    const previousBlock = get().chain[get().chain.length - 1];
    const difficulty = get().difficulty;

    set({
      isMining: true,
      stopRequested: false,
      miningProgress: {
        nonce: 0,
        currentHash: '',
        attempts: 0,
        elapsedMs: 0,
        hashRate: 0,
      },
      lastError: '',
      lastMessage: '',
    });

    const result = await mineBlock(
      {
        transactions,
        previousHash: previousBlock.hash,
        difficulty,
        minerAddress,
        index: previousBlock.index + 1,
      },
      {
        onProgress: (progress) => set({ miningProgress: progress }),
        shouldStop: () => get().stopRequested,
      },
    );

    if (result.stopped) {
      set({
        isMining: false,
        stopRequested: false,
        miningProgress: null,
        latestMiningResult: {
          stopped: true,
          difficulty,
          attempts: result.stats.attempts,
          elapsedMs: result.stats.elapsedMs,
          hashRate: result.stats.hashRate,
          timestamp: new Date().toISOString(),
        },
        lastMessage: 'Mining stopped.',
      });
      get().persist();
      return { ok: false, stopped: true };
    }

    const historyEntry = {
      blockIndex: result.block.index,
      difficulty,
      attempts: result.stats.attempts,
      elapsedMs: result.stats.elapsedMs,
      hashRate: result.stats.hashRate,
      hash: result.block.hash,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      chain: [...state.chain, result.block],
      pendingTransactions: [],
      miningHistory: [historyEntry, ...state.miningHistory].slice(0, 30),
      latestMiningResult: historyEntry,
      isMining: false,
      stopRequested: false,
      miningProgress: null,
      lastMessage: `Block #${result.block.index} mined successfully.`,
      lastError: '',
    }));
    get().persist();
    return { ok: true, block: result.block };
  },

  tamperTransactionAmount: ({ blockIndex, transactionId, amount }) => {
    set((state) => ({
      chain: state.chain.map((block) => {
        if (block.index !== Number(blockIndex)) return block;
        return {
          ...block,
          transactions: block.transactions.map((transaction) =>
            transaction.id === transactionId
              ? { ...transaction, amount: Number(amount) }
              : transaction,
          ),
        };
      }),
      lastMessage: 'Block data was intentionally tampered with.',
      lastError: '',
    }));
    get().persist();
  },

  validate: () => validateChain(get().chain),

  exportSimulation: () => persistable(get()),

  importSimulation: (json) => {
    try {
      const imported = importSimulationCore(json);
      set({
        ...imported,
        isMining: false,
        miningProgress: null,
        stopRequested: false,
        lastMessage: 'Simulation imported.',
        lastError: '',
      });
      get().persist();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message || 'Could not parse simulation JSON.' };
    }
  },

  resetSimulation: () => {
    const fresh = resetSimulationCore();
    clearSimulation();
    set({
      ...fresh,
      isMining: false,
      miningProgress: null,
      stopRequested: false,
      lastError: '',
      lastMessage: 'Simulation reset.',
    });
    saveSimulation(fresh);
  },
}));
