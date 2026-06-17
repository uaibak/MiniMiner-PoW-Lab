import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { runBenchmark as runBenchmarkCore } from '../core/miner';
import { formatNumber } from '../utils/format';

export default function Benchmark() {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);

  async function runBenchmark() {
    setRunning(true);
    setResults([]);
    await runBenchmarkCore(setResults);
    setRunning(false);
  }

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">Benchmark</h1>
          <p className="mt-2 text-slate-600">Mine dummy blocks at difficulty 2, 3, 4, and 5 to compare performance.</p>
        </div>
        <button
          type="button"
          onClick={runBenchmark}
          disabled={running}
          className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {running ? 'Running...' : 'Run Benchmark'}
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="h-72">
          {results.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="difficulty" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hashRate" name="Hashes per second" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              Benchmark results will appear here.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3">Difficulty</th>
              <th className="px-4 py-3">Attempts</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Hashes/sec</th>
            </tr>
          </thead>
          <tbody>
            {results.length ? (
              results.map((result) => (
                <tr key={result.difficulty} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-semibold">{result.difficulty}</td>
                  <td className="px-4 py-3">{formatNumber(result.attempts)}</td>
                  <td className="px-4 py-3">{formatNumber(result.timeSeconds, 2)}s</td>
                  <td className="px-4 py-3">{formatNumber(result.hashRate)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-5 text-slate-500" colSpan="4">
                  No benchmark has been run yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
