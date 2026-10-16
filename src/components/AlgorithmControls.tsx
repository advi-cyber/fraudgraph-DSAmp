import React, { useState } from 'react';
import { Play, RefreshCw, Route, GitCommit, Search, Sparkles, Compass } from 'lucide-react';
import { AlgorithmType } from '../types/algorithm';

interface AlgorithmControlsProps {
  allNodeIds: string[];
  onRunBFS: (startNode: string) => void;
  onRunDFS: (startNode: string) => void;
  onRunCycles: () => void;
  onRunDijkstra: (sourceNode: string, targetNode: string) => void;
  onRunBFSShortestPath?: (sourceNode: string, targetNode: string) => void;
  onRunSCC: () => void;
  onAnalyzeAccount: (accountId: string) => void;
  onResetHighlights?: () => void;
  activeAlgorithm?: AlgorithmType | null;
}

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  allNodeIds,
  onRunBFS,
  onRunDFS,
  onRunCycles,
  onRunDijkstra,
  onRunBFSShortestPath,
  onRunSCC,
  onAnalyzeAccount,
  onResetHighlights,
  activeAlgorithm,
}) => {
  const [selectedStart, setSelectedStart] = useState<string>(allNodeIds[0] || '');
  const [selectedTarget, setSelectedTarget] = useState<string>(
    allNodeIds[Math.min(3, allNodeIds.length - 1)] || ''
  );
  const [selectedInvestigate, setSelectedInvestigate] = useState<string>(allNodeIds[0] || '');
  const [shortestPathMode, setShortestPathMode] = useState<'HOPS' | 'COST'>('HOPS');

  // Keep state updated if nodeIds change
  React.useEffect(() => {
    if (allNodeIds.length > 0) {
      if (!allNodeIds.includes(selectedStart)) setSelectedStart(allNodeIds[0]);
      if (!allNodeIds.includes(selectedTarget)) {
        setSelectedTarget(allNodeIds[Math.min(3, allNodeIds.length - 1)] || allNodeIds[0]);
      }
      if (!allNodeIds.includes(selectedInvestigate)) setSelectedInvestigate(allNodeIds[0]);
    }
  }, [allNodeIds, selectedStart, selectedTarget, selectedInvestigate]);

  const handleExecuteShortestPath = () => {
    if (shortestPathMode === 'HOPS' && onRunBFSShortestPath) {
      onRunBFSShortestPath(selectedStart, selectedTarget);
    } else {
      onRunDijkstra(selectedStart, selectedTarget);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 select-none">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-800 font-mono">
            DSA Algorithm Laboratory
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {onResetHighlights && (
            <button
              onClick={onResetHighlights}
              title="Clear active highlights on canvas"
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
            Manual DSA
          </span>
        </div>
      </div>

      {/* Traversal Selector & Trigger */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-700 block font-mono">
          Frontier Exploration Root Account:
        </label>
        <select
          value={selectedStart}
          onChange={(e) => setSelectedStart(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
        >
          {allNodeIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
          <button
            onClick={() => onRunBFS(selectedStart)}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeAlgorithm === 'BFS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>Run BFS</span>
            <span className="text-[9px] opacity-70">Queue O(V+E)</span>
          </button>

          <button
            onClick={() => onRunDFS(selectedStart)}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeAlgorithm === 'DFS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>Run DFS</span>
            <span className="text-[9px] opacity-70">Stack O(V+E)</span>
          </button>
        </div>
      </div>

      {/* Anomaly & Ring Detection */}
      <div className="pt-2 border-t border-slate-200 space-y-2">
        <div className="grid grid-cols-2 gap-2 font-mono">
          <button
            onClick={onRunCycles}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeAlgorithm === 'CYCLE_DETECTION'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Detect Cycles</span>
          </button>

          <button
            onClick={onRunSCC}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeAlgorithm === 'SCC'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Tarjan SCC</span>
          </button>
        </div>
      </div>

      {/* Shortest Path Investigation (BFS Hops vs Dijkstra Cost) */}
      <div className="pt-2 border-t border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-700 block font-mono">
            Shortest-Path Route:
          </label>
          <div className="flex items-center gap-1 text-[10px] font-mono bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setShortestPathMode('HOPS')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                shortestPathMode === 'HOPS'
                  ? 'bg-white text-blue-700 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Min Hops (BFS)
            </button>
            <button
              onClick={() => setShortestPathMode('COST')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                shortestPathMode === 'COST'
                  ? 'bg-white text-blue-700 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Min Cost (Dijkstra)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono">
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">Source:</span>
            <select
              value={selectedStart}
              onChange={(e) => setSelectedStart(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white"
            >
              {allNodeIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">Destination:</span>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white"
            >
              {allNodeIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleExecuteShortestPath}
          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer font-mono ${
            activeAlgorithm === 'DIJKSTRA' || (activeAlgorithm === 'BFS' && shortestPathMode === 'HOPS')
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          <span>
            Trace Route ({shortestPathMode === 'HOPS' ? 'Unweighted Minimum Hops' : 'Weighted Dijkstra'})
          </span>
        </button>
      </div>

      {/* Account Deep Investigation Trigger */}
      <div className="pt-2 border-t border-slate-200 space-y-2">
        <label className="text-[11px] font-semibold text-slate-700 block font-mono">
          Target Account Forensic Audit:
        </label>
        <div className="flex gap-2 font-mono">
          <select
            value={selectedInvestigate}
            onChange={(e) => setSelectedInvestigate(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:bg-white"
          >
            {allNodeIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>

          <button
            onClick={() => onAnalyzeAccount(selectedInvestigate)}
            className="py-2 px-3.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-blue-600" />
            <span>Audit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
