import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Zap, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { runBenchmark, generateArray } from '../services/api';
import type { SortResult, DatasetType } from '../types';
import { ALGORITHMS } from '../constants';

const ALGO_COLORS: Record<string, string> = {
  'Bubble Sort':    '#6366f1',
  'Selection Sort': '#f97316',
  'Insertion Sort': '#22c55e',
  'Quick Sort':     '#a855f7',
  'Merge Sort':     '#06b6d4',
  'Heap Sort':      '#f43f5e',
};

const DATASET_SIZES = [10, 50, 100, 200, 500];

export default function Performance() {
  const [dataType, setDataType] = useState<DatasetType>('random');
  const [size, setSize] = useState(100);
  const [results, setResults] = useState<SortResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'time' | 'comparisons' | 'swaps' | 'ops'>('time');

  const runBench = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const arr = generateArray(size, dataType);
      const res = await runBenchmark(arr);
      setResults(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Benchmark failed. Ensure Ada server is running on port 8080.');
    } finally {
      setLoading(false);
    }
  }, [size, dataType]);

  const chartData = results.map(r => ({
    name: r.algorithm.replace(' Sort', ''),
    time: parseFloat(r.executionTime.toFixed(4)),
    comparisons: r.comparisonsCount,
    swaps: r.swapsCount,
    ops: r.operationCount,
  }));

  const tabConfig = {
    time:        { label: 'Execution Time (ms)', key: 'time'        as const, color: '#6366f1' },
    comparisons: { label: 'Comparisons',          key: 'comparisons' as const, color: '#eab308' },
    swaps:       { label: 'Swaps',                key: 'swaps'       as const, color: '#ef4444' },
    ops:         { label: 'Total Operations',     key: 'ops'         as const, color: '#22c55e' },
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Performance Benchmark</h1>
        <p className="text-sm text-[rgb(var(--text-secondary))]">
          Compare all sorting algorithms on identical datasets with real Ada backend execution
        </p>
      </div>

      {/* Config Panel */}
      <div className="card p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-secondary))] block mb-1.5">Dataset Type</label>
            <select id="bench-dataset-type" value={dataType} onChange={e => setDataType(e.target.value as DatasetType)}
              className="input text-sm">
              <option value="random">Random</option>
              <option value="nearly-sorted">Nearly Sorted</option>
              <option value="reverse-sorted">Reverse Sorted</option>
              <option value="duplicates">Duplicate Heavy</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-secondary))] block mb-1.5">Dataset Size</label>
            <select id="bench-dataset-size" value={size} onChange={e => setSize(+e.target.value)}
              className="input text-sm">
              {DATASET_SIZES.map(s => (
                <option key={s} value={s}>{s} elements</option>
              ))}
            </select>
          </div>
          <button
            id="run-benchmark-btn"
            onClick={runBench}
            disabled={loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Running…</>
              : <><Zap size={15} /> Run Benchmark</>
            }
          </button>
          {results.length > 0 && (
            <button onClick={runBench} className="btn-secondary flex items-center gap-2">
              <RefreshCw size={14} /> Re-run
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="card p-4 border-red-500/30 bg-red-500/5 flex items-start gap-3">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Stats Table */}
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))]">
                  {['Algorithm','Time (ms)','Comparisons','Swaps','Operations'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const fastest = results.reduce((a, b) => a.executionTime < b.executionTime ? a : b);
                  const isFastest = r.algorithm === fastest.algorithm;
                  return (
                    <motion.tr key={r.algorithm}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ALGO_COLORS[r.algorithm] ?? '#6366f1' }} />
                          <span className="font-medium">{r.algorithm}</span>
                          {isFastest && <span className="badge badge-green text-[10px]">Fastest</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-indigo-400">{r.executionTime.toFixed(4)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-yellow-400">{r.comparisonsCount.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-xs text-red-400">{r.swapsCount.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-xs text-green-400">{r.operationCount.toLocaleString()}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="space-y-4">

          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 bg-[rgb(var(--bg-secondary))] rounded-lg w-fit">
            {Object.entries(tabConfig).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setTab(key as typeof tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  tab === key
                    ? 'bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] shadow-sm'
                    : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))]'
                }`}
              >
                {label.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4">{tabConfig[tab].label} — Bar Chart</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border)/0.5)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--bg-card))',
                    border: '1px solid rgb(var(--border))',
                    borderRadius: '8px',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: 'rgb(var(--text-primary))' }}
                />
                <Bar dataKey={tabConfig[tab].key} fill={tabConfig[tab].color} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Multi-line overlay chart */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4">All Metrics — Line Comparison</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,127,127,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--bg-card))',
                    border: '1px solid rgb(var(--border))',
                    borderRadius: '8px',
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="comparisons" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} name="Comparisons" />
                <Line type="monotone" dataKey="swaps" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Swaps" />
                <Line type="monotone" dataKey="ops" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Operations" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {results.length === 0 && !loading && !error && (
        <div className="card p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--bg-secondary))] flex items-center justify-center">
            <Zap size={28} className="text-[rgb(var(--text-muted))]" />
          </div>
          <div>
            <p className="font-semibold mb-1">No benchmark data yet</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">Configure your dataset and click Run Benchmark to compare algorithms</p>
          </div>
          <button onClick={runBench} className="btn-primary flex items-center gap-2">
            <Zap size={15} /> Run Benchmark
          </button>
        </div>
      )}
    </div>
  );
}
