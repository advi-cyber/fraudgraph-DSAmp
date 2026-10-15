import React from 'react';
import { AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { RiskBreakdown } from '../types/investigation';

interface RiskIndicatorProps {
  breakdown: RiskBreakdown;
  compact?: boolean;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ breakdown, compact = false }) => {
  const getBadgeStyle = () => {
    switch (breakdown.level) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/60 ring-2 ring-rose-500/30';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/60 ring-2 ring-amber-500/30';
      case 'MEDIUM':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-500/60';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60';
    }
  };

  const getMeterColor = () => {
    if (breakdown.score >= 70) return 'from-rose-600 to-rose-400';
    if (breakdown.score >= 50) return 'from-amber-600 to-amber-400';
    if (breakdown.score >= 25) return 'from-yellow-600 to-yellow-400';
    return 'from-emerald-600 to-emerald-400';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 font-mono">
        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getBadgeStyle()}`}>
          {breakdown.score} / 100
        </span>
        <span className="text-[11px] text-slate-400">({breakdown.level})</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
      {/* Header with Risk Meter */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
              Graph Risk Indicator
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Deterministic Topological Risk Score (Zero ML / Explainable DSA)
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-baseline gap-1 justify-end font-mono">
            <span className="text-2xl font-black text-slate-100">{breakdown.score}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${getBadgeStyle()}`}>
            {breakdown.level} RISK
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getMeterColor()} transition-all duration-500`}
          style={{ width: `${Math.min(100, breakdown.score)}%` }}
        />
      </div>

      {/* Explanatory Factors Breakdown Table */}
      <div className="space-y-2">
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
          Additive Risk Factors Breakdown:
        </div>

        <div className="space-y-1.5 font-mono text-xs">
          {breakdown.factors.map((factor, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg border flex items-start justify-between gap-3 ${
                factor.triggered
                  ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                  : 'bg-slate-950/30 border-slate-900 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-start gap-2">
                {factor.triggered ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-medium text-[11px] text-slate-200">
                    {factor.title}
                  </div>
                  <div className="text-[10px] font-sans text-slate-400 mt-0.5">
                    {factor.description}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`font-bold ${
                    factor.triggered ? 'text-amber-400' : 'text-slate-400'
                  }`}
                >
                  +{factor.points}
                </span>
                <span className="text-[9px] text-slate-400 block">max {factor.maxPoints}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Academic Disclaimer */}
      <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/50 flex items-start gap-2 text-[10px] text-blue-300">
        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          {breakdown.disclaimer}
        </span>
      </div>
    </div>
  );
};
