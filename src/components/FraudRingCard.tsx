import React from 'react';
import { ShieldAlert, Users, Layers, ExternalLink } from 'lucide-react';
import { FraudRingDetails } from '../services/fraudAnalyzer';
import { formatINR } from '../utils/currency';

interface FraudRingCardProps {
  ring: FraudRingDetails;
  onSelectRing?: (ring: FraudRingDetails) => void;
  isSelected?: boolean;
}

export const FraudRingCard: React.FC<FraudRingCardProps> = ({
  ring,
  onSelectRing,
  isSelected = false,
}) => {
  return (
    <div
      onClick={() => onSelectRing && onSelectRing(ring)}
      className={`rounded-xl border p-4 transition-all duration-200 cursor-pointer shadow-md select-none ${
        isSelected
          ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/40 shadow-amber-500/10'
          : 'bg-slate-900/90 border-slate-800 hover:border-amber-600/60 hover:bg-slate-900'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-950 text-amber-400 border border-amber-800">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
              POTENTIALLY SUSPICIOUS TRANSACTION RING
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {ring.name} ({ring.ringId})
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-amber-300">
            {formatINR(ring.totalVolume)}
          </span>
          <span className="text-[9px] text-slate-400 block">Internal Flow Volume</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-xs font-mono">
        <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
          <span className="text-[10px] text-slate-400 block uppercase">
            Accounts ({ring.accounts.length}):
          </span>
          <span className="text-slate-200 font-semibold truncate block mt-0.5" title={ring.accounts.join(', ')}>
            {ring.accounts.join(', ')}
          </span>
        </div>

        <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
          <span className="text-[10px] text-slate-400 block uppercase">
            Transactions ({ring.transactions.length}):
          </span>
          <span className="text-slate-200 font-semibold truncate block mt-0.5" title={ring.transactions.join(', ')}>
            {ring.transactions.join(', ')}
          </span>
        </div>
      </div>

      {/* Cycle paths inside ring */}
      <div className="mb-3 space-y-1">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
          Constituent Cyclic Path(s):
        </span>
        {ring.cyclePaths.map((path, idx) => (
          <div
            key={idx}
            className="p-1.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300 truncate"
            title={path}
          >
            {path}
          </div>
        ))}
      </div>

      <div className="p-2.5 rounded bg-slate-950/90 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
        <div className="font-semibold text-amber-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          <span>Graph Evidence (SCC + Cycle):</span>
        </div>
        <p className="text-slate-400 text-[10px] leading-relaxed">
          {ring.graphEvidence}
        </p>
        <span className="text-[9px] text-cyan-400 font-mono block">
          Tarjan SCC O(V + E) + 3-State DFS Cycle Detection O(V + E)
        </span>
      </div>
    </div>
  );
};
