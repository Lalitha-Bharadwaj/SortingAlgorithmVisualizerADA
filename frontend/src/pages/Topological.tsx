import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, Play, RotateCcw, Shuffle, AlertCircle,
  Loader2, GitBranch, CheckCircle2, Pause, SkipForward, SkipBack
} from 'lucide-react';
import { runTopological } from '../services/api';
import type { GraphNode, GraphEdge, TopoResult, TopoTraceStep } from '../types';

const SAMPLE_GRAPH: { nodes: GraphNode[]; edges: GraphEdge[] } = {
  nodes: [
    { id: 'A', label: 'A', x: 120, y: 80 },
    { id: 'B', label: 'B', x: 300, y: 60 },
    { id: 'C', label: 'C', x: 300, y: 180 },
    { id: 'D', label: 'D', x: 480, y: 80 },
    { id: 'E', label: 'E', x: 480, y: 200 },
    { id: 'F', label: 'F', x: 640, y: 130 },
  ],
  edges: [
    { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
    { from: 'B', to: 'D' }, { from: 'C', to: 'E' },
    { from: 'D', to: 'F' }, { from: 'E', to: 'F' },
  ],
};

type NodeColor = 'idle' | 'active' | 'processed' | 'queued';

function nodeColor(id: string, step?: TopoTraceStep): NodeColor {
  if (!step) return 'idle';
  if (step.currentNode === id) return 'active';
  if (step.processed.includes(id)) return 'processed';
  if (step.queue.includes(id)) return 'queued';
  return 'idle';
}

const NODE_COLORS: Record<NodeColor, string> = {
  idle:      '#6366f1',
  active:    '#eab308',
  processed: '#22c55e',
  queued:    '#f97316',
};

export default function Topological() {
  const [nodes, setNodes] = useState<GraphNode[]>(SAMPLE_GRAPH.nodes);
  const [edges, setEdges] = useState<GraphEdge[]>(SAMPLE_GRAPH.edges);
  const [result, setResult] = useState<TopoResult | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [edgeFrom, setEdgeFrom] = useState<string | null>(null);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep: TopoTraceStep | undefined = result?.trace[stepIndex];
  const order = result?.trace.filter(s => s.action === 'dequeue').map(s => s.currentNode) ?? [];

  const stopPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
  }, []);

  const runSort = useCallback(async () => {
    if (nodes.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setStepIndex(-1);
    try {
      const res = await runTopological(nodes.map(n => n.id), edges);
      setResult(res);
      if (res.cyclesDetected) setError(res.errorMessage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Backend connection failed. Ensure Ada server is running on :8080.');
    } finally {
      setLoading(false);
    }
  }, [nodes, edges]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying || !result) return;
    intervalRef.current = setInterval(() => {
      setStepIndex(i => {
        if (i >= result.trace.length - 1) { stopPlay(); return i; }
        return i + 1;
      });
    }, 600);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, result, stopPlay]);

  const addNode = () => {
    const label = newNodeLabel.trim().toUpperCase() || `N${nodes.length + 1}`;
    if (nodes.find(n => n.id === label)) return;
    setNodes(prev => [...prev, { id: label, label, x: 150 + Math.random() * 400, y: 80 + Math.random() * 200 }]);
    setNewNodeLabel('');
    setResult(null);
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    setResult(null);
  };

  const deleteEdge = (from: string, to: string) => {
    setEdges(prev => prev.filter(e => !(e.from === from && e.to === to)));
    setResult(null);
  };

  const handleNodeClick = (id: string) => {
    if (edgeFrom === null) {
      setEdgeFrom(id);
    } else if (edgeFrom === id) {
      setEdgeFrom(null);
    } else {
      const exists = edges.find(e => e.from === edgeFrom && e.to === id);
      if (!exists) {
        setEdges(prev => [...prev, { from: edgeFrom, to: id }]);
        setResult(null);
      }
      setEdgeFrom(null);
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x, y } : n));
  };

  const loadSample = () => {
    setNodes(SAMPLE_GRAPH.nodes);
    setEdges(SAMPLE_GRAPH.edges);
    setResult(null);
    setError(null);
    setStepIndex(-1);
  };

  const reset = () => {
    stopPlay();
    setResult(null);
    setError(null);
    setStepIndex(-1);
  };

  return (
    <div className="space-y-5 animate-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Topological Sort</h1>
        <p className="text-sm text-[rgb(var(--text-secondary))]">
          Build a DAG and visualize Kahn's topological ordering algorithm step-by-step
        </p>
      </div>

      {error && (
        <div className="card p-4 border-red-500/30 bg-red-500/5 flex items-start gap-3">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-4 space-y-3">
            <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Graph Controls</p>
            <div className="flex gap-2">
              <input id="new-node-input" value={newNodeLabel} onChange={e => setNewNodeLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNode()}
                placeholder="Node label" className="input flex-1 text-xs" maxLength={4} />
              <button id="add-node-btn" onClick={addNode} className="btn-icon bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20">
                <Plus size={15} />
              </button>
            </div>
            <p className="text-xs text-[rgb(var(--text-muted))]">
              {edgeFrom
                ? <span className="text-yellow-400">Click another node to connect from <strong>{edgeFrom}</strong></span>
                : 'Click a node to start drawing an edge'}
            </p>
            <div className="flex gap-2">
              <button onClick={loadSample} className="btn-secondary flex-1 text-xs flex items-center justify-center gap-1">
                <Shuffle size={12} /> Sample
              </button>
              <button onClick={() => { setNodes([]); setEdges([]); setResult(null); }} className="btn-secondary flex-1 text-xs flex items-center justify-center gap-1">
                <Trash2 size={12} /> Clear
              </button>
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Nodes ({nodes.length})</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {nodes.map(n => (
                <div key={n.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-[rgb(var(--bg-secondary))]">
                  <span className="font-mono font-medium">{n.id}</span>
                  <button onClick={() => deleteNode(n.id)} className="text-[rgb(var(--text-muted))] hover:text-red-400 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
              {nodes.length === 0 && <p className="text-xs text-[rgb(var(--text-muted))] text-center py-2">No nodes</p>}
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Edges ({edges.length})</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {edges.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-[rgb(var(--bg-secondary))]">
                  <span className="font-mono">{e.from} → {e.to}</span>
                  <button onClick={() => deleteEdge(e.from, e.to)} className="text-[rgb(var(--text-muted))] hover:text-red-400 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
              {edges.length === 0 && <p className="text-xs text-[rgb(var(--text-muted))] text-center py-2">No edges</p>}
            </div>
          </div>

          {/* Playback */}
          <div className="card p-4 space-y-3">
            <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Controls</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setStepIndex(i => Math.max(i - 1, 0))} disabled={!result || stepIndex <= 0} className="btn-icon disabled:opacity-30">
                <SkipBack size={14} />
              </button>
              {isPlaying ? (
                <button onClick={stopPlay} className="btn-primary flex items-center gap-1 text-xs flex-1 justify-center">
                  <Pause size={13} /> Pause
                </button>
              ) : (
                <button onClick={() => { if (!result) runSort(); else setIsPlaying(true); }}
                  disabled={loading} className="btn-primary flex items-center gap-1 text-xs flex-1 justify-center disabled:opacity-50">
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                  {loading ? 'Running…' : result ? 'Play' : 'Run'}
                </button>
              )}
              <button onClick={() => setStepIndex(i => Math.min(i + 1, (result?.trace.length ?? 1) - 1))}
                disabled={!result || stepIndex >= (result?.trace.length ?? 0) - 1} className="btn-icon disabled:opacity-30">
                <SkipForward size={14} />
              </button>
            </div>
            <button onClick={reset} className="btn-ghost w-full text-xs flex items-center justify-center gap-1">
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>

        {/* Main Graph Canvas */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GitBranch size={15} className="text-indigo-400" />
                <span className="font-semibold text-sm">DAG Canvas</span>
              </div>
              {result && (
                <span className="text-xs text-[rgb(var(--text-muted))]">
                  Step {Math.max(0, stepIndex + 1)} / {result.trace.length}
                </span>
              )}
            </div>

            <div className="bg-[rgb(var(--bg-secondary))] rounded-xl overflow-hidden">
              <svg
                ref={svgRef}
                width="100%"
                height="320"
                className="cursor-crosshair select-none"
                onMouseMove={handleSvgMouseMove}
                onMouseUp={() => setDragging(null)}
                onMouseLeave={() => setDragging(null)}
              >
                <defs>
                  <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="rgb(var(--border))" />
                  </marker>
                  <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#eab308" />
                  </marker>
                </defs>

                {/* Edges */}
                {edges.map((edge, i) => {
                  const fromNode = nodes.find(n => n.id === edge.from);
                  const toNode = nodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  const isActive = currentStep?.activeEdge?.from === edge.from && currentStep?.activeEdge?.to === edge.to;
                  const dx = toNode.x - fromNode.x;
                  const dy = toNode.y - fromNode.y;
                  const len = Math.sqrt(dx * dx + dy * dy);
                  const r = 22;
                  const x2 = toNode.x - (dx / len) * r;
                  const y2 = toNode.y - (dy / len) * r;
                  return (
                    <line key={i}
                      x1={fromNode.x} y1={fromNode.y}
                      x2={x2} y2={y2}
                      stroke={isActive ? '#eab308' : 'rgb(var(--border))'}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow)'}
                    />
                  );
                })}

                {/* Nodes */}
                {nodes.map(node => {
                  const nc = nodeColor(node.id, currentStep);
                  const color = NODE_COLORS[nc];
                  const isEdgeStart = edgeFrom === node.id;
                  return (
                    <g key={node.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => !dragging && handleNodeClick(node.id)}
                      onMouseDown={e => {
                        if (!svgRef.current) return;
                        const rect = svgRef.current.getBoundingClientRect();
                        setDragOffset({ x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y });
                        setDragging(node.id);
                        e.stopPropagation();
                      }}
                    >
                      <circle
                        cx={node.x} cy={node.y} r={22}
                        fill={color + '22'}
                        stroke={isEdgeStart ? '#eab308' : color}
                        strokeWidth={isEdgeStart ? 3 : 2}
                      />
                      <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central"
                        fill={color} fontSize={12} fontWeight={700} fontFamily="JetBrains Mono, monospace">
                        {node.label}
                      </text>
                      {currentStep?.indegrees && (
                        <text x={node.x + 18} y={node.y - 16} textAnchor="middle" fill="#94a3b8" fontSize={9}>
                          {currentStep.indegrees[node.id] ?? 0}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Color legend */}
            <div className="flex flex-wrap gap-4 mt-3">
              {Object.entries(NODE_COLORS).map(([state, color]) => (
                <div key={state} className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-secondary))] capitalize">
                  <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: color, backgroundColor: color + '33' }} />
                  {state}
                </div>
              ))}
            </div>
          </div>

          {/* Queue & Processed */}
          {currentStep && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-4">
                <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3">Queue</p>
                <div className="flex flex-wrap gap-2">
                  {currentStep.queue.length === 0
                    ? <span className="text-xs text-[rgb(var(--text-muted))]">Empty</span>
                    : currentStep.queue.map((n, i) => (
                        <span key={i} className="font-mono text-xs px-2 py-1 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30">{n}</span>
                      ))
                  }
                </div>
              </div>
              <div className="card p-4">
                <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3">Processed Order</p>
                <div className="flex flex-wrap gap-2">
                  {currentStep.processed.length === 0
                    ? <span className="text-xs text-[rgb(var(--text-muted))]">None yet</span>
                    : currentStep.processed.map((n, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="font-mono text-xs px-2 py-1 rounded bg-green-500/15 text-green-400 border border-green-500/30">{n}</span>
                          {i < currentStep.processed.length - 1 && <span className="text-[rgb(var(--text-muted))] text-xs">→</span>}
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* Final Result */}
          {result && !result.cyclesDetected && order.length > 0 && stepIndex === result.trace.length - 1 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="card p-4 border-green-500/30 bg-green-500/5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={15} className="text-green-400" />
                <p className="text-sm font-semibold text-green-400">Topological Order Complete</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {order.map((n, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="font-mono text-sm px-3 py-1 rounded-lg bg-green-500/15 text-green-300 border border-green-500/30 font-bold">{n}</span>
                    {i < order.length - 1 && <span className="text-[rgb(var(--text-muted))]">→</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
