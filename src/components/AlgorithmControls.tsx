import React, { useState } from 'react';
import { Play, RefreshCw, Route, GitCommit, Search, ShieldCheck } from 'lucide-react';
import { AlgorithmType } from '../types/algorithm';

interface AlgorithmControlsProps {
  allNodeIds: string[];
  onRunBFS: (startNode: string) => void;
  onRunDFS: (startNode: string) => void;
  onRunCycles: () => void;
  onRunDijkstra: (sourceNode: string, targetNode: string) => void;
  onRunSCC: () => void;
  onAnalyzeAccount: (accountId: string) => void;
  activeAlgorithm?: AlgorithmType | null;
}

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  allNodeIds,
  onRunBFS,
  onRunDFS,
  onRunCycles,
  onRunDijkstra,
  onRunSCC,
  onAnalyzeAccount,
  activeAlgorithm,
}) => {
  const [selectedStart, setSelectedStart] = useState<string>(allNodeIds[0] || '');
  const [selectedTarget, setSelectedTarget] = useState<string>(
    allNodeIds[Math.min(3, allNodeIds.length - 1)] || ''
  );
  const [selectedInvestigate, setSelectedInvestigate] = useState<string>(allNodeIds[0] || '');

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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4 select-none">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-200">
            Quick DSA Analysis
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
          Manual Engine
        </span>
      </div>

      {/* Traversal Selector & Trigger */}
      <div className="space-y-2">
        <label className="text-[11px] font-medium text-slate-400 block">
          Root Account for Traversal:
        </label>
        <select
          value={selectedStart}
          onChange={(e) => setSelectedStart(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          {allNodeIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onRunBFS(selectedStart)}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeAlgorithm === 'BFS'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 hover:bg-slate-700/80 text-cyan-300 border border-slate-700'
            }`}
          >
            <span>Run BFS</span>
            <span className="text-[9px] font-mono opacity-70">O(V+E)</span>
          </button>

          <button
            onClick={() => onRunDFS(selectedStart)}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeAlgorithm === 'DFS'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 hover:bg-slate-700/80 text-cyan-300 border border-slate-700'
            }`}
          >
            <span>Run DFS</span>
            <span className="text-[9px] font-mono opacity-70">O(V+E)</span>
          </button>
        </div>
      </div>

      {/* Anomaly & Ring Detection */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onRunCycles}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeAlgorithm === 'CYCLE_DETECTION'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                : 'bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 border border-rose-800/60'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Detect Cycles</span>
          </button>

          <button
            onClick={onRunSCC}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeAlgorithm === 'SCC'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-amber-950/40 hover:bg-amber-950/80 text-amber-300 border border-amber-800/60'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Tarjan SCC</span>
          </button>
        </div>
      </div>

      {/* Dijkstra Shortest Path */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <label className="text-[11px] font-medium text-slate-400 block">
          Shortest Transaction Path (Dijkstra):
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5 font-mono">From:</span>
            <select
              value={selectedStart}
              onChange={(e) => setSelectedStart(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs font-mono text-slate-200"
            >
              {allNodeIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5 font-mono">To:</span>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs font-mono text-slate-200"
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
          onClick={() => onRunDijkstra(selectedStart, selectedTarget)}
          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeAlgorithm === 'DIJKSTRA'
              ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
              : 'bg-blue-950/40 hover:bg-blue-950/80 text-blue-300 border border-blue-800/60'
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          <span>Find Shortest Path</span>
        </button>
      </div>

      {/* Account Deep Investigation Trigger */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <label className="text-[11px] font-medium text-slate-400 block">
          Target Account for Full Audit:
        </label>
        <div className="flex gap-2">
          <select
            value={selectedInvestigate}
            onChange={(e) => setSelectedInvestigate(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200"
          >
            {allNodeIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>

          <button
            onClick={() => onAnalyzeAccount(selectedInvestigate)}
            className="py-2 px-3 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/20"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Investigate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
