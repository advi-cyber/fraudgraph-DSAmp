import React from 'react';
import { RefreshCw, AlertOctagon, ArrowRight, ShieldAlert } from 'lucide-react';
import { DetectedCycle } from '../types/algorithm';
import { formatINR } from '../utils/currency';

interface CycleCardProps {
  cycle: DetectedCycle;
  onHighlightCycle?: (cycle: DetectedCycle) => void;
  isSelected?: boolean;
}

export const CycleCard: React.FC<CycleCardProps> = ({
  cycle,
  onHighlightCycle,
  isSelected = false,
}) => {
  return (
    <div
      onClick={() => onHighlightCycle && onHighlightCycle(cycle)}
      className={`rounded-xl border p-4 transition-all duration-200 cursor-pointer shadow-md select-none ${
        isSelected
          ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/40 shadow-rose-500/10'
          : 'bg-slate-900/90 border-slate-800 hover:border-rose-600/60 hover:bg-slate-900'
      }`}
    >
      {/* Warning Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-rose-950 text-rose-400 border border-rose-800">
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 block">
              POTENTIALLY SUSPICIOUS TRANSACTION CYCLE
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Cycle ID: {cycle.id}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-rose-300">
            {formatINR(cycle.totalAmount)}
          </span>
          <span className="text-[9px] text-slate-400 block">Total Routed Volume</span>
        </div>
      </div>

      {/* Cycle Path */}
      <div className="mb-3">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
          Circular Path Flow:
        </span>
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-rose-300 flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {cycle.nodes.map((node, i) => (
            <React.Fragment key={i}>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/80 font-semibold text-slate-100">
                {node}
              </span>
              <ArrowRight className="w-3 h-3 text-rose-400 shrink-0" />
            </React.Fragment>
          ))}
          <span className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-700/80 font-bold text-rose-200">
            {cycle.nodes[0]}
          </span>
        </div>
      </div>

      {/* Accounts & Transactions Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs mb-3 font-mono">
        <div className="p-2 rounded bg-slate-950/50 border border-slate-800/50">
          <span className="text-[10px] text-slate-400 block uppercase">Accounts ({cycle.nodes.length}):</span>
          <span className="text-slate-300 font-semibold truncate block mt-0.5" title={cycle.nodes.join(', ')}>
            {cycle.nodes.join(', ')}
          </span>
        </div>

        <div className="p-2 rounded bg-slate-950/50 border border-slate-800/50">
          <span className="text-[10px] text-slate-400 block uppercase">Transactions ({cycle.edgeIds.length}):</span>
          <span className="text-slate-300 font-semibold truncate block mt-0.5" title={cycle.edgeIds.join(', ')}>
            {cycle.edgeIds.join(', ')}
          </span>
        </div>
      </div>

      {/* Graph Evidence */}
      <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] flex items-start gap-2">
        <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Graph Evidence:</span>{' '}
          <span className="text-slate-400">{cycle.evidence}</span>
          <span className="text-[10px] text-cyan-400/80 font-mono block mt-0.5">
            Complexity: O(V + E) · 3-State DFS Back-Edge Proof
          </span>
        </div>
      </div>
    </div>
  );
};
