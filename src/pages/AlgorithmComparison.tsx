import React, { useState, useMemo } from 'react';
import { Graph } from '../dataStructures/Graph';
import { runBFS } from '../algorithms/bfs';
import { runDFS } from '../algorithms/dfs';
import { ArrowRightLeft, Layers, GitFork, ArrowRight, CheckCircle2, Clock, Cpu } from 'lucide-react';
import { ALGORITHM_COMPLEXITIES } from '../utils/complexity';

interface AlgorithmComparisonProps {
  graph: Graph;
  allNodeIds: string[];
}

export const AlgorithmComparison: React.FC<AlgorithmComparisonProps> = ({
  graph,
  allNodeIds,
}) => {
  const [startNode, setStartNode] = useState(allNodeIds[0] || 'CORP-CORP01');

  const bfsResult = useMemo(() => runBFS(graph, startNode), [graph, startNode]);
  const dfsResult = useMemo(() => runDFS(graph, startNode), [graph, startNode]);

  const bfsInfo = ALGORITHM_COMPLEXITIES.BFS;
  const dfsInfo = ALGORITHM_COMPLEXITIES.DFS;

  return (
    <div className="space-y-5 select-none font-mono">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              ACADEMIC DSA LABORATORY · CO4 ANALYSIS
            </span>
          </div>
          <h2 className="text-base font-bold tracking-wide text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
            <span>BFS VS DFS SYSTEMATIC TRAVERSAL COMPARISON</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans max-w-2xl">
            Side-by-side empirical execution on identical transaction topologies. Compares frontier exploration structures (FIFO Queue vs LIFO Call Stack) without declaring one superior.
          </p>
        </div>

        {/* Start Node Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Root Account:</span>
          <select
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-cyan-400 focus:outline-none cursor-pointer"
          >
            {allNodeIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* BFS Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                BFS
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-100">BREADTH-FIRST SEARCH</h3>
                <span className="text-[10px] text-slate-400">Queue-based Layer-by-Layer Frontier</span>
              </div>
            </div>
            <span className="text-xs font-bold text-cyan-400">O(V + E)</span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Reachable Nodes:</span>
              <span className="text-base font-bold text-slate-100">{bfsResult.traversalOrder.length}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Tree Edges:</span>
              <span className="text-base font-bold text-cyan-400">{bfsResult.treeEdges.length}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Total Steps:</span>
              <span className="text-base font-bold text-slate-100">{bfsResult.steps.length}</span>
            </div>
          </div>

          {/* Traversal Order */}
          <div>
            <span className="text-[10px] uppercase text-slate-400 block mb-1">
              Level-Ordered Traversal Sequence:
            </span>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-1.5 text-xs text-cyan-300 max-h-36 overflow-y-auto">
              {bfsResult.traversalOrder.map((node, i) => (
                <React.Fragment key={i}>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-semibold text-slate-200">
                    {node}
                    <span className="text-[9px] text-cyan-400 ml-1 font-normal">
                      (L{bfsResult.levels[node] ?? 0})
                    </span>
                  </span>
                  {i < bfsResult.traversalOrder.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Academic Profile */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs font-sans">
            <div className="font-semibold text-cyan-400 font-mono text-[11px] uppercase">
              Banking Investigation Strength:
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {bfsInfo.bestUseInBanking}
            </p>
            <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
              Data Structure: FIFO Queue · Memory: O(V) maximum layer width
            </div>
          </div>
        </div>

        {/* DFS Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                DFS
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-100">DEPTH-FIRST SEARCH</h3>
                <span className="text-[10px] text-slate-400">Stack-based Deep Chain Recursion</span>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400">O(V + E)</span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Reachable Nodes:</span>
              <span className="text-base font-bold text-slate-100">{dfsResult.traversalOrder.length}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Max Chain Depth:</span>
              <span className="text-base font-bold text-amber-400">{dfsResult.maxDepth} Hops</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Back Edges:</span>
              <span className="text-base font-bold text-rose-400">{dfsResult.backEdges.length}</span>
            </div>
          </div>

          {/* Traversal Order */}
          <div>
            <span className="text-[10px] uppercase text-slate-400 block mb-1">
              Depth-Ordered Traversal Sequence:
            </span>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-1.5 text-xs text-amber-300 max-h-36 overflow-y-auto">
              {dfsResult.traversalOrder.map((node, i) => (
                <React.Fragment key={i}>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-semibold text-slate-200">
                    {node}
                  </span>
                  {i < dfsResult.traversalOrder.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Academic Profile */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs font-sans">
            <div className="font-semibold text-amber-400 font-mono text-[11px] uppercase">
              Banking Investigation Strength:
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {dfsInfo.bestUseInBanking}
            </p>
            <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
              Data Structure: LIFO Stack · Memory: O(V) maximum recursion depth
            </div>
          </div>
        </div>
      </div>

      {/* Academic Synthesis & Trade-Offs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 font-sans text-xs">
        <h3 className="font-mono font-bold text-slate-200 uppercase text-xs">
          Academic Algorithmic Trade-Off Matrix (CO4 Evaluation)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
              <tr>
                <th className="py-2 px-3">Evaluation Metric</th>
                <th className="py-2 px-3 text-cyan-400">Breadth-First Search (BFS)</th>
                <th className="py-2 px-3 text-amber-400">Depth-First Search (DFS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-300">
              <tr>
                <td className="py-2 px-3 font-bold text-slate-200">Frontier Data Structure</td>
                <td className="py-2 px-3 text-cyan-300">Queue (First-In, First-Out)</td>
                <td className="py-2 px-3 text-amber-300">Call Stack (Last-In, First-Out)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-200">Shortest Unweighted Path</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">Guaranteed by level ordering</td>
                <td className="py-2 px-3 text-slate-400">Not guaranteed (explores arbitrary branch)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-200">Cycle / Back-Edge Proof</td>
                <td className="py-2 px-3 text-slate-400">Cross-edges require parent tracking</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">Natural back-edge discovery in active stack</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-200">Anti-Money Laundering Use Case</td>
                <td className="py-2 px-3">Blast radius & smurfing fan-out dispersal</td>
                <td className="py-2 px-3">Multi-hop mule layering chains to cash-out hubs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
