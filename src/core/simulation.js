import { createInitialSimulation } from './blockchain';

export function exportSimulation(state) {
  return {
    chain: state.chain,
    wallets: state.wallets,
    pendingTransactions: state.pendingTransactions,
    difficulty: state.difficulty,
    miningReward: state.miningReward,
    miningHistory: state.miningHistory,
    latestMiningResult: state.latestMiningResult,
  };
}

export function importSimulation(json) {
  const parsed = typeof json === 'string' ? JSON.parse(json) : json;

  if (!parsed || !Array.isArray(parsed.chain) || !Array.isArray(parsed.wallets)) {
    throw new Error('Import file is missing chain or wallets data.');
  }

  return {
    ...createInitialSimulation(),
    ...parsed,
  };
}

export function resetSimulation() {
  return createInitialSimulation();
}
