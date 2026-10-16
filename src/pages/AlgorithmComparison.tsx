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
  const [startNode, setStartNode] = useState(allNodeIds[0] || '');

  React.useEffect(() => {
    if (allNodeIds.length > 0 && !allNodeIds.includes(startNode)) {
      setStartNode(allNodeIds[0]);
    } else if (allNodeIds.length === 0) {
      setStartNode('');
    }
  }, [allNodeIds, startNode]);


  const bfsResult = useMemo(() => runBFS(graph, startNode), [graph, startNode]);
  const dfsResult = useMemo(() => runDFS(graph, startNode), [graph, startNode]);

  const bfsInfo = ALGORITHM_COMPLEXITIES.BFS;
  const dfsInfo = ALGORITHM_COMPLEXITIES.DFS;

  return (
    <div className="space-y-5 select-none font-mono">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              ACADEMIC DSA LABORATORY · CO4 ANALYSIS
            </span>
          </div>
          <h2 className="text-base font-bold tracking-wide text-slate-900 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            <span>BFS VS DFS SYSTEMATIC TRAVERSAL COMPARISON</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-sans max-w-2xl">
            Side-by-side empirical execution on identical transaction topologies. Compares frontier exploration structures (FIFO Queue vs LIFO Call Stack) without declaring one superior.
          </p>
        </div>

        {/* Start Node Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">Root Account:</span>
          <select
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-blue-700 font-bold focus:outline-none cursor-pointer"
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
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                BFS
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">BREADTH-FIRST SEARCH</h3>
                <span className="text-[10px] text-slate-500">Queue-based Layer-by-Layer Frontier</span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-700">O(V + E)</span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Reachable Nodes:</span>
              <span className="text-base font-bold text-slate-900">{bfsResult.traversalOrder.length}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Tree Edges:</span>
              <span className="text-base font-bold text-blue-700">{bfsResult.treeEdges.length}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Total Steps:</span>
              <span className="text-base font-bold text-slate-900">{bfsResult.steps.length}</span>
            </div>
          </div>

          {/* Traversal Order */}
          <div>
            <span className="text-[10px] uppercase text-slate-500 block mb-1">
              Level-Ordered Traversal Sequence:
            </span>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-1.5 text-xs text-blue-900 max-h-36 overflow-y-auto">
              {bfsResult.traversalOrder.map((node, i) => (
                <React.Fragment key={i}>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-800 shadow-xs">
                    {node}
                    <span className="text-[9px] text-blue-600 ml-1 font-normal">
                      (L{bfsResult.levels[node] ?? 0})
                    </span>
                  </span>
                  {i < bfsResult.traversalOrder.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Academic Profile */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-sans">
            <div className="font-semibold text-blue-700 font-mono text-[11px] uppercase">
              Banking Investigation Strength:
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {bfsInfo.bestUseInBanking}
            </p>
            <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200">
              Data Structure: FIFO Queue · Memory: O(V) maximum layer width
            </div>
          </div>
        </div>

        {/* DFS Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                DFS
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">DEPTH-FIRST SEARCH</h3>
                <span className="text-[10px] text-slate-500">Stack-based Deep Chain Recursion</span>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800">O(V + E)</span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Reachable Nodes:</span>
              <span className="text-base font-bold text-slate-900">{dfsResult.traversalOrder.length}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Max Chain Depth:</span>
              <span className="text-base font-bold text-amber-800">{dfsResult.maxDepth} Hops</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Back Edges:</span>
              <span className="text-base font-bold text-rose-600">{dfsResult.backEdges.length}</span>
            </div>
          </div>

          {/* Traversal Order */}
          <div>
            <span className="text-[10px] uppercase text-slate-500 block mb-1">
              Depth-Ordered Traversal Sequence:
            </span>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-1.5 text-xs text-amber-900 max-h-36 overflow-y-auto">
              {dfsResult.traversalOrder.map((node, i) => (
                <React.Fragment key={i}>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-800 shadow-xs">
                    {node}
                  </span>
                  {i < dfsResult.traversalOrder.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Academic Profile */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-sans">
            <div className="font-semibold text-amber-800 font-mono text-[11px] uppercase">
              Banking Investigation Strength:
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {dfsInfo.bestUseInBanking}
            </p>
            <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200">
              Data Structure: LIFO Stack · Memory: O(V) maximum recursion depth
            </div>
          </div>
        </div>
      </div>

      {/* Academic Synthesis & Trade-Offs Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 font-sans text-xs">
        <h3 className="font-mono font-bold text-slate-800 uppercase text-xs">
          Academic Algorithmic Trade-Off Matrix (CO4 Evaluation)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Evaluation Metric</th>
                <th className="py-2.5 px-3 text-blue-700">Breadth-First Search (BFS)</th>
                <th className="py-2.5 px-3 text-amber-800">Depth-First Search (DFS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Frontier Data Structure</td>
                <td className="py-2.5 px-3 text-blue-700">Queue (First-In, First-Out)</td>
                <td className="py-2.5 px-3 text-amber-800">Call Stack (Last-In, First-Out)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Shortest Unweighted Path</td>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">Guaranteed by level ordering</td>
                <td className="py-2.5 px-3 text-slate-500">Not guaranteed (explores arbitrary branch)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Cycle / Back-Edge Proof</td>
                <td className="py-2.5 px-3 text-slate-500">Cross-edges require parent tracking</td>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">Natural back-edge discovery in active stack</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Anti-Money Laundering Use Case</td>
                <td className="py-2.5 px-3">Blast radius & smurfing fan-out dispersal</td>
                <td className="py-2.5 px-3">Multi-hop mule layering chains to cash-out hubs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
