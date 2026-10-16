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
      className={`rounded-xl border p-4 transition-all duration-200 cursor-pointer shadow-sm select-none ${
        isSelected
          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/30 shadow-amber-500/5'
          : 'bg-white border-slate-200 hover:border-amber-500/50 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 block">
              POTENTIALLY SUSPICIOUS TRANSACTION RING
            </span>
            <span className="text-xs font-semibold text-slate-800">
              {ring.name} ({ring.ringId})
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-amber-800">
            {formatINR(ring.totalVolume)}
          </span>
          <span className="text-[9px] text-slate-500 block">Internal Flow Volume</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-xs font-mono">
        <div className="p-2 rounded bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 block uppercase">
            Accounts ({ring.accounts.length}):
          </span>
          <span className="text-slate-800 font-semibold truncate block mt-0.5" title={ring.accounts.join(', ')}>
            {ring.accounts.join(', ')}
          </span>
        </div>

        <div className="p-2 rounded bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 block uppercase">
            Transactions ({ring.transactions.length}):
          </span>
          <span className="text-slate-800 font-semibold truncate block mt-0.5" title={ring.transactions.join(', ')}>
            {ring.transactions.join(', ')}
          </span>
        </div>
      </div>

      {/* Cycle paths inside ring */}
      <div className="mb-3 space-y-1">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600 block">
          Constituent Cyclic Path(s):
        </span>
        {ring.cyclePaths.map((path, idx) => (
          <div
            key={idx}
            className="p-1.5 rounded bg-slate-50 border border-slate-200 text-[11px] font-mono text-amber-800 truncate"
            title={path}
          >
            {path}
          </div>
        ))}
      </div>

      <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
        <div className="font-semibold text-amber-800 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          <span>Graph Evidence (SCC + Cycle):</span>
        </div>
        <p className="text-slate-600 text-[10px] leading-relaxed">
          {ring.graphEvidence}
        </p>
        <span className="text-[9px] text-blue-700 font-mono block font-semibold">
          Tarjan SCC O(V + E) + 3-State DFS Cycle Detection O(V + E)
        </span>
      </div>
    </div>
  );
};
