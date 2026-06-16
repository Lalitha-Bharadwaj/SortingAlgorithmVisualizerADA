export type AlgorithmId =
  | 'bubble'
  | 'selection'
  | 'insertion'
  | 'quick'
  | 'merge'
  | 'heap'
  | 'topological';

export type ActionKind =
  | 'compare'
  | 'swap'
  | 'set'
  | 'pivot'
  | 'merge'
  | 'sorted';

export interface TraceStep {
  step: number;
  action: ActionKind;
  indices: number[];
  array: number[];
}

export interface SortResult {
  algorithm: string;
  comparisonsCount: number;
  swapsCount: number;
  operationCount: number;
  executionTime: number;
  trace: TraceStep[];
}

export type DatasetType = 'random' | 'nearly-sorted' | 'reverse-sorted' | 'duplicates';

export interface BenchmarkEntry {
  algorithm: string;
  comparisonsCount: number;
  swapsCount: number;
  operationCount: number;
  executionTime: number;
}

// Topological Graph types
export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface TopoTraceStep {
  step: number;
  action: string;
  currentNode: string;
  activeEdge: { from: string; to: string };
  queue: string[];
  processed: string[];
  indegrees: Record<string, number>;
}

export interface TopoResult {
  cyclesDetected: boolean;
  errorMessage: string;
  executionTime: number;
  operationsCount: number;
  trace: TopoTraceStep[];
}

export interface AlgorithmInfo {
  id: AlgorithmId;
  name: string;
  description: string;
  bestCase: string;
  averageCase: string;
  worstCase: string;
  spaceComplexity: string;
  stable: boolean;
  inPlace: boolean;
  color: string;
  bgColor: string;
}
