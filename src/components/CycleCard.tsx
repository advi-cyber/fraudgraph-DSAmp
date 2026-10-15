import React from 'react';
import { RefreshCw, AlertOctagon, ArrowRight, Info } from 'lucide-react';
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
      className={`rounded-xl border p-4 transition-all duration-200 cursor-pointer shadow-sm select-none ${
        isSelected
          ? 'bg-rose-950 border-rose-600 ring-2 ring-rose-500/30'
          : 'bg-white border-slate-800 hover:border-rose-400 hover:bg-rose-950/20'
      }`}
    >
      {/* Warning Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-800">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 block">
              Directed Transaction Cycle
            </span>
            <span className="text-xs font-bold text-slate-100 font-mono">
              Cycle ID: {cycle.id}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-rose-400">
            {formatINR(cycle.totalAmount)}
          </span>
          <span className="text-[9px] text-slate-500 block font-mono">Routed Volume</span>
        </div>
      </div>

      {/* Cycle Path */}
      <div className="mb-3">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
          Circular Flow Sequence:
        </span>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-700 font-mono text-xs text-rose-400 flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {cycle.nodes.map((node, i) => (
            <React.Fragment key={i}>
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-700 font-bold text-slate-100 shadow-xs">
                {node}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
            </React.Fragment>
          ))}
          <span className="px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800 font-bold text-rose-400">
            {cycle.nodes[0]}
          </span>
        </div>
      </div>

      {/* Accounts & Transactions Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3 font-mono">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-700">
          <span className="text-[10px] text-slate-400 block uppercase">Participating Vertices ({cycle.nodes.length}):</span>
          <span className="text-slate-200 font-semibold truncate block mt-0.5" title={cycle.nodes.join(', ')}>
            {cycle.nodes.join(', ')}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-slate-50 border border-slate-700">
          <span className="text-[10px] text-slate-400 block uppercase">Directed Edges ({cycle.edgeIds.length}):</span>
          <span className="text-slate-200 font-semibold truncate block mt-0.5" title={cycle.edgeIds.join(', ')}>
            {cycle.edgeIds.join(', ')}
          </span>
        </div>
      </div>

      {/* Why Investigate Cycles Explanation */}
      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-700 text-[11px] space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Why Investigate Circular Flows?</span>
        </div>
        <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
          In financial forensic auditing, circular fund routing (round-tripping) can be used to simulate commercial turnover, layer funds, or conceal origins. While legitimate trade reversals can occasionally form cycles, detection prioritizes the cluster for investigative review without presuming fraud.
        </p>
      </div>
    </div>
  );
};
