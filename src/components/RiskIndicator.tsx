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
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-2 ring-rose-500/20';
      case 'HIGH':
        return 'bg-amber-50 text-amber-800 border-amber-200 ring-2 ring-amber-500/20';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
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
        <span className="text-[11px] text-slate-500">({breakdown.level})</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
      {/* Header with Risk Meter */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-800">
              Graph Risk Indicator
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Deterministic Topological Risk Score (Zero ML / Explainable DSA)
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-baseline gap-1 justify-end font-mono">
            <span className="text-2xl font-black text-slate-900">{breakdown.score}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${getBadgeStyle()}`}>
            {breakdown.level} RISK
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getMeterColor()} transition-all duration-500`}
          style={{ width: `${Math.min(100, breakdown.score)}%` }}
        />
      </div>

      {/* Explanatory Factors Breakdown Table */}
      <div className="space-y-2">
        <div className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">
          Additive Risk Factors Breakdown:
        </div>

        <div className="space-y-1.5 font-mono text-xs">
          {breakdown.factors.map((factor, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg border flex items-start justify-between gap-3 ${
                factor.triggered
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : 'bg-slate-50/40 border-slate-100 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-start gap-2">
                {factor.triggered ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-medium text-[11px] text-slate-800">
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
