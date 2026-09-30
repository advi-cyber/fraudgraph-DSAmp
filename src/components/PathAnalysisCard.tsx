import React from 'react';
import { Route, ArrowRight, Table, CheckCircle2, AlertCircle } from 'lucide-react';
import { DijkstraResult } from '../types/algorithm';
import { formatINR } from '../utils/currency';

interface PathAnalysisCardProps {
  result: DijkstraResult;
}

export const PathAnalysisCard: React.FC<PathAnalysisCardProps> = ({ result }) => {
  const hasPath = result.shortestPath && result.shortestPath.length > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200">
              Shortest Transaction Path (Dijkstra)
            </h4>
            <p className="text-[11px] text-slate-400">
              Source: <span className="font-mono text-cyan-400 font-bold">{result.source}</span>
              {result.target && (
                <>
                  {' '}→ Target: <span className="font-mono text-cyan-400 font-bold">{result.target}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-mono font-bold text-cyan-400">
            {result.totalWeight === Infinity ? 'Unreachable' : formatINR(result.totalWeight)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Complexity: {result.timeComplexity}
          </span>
        </div>
      </div>

      {/* Path Sequence */}
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
          Minimum Friction Path:
        </span>
        {hasPath ? (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-1.5 font-mono text-xs text-cyan-300">
            {result.shortestPath.map((node, idx) => (
              <React.Fragment key={idx}>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 font-bold text-slate-100">
                  {node}
                </span>
                {idx < result.shortestPath.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {result.target
                ? `No directed transaction path exists from [${result.source}] to [${result.target}].`
                : 'Select both source and target accounts to compute the minimum cost path.'}
            </span>
          </div>
        )}
      </div>

      {/* Distance Table Snapshot */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Table className="w-3.5 h-3.5 text-slate-400" />
            <span>Relaxed Distance Table (Sample Reachable):</span>
          </span>
        </div>

        <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-800 font-mono text-[11px]">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800 text-[10px] uppercase">
              <tr>
                <th className="py-1.5 px-3">Account</th>
                <th className="py-1.5 px-3">Tentative Distance</th>
                <th className="py-1.5 px-3">Predecessor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 text-slate-300">
              {Object.keys(result.distances)
                .filter((id) => result.distances[id] !== Infinity)
                .slice(0, 8)
                .map((id) => (
                  <tr key={id} className="hover:bg-slate-800/40">
                    <td className="py-1 px-3 font-semibold text-slate-200">{id}</td>
                    <td className="py-1 px-3 text-cyan-400">{formatINR(result.distances[id])}</td>
                    <td className="py-1 px-3 text-slate-400">{result.predecessors[id] || '— (Source)'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
