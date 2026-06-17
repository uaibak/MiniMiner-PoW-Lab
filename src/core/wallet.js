export const SYSTEM_WALLET_ADDRESS = 'SYSTEM';

export function createWallet(name) {
  const cleanName = String(name || '').trim();

  return {
    id: crypto.randomUUID(),
    name: cleanName,
    address: `MM-${crypto.randomUUID().replaceAll('-', '').slice(0, 24).toUpperCase()}`,
    balance: 0,
    createdAt: new Date().toISOString(),
  };
}

export function createSystemWallet() {
  return {
    id: 'system-wallet',
    name: 'SYSTEM',
    address: SYSTEM_WALLET_ADDRESS,
    balance: 0,
    createdAt: new Date().toISOString(),
  };
}
