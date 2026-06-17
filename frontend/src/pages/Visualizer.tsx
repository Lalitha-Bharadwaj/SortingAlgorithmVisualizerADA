import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play, Pause, RotateCcw, SkipForward, SkipBack,
  Shuffle, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { SortBars } from '../components/SortBars';
import { ALGORITHMS, BAR_COLORS } from '../constants';
import { runSort, generateArray } from '../services/api';
import type { SortResult, TraceStep, AlgorithmId, DatasetType } from '../types';

const ALGO_OPTIONS = ALGORITHMS.filter(a => a.id !== 'topological');
const SPEED_MAP: Record<number, number> = { 1: 800, 2: 400, 3: 150, 4: 50, 5: 10 };

export default function Visualizer() {
  const [params, setParams] = useSearchParams();
  const [algoId, setAlgoId] = useState<AlgorithmId>((params.get('algo') as AlgorithmId) || 'bubble');
  const [arraySize, setArraySize] = useState(40);
  const [speed, setSpeed] = useState(3);
  const [dataType, setDataType] = useState<DatasetType>('random');
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const [array, setArray] = useState<number[]>(() => generateArray(40, 'random'));
  const [result, setResult] = useState<SortResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const algoInfo = ALGORITHMS.find(a => a.id === algoId)!;

  const currentStep: TraceStep | undefined = result?.trace[currentStepIndex];
  const displayArray = currentStep ? currentStep.array : array;
  const maxValue = Math.max(...displayArray, 1);

  // Compute the set of indices that are permanently sorted up to the current step
  const sortedIndices = useMemo(() => {
    const s = new Set<number>();
    if (!result) return s;
    // If we've reached the last step, all bars are sorted
    if (currentStepIndex >= result.trace.length - 1 && result.trace.length > 0) {
      for (let i = 0; i < displayArray.length; i++) s.add(i);
      return s;
    }
    for (let i = 0; i <= currentStepIndex; i++) {
      const step = result.trace[i];
      if (step.action === 'sorted') {
        step.indices.forEach(idx => s.add(idx));
      } else if (step.action === 'swap' || step.action === 'set' || step.action === 'merge') {
        // These actions move elements — remove them from sorted if they were marked
        step.indices.forEach(idx => s.delete(idx));
      }
    }
    return s;
  }, [result, currentStepIndex, displayArray.length]);

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const generateNew = useCallback(() => {
    stopPlayback();
    setResult(null);
    setCurrentStepIndex(-1);
    setError(null);
    if (showCustom && customInput.trim()) {
      const parsed = customInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      setArray(parsed.length > 0 ? parsed : generateArray(arraySize, dataType));
    } else {
      setArray(generateArray(arraySize, dataType));
    }
  }, [arraySize, dataType, showCustom, customInput, stopPlayback]);

  const fetchSort = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
    try {
      const res = await runSort(algoId, array);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Backend connection failed. Make sure the Ada server is running on port 8080.');
    } finally {
      setLoading(false);
    }
  }, [algoId, array]);

  const play = useCallback(() => {
    if (!result) { fetchSort(); return; }
    if (currentStepIndex >= result.trace.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [result, currentStepIndex, fetchSort]);

  const pause = useCallback(() => stopPlayback(), [stopPlayback]);

  const reset = useCallback(() => {
    stopPlayback();
    setCurrentStepIndex(-1);
    setResult(null);
  }, [stopPlayback]);

  const stepForward = useCallback(() => {
    if (!result) return;
    setCurrentStepIndex(i => Math.min(i + 1, result.trace.length - 1));
  }, [result]);

  const stepBackward = useCallback(() => {
    setCurrentStepIndex(i => Math.max(i - 1, 0));
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || !result) return;
    intervalRef.current = setInterval(() => {
      setCurrentStepIndex(i => {
        if (i >= result.trace.length - 1) {
          stopPlayback();
          return i;
        }
        return i + 1;
      });
    }, SPEED_MAP[speed]);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, result, speed, stopPlayback]);

  // Sync URL param
  useEffect(() => {
    setParams({ algo: algoId }, { replace: true });
  }, [algoId, setParams]);

  const progressPct = result
    ? Math.round(((currentStepIndex + 1) / result.trace.length) * 100)
    : 0;

  return (
    <div className="space-y-5 animate-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Sort Visualizer</h1>
        <p className="text-sm text-[rgb(var(--text-secondary))]">Step through sorting algorithms with animated bar visualization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Controls Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Algorithm Select */}
          <div className="card p-4 space-y-3">
            <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Algorithm</p>
            <div className="space-y-1">
              {ALGO_OPTIONS.map(a => (
                <button
                  key={a.id}
                  onClick={() => { setAlgoId(a.id as AlgorithmId); reset(); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${algoId === a.id ? 'bg-indigo-500/15 text-indigo-400 font-medium' : 'hover:bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-secondary))]'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${a.bgColor}`} />
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          {/* Config */}
          <div className="card p-4 space-y-4">
            <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Configuration</p>
            <div>
              <label className="text-xs text-[rgb(var(--text-secondary))] mb-1.5 block">Array Size: {arraySize}</label>
              <input id="array-size-slider" type="range" min={5} max={150} value={arraySize}
                onChange={e => setArraySize(+e.target.value)}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-[rgb(var(--text-secondary))] mb-1.5 block">Speed: {['Slow','Slow-Med','Medium','Fast','Very Fast'][speed-1]}</label>
              <input id="speed-slider" type="range" min={1} max={5} value={speed}
                onChange={e => setSpeed(+e.target.value)}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-[rgb(var(--text-secondary))] mb-1.5 block">Data Type</label>
              <select id="data-type-select" value={dataType} onChange={e => setDataType(e.target.value as DatasetType)}
                className="input w-full text-xs"
              >
                <option value="random">Random</option>
                <option value="nearly-sorted">Nearly Sorted</option>
                <option value="reverse-sorted">Reverse Sorted</option>
                <option value="duplicates">Duplicate Heavy</option>
              </select>
            </div>
            <button
              onClick={() => setShowCustom(s => !s)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <ChevronRight size={12} className={`transition-transform ${showCustom ? 'rotate-90' : ''}`} />
              Custom Input
            </button>
            {showCustom && (
              <input
                id="custom-array-input"
                type="text"
                placeholder="e.g. 5,2,9,1,7"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                className="input w-full text-xs font-mono"
              />
            )}
            <button onClick={generateNew} className="btn-secondary w-full text-xs flex items-center justify-center gap-2">
              <Shuffle size={13} /> Generate New
            </button>
          </div>
        </div>

        {/* Main Visualization */}
        <div className="lg:col-span-3 space-y-4">
          {/* Canvas */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${algoInfo.bgColor}`} />
                <span className="font-semibold text-sm">{algoInfo.name}</span>
                {currentStep && (
                  <span className="badge badge-blue capitalize">{currentStep.action}</span>
                )}
              </div>
              {result && (
                <span className="text-xs text-[rgb(var(--text-muted))]">
                  Step {Math.max(0, currentStepIndex + 1)} / {result.trace.length}
                </span>
              )}
            </div>

            {/* Bars */}
            <div className="bg-[rgb(var(--bg-secondary))] rounded-xl overflow-hidden">
              <SortBars array={displayArray} currentStep={currentStep} maxValue={maxValue} sortedIndices={sortedIndices} />
            </div>

            {/* Progress bar */}
            {result && (
              <div className="mt-3">
                <div className="h-1 bg-[rgb(var(--bg-secondary))] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-500 rounded-full"
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="card p-4 border-red-500/30 bg-red-500/5 flex items-start gap-3">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Playback Controls */}
          <div className="card p-4">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button id="step-backward-btn" onClick={stepBackward} disabled={!result || currentStepIndex <= 0} className="btn-icon disabled:opacity-30">
                <SkipBack size={16} />
              </button>
              {isPlaying ? (
                <button id="pause-btn" onClick={pause} className="btn-primary flex items-center gap-2">
                  <Pause size={16} /> Pause
                </button>
              ) : (
                <button id="play-btn" onClick={play} disabled={loading}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  {loading ? 'Loading…' : result ? 'Play' : 'Run Sort'}
                </button>
              )}
              <button id="step-forward-btn" onClick={stepForward} disabled={!result || currentStepIndex >= (result.trace.length - 1)} className="btn-icon disabled:opacity-30">
                <SkipForward size={16} />
              </button>
              <button id="reset-btn" onClick={reset} disabled={!result} className="btn-ghost flex items-center gap-2 disabled:opacity-30">
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          </div>

          {/* Stats */}
          {result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Comparisons', value: result.comparisonsCount },
                { label: 'Swaps',       value: result.swapsCount },
                { label: 'Operations',  value: result.operationCount },
                { label: 'Time (ms)',   value: result.executionTime.toFixed(3) },
              ].map(({ label, value }) => (
                <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="stat-card">
                  <p className="text-lg font-bold font-mono">{value}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{label}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Color Legend */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3">Color Legend</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(BAR_COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-secondary))] capitalize">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                  {key}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
