import { CheckCircle2, ListChecks, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { calculateHash } from '../core/block';
import { SYSTEM_ADDRESS } from '../core/transaction';
import { useMinerStore } from '../store/useMinerStore';
import { shortHash } from '../utils/format';

function buildValidationChecks(chain, validation) {
  const genesisExists = Array.isArray(chain) && chain.length > 0;
  const genesisWellFormed = genesisExists && chain[0].index === 0 && chain[0].previousHash === '0';
  const hashesMatch = genesisExists && chain.every((block) => block.hash === calculateHash(block));
  const difficultySatisfied =
    genesisExists &&
    chain.every((block) => block.hash.startsWith('0'.repeat(Number(block.difficulty))));
  const previousHashesLinked =
    genesisExists &&
    chain.every((block, index) => index === 0 || block.previousHash === chain[index - 1].hash);
  const transactionsValid =
    genesisExists &&
    chain.every((block) =>
      block.transactions.every((transaction) => {
        const amount = Number(transaction.amount);
        return transaction.id && transaction.from && transaction.to && Number.isFinite(amount) && amount > 0;
      }),
    );
  const balancesSafe = validation.valid || !validation.reason.toLowerCase().includes('negative');

  return [
    { label: 'Genesis block exists', ok: genesisExists },
    { label: 'Genesis block is well formed', ok: genesisWellFormed },
    { label: 'Block hashes match block contents', ok: hashesMatch },
    { label: 'Hashes satisfy recorded difficulty', ok: difficultySatisfied },
    { label: 'Previous hash links are connected', ok: previousHashesLinked },
    { label: 'Transactions have valid fields and amounts', ok: transactionsValid },
    { label: 'Confirmed balances do not go negative', ok: balancesSafe },
  ];
}

export default function Validate() {
  const chain = useMinerStore((state) => state.chain);
  const validate = useMinerStore((state) => state.validate);
  const tamperTransactionAmount = useMinerStore((state) => state.tamperTransactionAmount);
  const resetSimulation = useMinerStore((state) => state.resetSimulation);
  const validation = validate();
  const validationChecks = useMemo(
    () => buildValidationChecks(chain, validation),
    [chain, validation.valid, validation.reason],
  );
  const tamperableTransactions = useMemo(
    () =>
      chain
        .filter((block) => block.index > 0 && block.transactions.length)
        .flatMap((block) =>
          block.transactions.map((transaction) => ({
            blockIndex: block.index,
            transaction,
          })),
        ),
    [chain],
  );
  const [target, setTarget] = useState('');
  const [amount, setAmount] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const selectedTamperTarget = tamperableTransactions.find(
    ({ blockIndex, transaction }) => `${blockIndex}:${transaction.id}` === target,
  );

  function handleTamper(event) {
    event.preventDefault();
    const [blockIndex, transactionId] = target.split(':');
    tamperTransactionAmount({ blockIndex, transactionId, amount });
  }

  function confirmReset() {
    resetSimulation();
    setConfirmOpen(false);
    setConfirmText('');
  }

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-normal text-slate-950">Validate & Tamper Demo</h1>
      <p className="mt-2 text-slate-600">
        Validate hashes, previous-hash links, difficulty, transaction amounts, and balance safety.
      </p>

      <div
        className={`mt-6 rounded-lg border p-5 shadow-soft ${
          validation.valid ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
        }`}
      >
        <div className="flex items-start gap-3">
          {validation.valid ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-700" />
          ) : (
            <ShieldAlert className="h-6 w-6 text-rose-700" />
          )}
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              {validation.valid ? 'Blockchain is valid' : 'Blockchain is invalid'}
            </h2>
            <p className="mt-1 text-slate-700">
              {validation.reason}
              {validation.blockIndex !== null ? ` Block #${validation.blockIndex}.` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-slate-700" />
          <h2 className="text-xl font-semibold text-slate-950">Validation Checklist</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {validationChecks.map((check) => (
            <div
              key={check.label}
              className={`flex items-center gap-2 rounded-md p-3 text-sm font-medium ${
                check.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
              }`}
            >
              {check.ok ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
              {check.label}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleTamper} className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-soft md:grid-cols-3">
        <label className="md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Transaction to edit</span>
          <select
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          >
            <option value="">Choose a confirmed transaction</option>
            {tamperableTransactions.map(({ blockIndex, transaction }) => (
              <option key={`${blockIndex}:${transaction.id}`} value={`${blockIndex}:${transaction.id}`}>
                Block #{blockIndex} · {transaction.from === SYSTEM_ADDRESS ? 'SYSTEM reward' : shortHash(transaction.from, 8, 4)} to {shortHash(transaction.to, 8, 4)} · {transaction.amount}
              </option>
            ))}
          </select>
          {selectedTamperTarget ? (
            <p className="mt-2 text-xs text-slate-500">
              Editing block #{selectedTamperTarget.blockIndex} transaction {shortHash(selectedTamperTarget.transaction.id, 10, 6)} will make the stored hash invalid.
            </p>
          ) : null}
        </label>
        <label>
          <span className="text-sm font-medium text-slate-700">New amount</span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            min="0"
            step="0.0001"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <div className="flex flex-col gap-3 md:col-span-3 sm:flex-row">
          <button
            type="submit"
            disabled={!tamperableTransactions.length}
            className="rounded-md bg-rose-700 px-4 py-2 font-semibold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Tamper With Block Data
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
          >
            Reset Simulation
          </button>
        </div>
      </form>

      {!tamperableTransactions.length ? (
        <div className="mt-4">
          <EmptyState
            icon={ShieldAlert}
            title="No confirmed transactions to tamper with"
            message="Mine at least one block first. The tamper demo edits confirmed block data so validation can catch the changed hash."
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Reset simulation?"
        message="This clears wallets, blocks, pending transactions, mining history, and settings. This cannot be undone."
        confirmLabel="Reset Simulation"
        confirmationText="RESET"
        typedValue={confirmText}
        onTypedValueChange={setConfirmText}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmText('');
        }}
        onConfirm={confirmReset}
      />
    </section>
  );
}
