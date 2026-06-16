import { motion } from 'framer-motion';
import { ALGORITHMS } from '../constants';

const TABLE_HEADERS = ['Algorithm', 'Best Case', 'Average Case', 'Worst Case', 'Space', 'Stable', 'In-Place'];

const DESCRIPTIONS: Record<string, string> = {
  bubble: `Bubble Sort is the simplest comparison-based algorithm. It repeatedly scans the array and swaps adjacent elements if they are out of order. After each full pass, the largest unsorted element "bubbles" to its correct position at the end. While easy to understand, its O(n²) average complexity makes it impractical for large datasets. However, it achieves O(n) on already-sorted input with an early-exit optimization.`,
  selection: `Selection Sort divides the array into a sorted and an unsorted region. Each iteration finds the minimum element in the unsorted region and swaps it into the sorted region. Unlike Bubble Sort, it performs at most n−1 swaps, making it useful when writes are expensive. Its quadratic time complexity makes it inefficient for large inputs and it is not stable.`,
  insertion: `Insertion Sort builds the sorted array one element at a time. For each element, it scans backward through the sorted region and shifts elements until it finds the correct insertion point. It is adaptive (efficient on nearly-sorted data), stable, and in-place. It is the preferred algorithm for small datasets or nearly-sorted arrays and is used in hybrid algorithms like TimSort.`,
  quick: `Quick Sort is a highly efficient divide-and-conquer algorithm. It selects a pivot element and partitions the array so all smaller elements come before the pivot and larger ones after. The same process is applied recursively to the sub-arrays. With good pivot selection, it averages O(n log n) but degrades to O(n²) on worst-case inputs. It is cache-efficient and widely used in practice.`,
  merge: `Merge Sort uses a divide-and-conquer strategy. It recursively splits the array in half, sorts each half, then merges them back together. It guarantees O(n log n) in all cases and is stable, making it ideal for sorting linked lists and external sorting. Its trade-off is O(n) auxiliary space for the merge operation.`,
  heap: `Heap Sort uses a binary max-heap to sort. It first builds a max-heap from the input, then repeatedly extracts the maximum element and places it at the end of the array. This process reduces the heap size by one each time. Heap Sort is in-place with O(1) space and always O(n log n), but it is not stable and has poor cache performance due to non-sequential memory access patterns.`,
  topological: `Topological Sort (Kahn's Algorithm) linearly orders the vertices of a Directed Acyclic Graph (DAG) such that for every directed edge u→v, vertex u comes before v. Kahn's algorithm works by repeatedly removing vertices with no incoming edges (indegree = 0) from a queue and updating neighbors' indegrees. If a cycle exists, not all vertices can be processed — this enables cycle detection. Time complexity is O(V+E) where V = vertices and E = edges.`,
};

export default function Complexity() {
  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Complexity Analysis</h1>
        <p className="text-sm text-[rgb(var(--text-secondary))]">
          Comprehensive Big-O complexity comparison with educational explanations
        </p>
      </div>

      {/* Comparison Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))]">
                {TABLE_HEADERS.map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALGORITHMS.map((algo, i) => (
                <motion.tr
                  key={algo.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-secondary))] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${algo.bgColor} shrink-0`} />
                      <span className="font-medium">{algo.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-green-400">{algo.bestCase}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-yellow-400">{algo.averageCase}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-red-400">{algo.worstCase}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-[rgb(var(--text-secondary))]">{algo.spaceComplexity}</span>
                  </td>
                  <td className="px-4 py-3">
                    {algo.stable
                      ? <span className="badge badge-green">Yes</span>
                      : <span className="badge badge-red">No</span>}
                  </td>
                  <td className="px-4 py-3">
                    {algo.inPlace
                      ? <span className="badge badge-blue">Yes</span>
                      : <span className="badge badge-yellow">No</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-[rgb(var(--text-secondary))]">
        <div className="flex items-center gap-1.5"><span className="font-mono text-green-400">Green</span> = Best case</div>
        <div className="flex items-center gap-1.5"><span className="font-mono text-yellow-400">Yellow</span> = Average case</div>
        <div className="flex items-center gap-1.5"><span className="font-mono text-red-400">Red</span> = Worst case</div>
      </div>

      {/* Individual explanations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Algorithm Explanations</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ALGORITHMS.map((algo, i) => (
            <motion.div
              key={algo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${algo.bgColor}`} />
                  <h3 className="font-semibold">{algo.name}</h3>
                </div>
                <div className="flex gap-1">
                  {algo.stable && <span className="badge badge-green">Stable</span>}
                  {algo.inPlace && <span className="badge badge-blue">In-Place</span>}
                </div>
              </div>

              <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed mb-4">
                {DESCRIPTIONS[algo.id]}
              </p>

              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-[rgb(var(--bg-secondary))] rounded-lg p-2">
                <div>
                  <p className="text-[rgb(var(--text-muted))] mb-0.5">Best</p>
                  <p className="font-mono font-semibold text-green-400">{algo.bestCase}</p>
                </div>
                <div className="border-x border-[rgb(var(--border))]">
                  <p className="text-[rgb(var(--text-muted))] mb-0.5">Average</p>
                  <p className="font-mono font-semibold text-yellow-400">{algo.averageCase}</p>
                </div>
                <div>
                  <p className="text-[rgb(var(--text-muted))] mb-0.5">Worst</p>
                  <p className="font-mono font-semibold text-red-400">{algo.worstCase}</p>
                </div>
                <div className="border-l border-[rgb(var(--border))]">
                  <p className="text-[rgb(var(--text-muted))] mb-0.5">Space</p>
                  <p className="font-mono font-semibold text-[rgb(var(--text-secondary))]">{algo.spaceComplexity}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
