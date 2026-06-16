import type { SortResult, TopoResult, DatasetType } from '../types';
import { API_BASE } from '../constants';

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function runSort(
  algorithm: string,
  array: number[]
): Promise<SortResult> {
  return postJson<SortResult>(`/api/sort/${algorithm}`, { array });
}

export async function runTopological(
  nodes: string[],
  edges: { from: string; to: string }[]
): Promise<TopoResult> {
  return postJson<TopoResult>('/api/topological', { nodes, edges });
}

// Client-side dataset generation (no backend needed)
export function generateArray(
  size: number,
  type: DatasetType
): number[] {
  const max = Math.max(size * 3, 100);

  switch (type) {
    case 'random':
      return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1);

    case 'nearly-sorted': {
      const arr = Array.from({ length: size }, (_, i) => i + 1);
      const swapCount = Math.max(1, Math.floor(size * 0.08));
      for (let i = 0; i < swapCount; i++) {
        const a = Math.floor(Math.random() * size);
        const b = Math.floor(Math.random() * size);
        [arr[a], arr[b]] = [arr[b], arr[a]];
      }
      return arr;
    }

    case 'reverse-sorted':
      return Array.from({ length: size }, (_, i) => size - i);

    case 'duplicates': {
      const palette = Array.from({ length: Math.max(3, Math.floor(size / 4)) }, () =>
        Math.floor(Math.random() * max) + 1
      );
      return Array.from({ length: size }, () => palette[Math.floor(Math.random() * palette.length)]);
    }

    default:
      return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1);
  }
}

// Run all sorting algorithms concurrently for benchmark
export async function runBenchmark(
  array: number[]
): Promise<SortResult[]> {
  const algos = ['bubble', 'selection', 'insertion', 'quick', 'merge', 'heap'];
  const results = await Promise.allSettled(
    algos.map(algo => runSort(algo, array))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<SortResult> => r.status === 'fulfilled')
    .map(r => r.value);
}
