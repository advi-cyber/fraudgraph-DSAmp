import React from 'react';
import { Route, ArrowRight, Table, AlertCircle, FileDown, Layers, Hash } from 'lucide-react';
import { DijkstraResult, BFSShortestPathResult } from '../types/algorithm';
import { formatINR } from '../utils/currency';
import { exportPathReportCSV } from '../services/csvExport';

interface PathAnalysisCardProps {
  dijkstraResult?: DijkstraResult | null;
  bfsPathResult?: BFSShortestPathResult | null;
}

export const PathAnalysisCard: React.FC<PathAnalysisCardProps> = ({
  dijkstraResult,
  bfsPathResult,
}) => {
  const isBFS = !!bfsPathResult;
  const source = bfsPathResult ? bfsPathResult.source : dijkstraResult?.source || '';
  const target = bfsPathResult ? bfsPathResult.target : dijkstraResult?.target || '';
  const path = bfsPathResult ? bfsPathResult.shortestPath : dijkstraResult?.shortestPath || [];
  const cost = bfsPathResult ? bfsPathResult.totalWeight : dijkstraResult?.totalWeight || 0;
  const isIdentical = source && target && source === target;
  const hasPath = path.length > 0;
  const hopCount = hasPath ? (isIdentical ? 0 : path.length - 1) : 0;
  const algorithmName = isBFS ? 'Breadth-First Search (Unweighted Min-Hops)' : "Dijkstra's Algorithm (Weighted Min-Cost)";

  const handleExport = () => {
    exportPathReportCSV(source, target, path, cost, hopCount, algorithmName);
  };

  return (
    <div className="bg-white border border-slate-800 rounded-xl p-4 shadow-sm space-y-4 select-none font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-100">
              Shortest Route Analysis
            </h4>
            <p className="text-[11px] text-slate-400 font-sans">
              Method: <span className="font-mono text-cyan-400 font-bold">{isBFS ? 'Min Hops (BFS)' : 'Min Cost (Dijkstra)'}</span>
            </p>
          </div>
        </div>

        {hasPath && (
          <button
            onClick={handleExport}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-200 border border-slate-700 cursor-pointer transition-colors"
            title="Download Route CSV"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Origin / Destination & Metrics Banner */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-700">
          <span className="text-[10px] text-slate-400 uppercase block">Route Origin:</span>
          <span className="font-bold text-slate-100 truncate block">{source}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-700">
          <span className="text-[10px] text-slate-400 uppercase block">Destination:</span>
          <span className="font-bold text-slate-100 truncate block">{target}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-700">
          <span className="text-[10px] text-slate-400 uppercase block">Total Hop Count:</span>
          <span className="font-bold text-cyan-400 text-sm">
            {hasPath ? `${hopCount} hop${hopCount === 1 ? '' : 's'}` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Path Sequence */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">
            Selected Route Sequence:
          </span>
          {hasPath && (
            <span className="text-[10px] font-bold text-emerald-400">
              Total Route Volume: {cost === Infinity ? 'Unweighted' : formatINR(cost)}
            </span>
          )}
        </div>

        {hasPath ? (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-700 flex flex-wrap items-center gap-1.5 text-xs text-cyan-400">
            {path.map((node, idx) => (
              <React.Fragment key={idx}>
                <span className="px-2 py-1 rounded bg-white border border-slate-700 font-bold text-slate-100 shadow-xs">
                  {node}
                </span>
                {idx < path.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-amber-950 border border-amber-800 text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {target
                ? `No directed transaction route exists between [${source}] and [${target}]. Accounts are in disconnected components.`
                : 'Select both source and target accounts to compute route.'}
            </span>
          </div>
        )}
      </div>

      {/* Educational Distinction Box */}
      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-800 text-[10px] font-sans text-slate-400 space-y-1">
        <div className="font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
          <Hash className="w-3.5 h-3.5 text-cyan-400" />
          <span>Minimum Hops vs Minimum Financial Cost</span>
        </div>
        <p className="leading-relaxed">
          <strong>BFS (Unweighted)</strong> guarantees the minimal number of intermediary accounts (useful for spotting immediate layering chains), while <strong>Dijkstra (Weighted)</strong> calculates the path minimizing transaction amount friction.
        </p>
      </div>

      {/* Distance Table Snapshot if Dijkstra */}
      {dijkstraResult && dijkstraResult.distances && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Table className="w-3.5 h-3.5 text-slate-400" />
              <span>Dijkstra Tentative Distance Table:</span>
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-700 text-[11px]">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 sticky top-0 border-b border-slate-700 text-[10px] uppercase">
                <tr>
                  <th className="py-1 px-3">Account</th>
                  <th className="py-1 px-3">Minimum Distance</th>
                  <th className="py-1 px-3">Predecessor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-white text-slate-200">
                {Object.keys(dijkstraResult.distances)
                  .filter((id) => dijkstraResult.distances[id] !== Infinity)
                  .slice(0, 6)
                  .map((id) => (
                    <tr key={id} className="hover:bg-slate-50">
                      <td className="py-1 px-3 font-semibold text-slate-100">{id}</td>
                      <td className="py-1 px-3 text-cyan-400 font-bold">
                        {formatINR(dijkstraResult.distances[id])}
                      </td>
                      <td className="py-1 px-3 text-slate-400">
                        {dijkstraResult.predecessors[id] || 'None (Source)'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
