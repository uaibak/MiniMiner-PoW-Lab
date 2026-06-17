import { createInitialSimulation } from '../core/blockchain';

export const STORAGE_KEY = 'miniminer-pow-lab';

export function loadSimulation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialSimulation();
    return { ...createInitialSimulation(), ...JSON.parse(raw) };
  } catch {
    return createInitialSimulation();
  }
}

export function saveSimulation(state) {
  const serializable = {
    chain: state.chain,
    wallets: state.wallets,
    pendingTransactions: state.pendingTransactions,
    difficulty: state.difficulty,
    miningReward: state.miningReward,
    miningHistory: state.miningHistory,
    latestMiningResult: state.latestMiningResult,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

export function clearSimulation() {
  localStorage.removeItem(STORAGE_KEY);
}
