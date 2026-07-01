import { useRef, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import { useMinerStore } from '../store/useMinerStore';
import { downloadJson } from '../utils/format';

export default function Settings() {
  const difficulty = useMinerStore((state) => state.difficulty);
  const miningReward = useMinerStore((state) => state.miningReward);
  const setDifficulty = useMinerStore((state) => state.setDifficulty);
  const setMiningReward = useMinerStore((state) => state.setMiningReward);
  const exportSimulation = useMinerStore((state) => state.exportSimulation);
  const importSimulation = useMinerStore((state) => state.importSimulation);
  const resetSimulation = useMinerStore((state) => state.resetSimulation);
  const [message, setMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const fileRef = useRef(null);

  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = importSimulation(text);
    setMessage(result.ok ? 'Simulation imported.' : result.error);
    event.target.value = '';
  }

  function confirmReset() {
    resetSimulation();
    setMessage('Simulation reset.');
    setConfirmOpen(false);
    setConfirmText('');
  }

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-normal text-slate-950">Settings</h1>
      <p className="mt-2 text-slate-600">Tune the simulator, export/import JSON, or reset everything.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-950">Difficulty</h2>
          <p className="mt-2 text-sm text-slate-600">
            Higher difficulty means more required leading zeroes and more hash attempts.
          </p>
          <input
            type="range"
            min="1"
            max="5"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            className="mt-5 w-full"
          />
          <div className="mt-2 flex justify-between text-sm text-slate-500">
            <span>1</span>
            <span className="font-semibold text-slate-950">{difficulty}</span>
            <span>5</span>
          </div>
          {difficulty >= 5 ? (
            <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
              Difficulty 5 can take much longer, especially on mobile browsers.
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-950">Mining Reward</h2>
          <p className="mt-2 text-sm text-slate-600">
            Reward transactions are minted from SYSTEM when a block is mined.
          </p>
          <label className="mt-5 block">
            <span className="text-sm font-medium text-slate-700">Reward amount</span>
            <input
              type="number"
              min="1"
              value={miningReward}
              onChange={(event) => setMiningReward(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft lg:col-span-2">
          <h2 className="text-xl font-semibold text-slate-950">Simulation Data</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => downloadJson('miniminer-simulation.json', exportSimulation())}
              className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Import JSON
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Open Reset Options
            </button>
          </div>
          <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
          {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
        </div>

        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 shadow-soft lg:col-span-2">
          <h2 className="text-xl font-semibold text-rose-950">Danger Zone</h2>
          <p className="mt-2 text-sm text-rose-900">
            Resetting removes all wallets, mined blocks, pending transactions, benchmark history, and imported data.
          </p>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="mt-4 rounded-md bg-rose-700 px-4 py-2 font-semibold text-white hover:bg-rose-800"
          >
            Reset Simulation
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Reset simulation?"
        message="This clears the full local simulation and returns the app to the genesis state."
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
