import { describe, expect, it } from 'vitest';
import { calculateHash } from '../block';
import { addTransaction, calculateBalances, createInitialSimulation } from '../blockchain';
import { mineBlock } from '../miner';
import { createRewardTransaction, createTransaction } from '../transaction';
import { validateChain } from '../validation';
import { createWallet } from '../wallet';

describe('blockchain core', () => {
  it('creates a valid genesis chain', () => {
    const simulation = createInitialSimulation();
    const result = validateChain(simulation.chain);

    expect(simulation.chain).toHaveLength(1);
    expect(simulation.chain[0].index).toBe(0);
    expect(result.valid).toBe(true);
  });

  it('mines a JavaScript block with a reward transaction', async () => {
    const miner = createWallet('Miner');
    const reward = createRewardTransaction(miner.address, 50);
    const previousBlock = createInitialSimulation().chain[0];

    const result = await mineBlock({
      engine: 'javascript',
      transactions: [reward],
      previousHash: previousBlock.hash,
      difficulty: 1,
      minerAddress: miner.address,
      index: 1,
      batchSize: 250,
      timestamp: '2026-01-01T00:00:00.000Z',
    });

    expect(result.stopped).toBe(false);
    expect(result.block.hash.startsWith('0')).toBe(true);
    expect(result.block.miningStats.engine).toBe('javascript');
    expect(validateChain([previousBlock, result.block]).valid).toBe(true);
  });

  it('derives balances from confirmed transactions', async () => {
    const miner = createWallet('Miner');
    const receiver = createWallet('Receiver');
    const previousBlock = createInitialSimulation().chain[0];
    const reward = createRewardTransaction(miner.address, 50);
    const payment = createTransaction(miner.address, receiver.address, 12, 'confirmed');

    const result = await mineBlock({
      engine: 'javascript',
      transactions: [reward, payment],
      previousHash: previousBlock.hash,
      difficulty: 1,
      minerAddress: miner.address,
      index: 1,
      batchSize: 250,
      timestamp: '2026-01-01T00:00:00.000Z',
    });

    const balances = calculateBalances([previousBlock, result.block]);

    expect(balances[miner.address]).toBe(38);
    expect(balances[receiver.address]).toBe(12);
  });

  it('rejects transactions that exceed available balance including pending outgoing spend', () => {
    const sender = createWallet('Sender');
    const receiver = createWallet('Receiver');
    const balances = { [sender.address]: 50 };
    const pending = [createTransaction(sender.address, receiver.address, 30)];
    const transaction = createTransaction(sender.address, receiver.address, 25);

    const result = addTransaction(transaction, [sender, receiver], pending, balances);

    expect(result.ok).toBe(false);
    expect(result.error).toContain('enough available balance');
  });

  it('detects tampering when a confirmed transaction amount changes', async () => {
    const miner = createWallet('Miner');
    const previousBlock = createInitialSimulation().chain[0];
    const reward = createRewardTransaction(miner.address, 50);

    const result = await mineBlock({
      engine: 'javascript',
      transactions: [reward],
      previousHash: previousBlock.hash,
      difficulty: 1,
      minerAddress: miner.address,
      index: 1,
      batchSize: 250,
      timestamp: '2026-01-01T00:00:00.000Z',
    });
    const tamperedBlock = {
      ...result.block,
      transactions: [{ ...result.block.transactions[0], amount: 500 }],
    };

    const validation = validateChain([previousBlock, tamperedBlock]);

    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain('tampered');
    expect(calculateHash(tamperedBlock)).not.toBe(result.block.hash);
  });

  it('detects confirmed transactions that make balances negative', async () => {
    const sender = createWallet('Sender');
    const receiver = createWallet('Receiver');
    const previousBlock = createInitialSimulation().chain[0];
    const invalidPayment = createTransaction(sender.address, receiver.address, 10, 'confirmed');

    const result = await mineBlock({
      engine: 'javascript',
      transactions: [invalidPayment],
      previousHash: previousBlock.hash,
      difficulty: 1,
      minerAddress: receiver.address,
      index: 1,
      batchSize: 250,
      timestamp: '2026-01-01T00:00:00.000Z',
    });

    const validation = validateChain([previousBlock, result.block]);

    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain('negative');
  });
});
