export const SYSTEM_ADDRESS = 'SYSTEM';

export function createTransaction(from, to, amount, status = 'pending') {
  return {
    id: crypto.randomUUID(),
    from,
    to,
    amount: Number(amount),
    timestamp: new Date().toISOString(),
    status,
  };
}

export function createRewardTransaction(to, amount) {
  return {
    id: crypto.randomUUID(),
    from: SYSTEM_ADDRESS,
    to,
    amount: Number(amount),
    timestamp: new Date().toISOString(),
    status: 'confirmed',
  };
}
