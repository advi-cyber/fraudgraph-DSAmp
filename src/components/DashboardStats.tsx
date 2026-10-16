import React from 'react';
import { Users, ArrowLeftRight, Coins, RefreshCw, ShieldAlert, AlertTriangle } from 'lucide-react';
import { GraphStats } from '../types/graph';
import { formatINR } from '../utils/currency';

interface DashboardStatsProps {
  stats: GraphStats;
  onNavigateTab?: (tab: any) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, onNavigateTab }) => {
  // 4 Primary KPI cards as specified in Section 4
  const primaryCards = [
    {
      title: 'Total Accounts',
      value: stats.totalNodes,
      subtext: 'Vertices |V| in Graph',
      icon: Users,
      badge: 'Order |V|',
      badgeColor: 'bg-slate-100 text-slate-400 border-slate-700',
      iconColor: 'text-cyan-400 bg-cyan-950 border-cyan-800',
      borderColor: 'border-slate-800',
      action: () => onNavigateTab && onNavigateTab('network'),
    },
    {
      title: 'Total Transactions',
      value: stats.totalEdges,
      subtext: 'Directed Edges |E|',
      icon: ArrowLeftRight,
      badge: 'Size |E|',
      badgeColor: 'bg-slate-100 text-slate-400 border-slate-700',
      iconColor: 'text-cyan-400 bg-cyan-950 border-cyan-800',
      borderColor: 'border-slate-800',
      action: () => onNavigateTab && onNavigateTab('transactions'),
    },
    {
      title: 'Suspicious Accounts',
      value: stats.suspiciousAccountsCount,
      subtext: 'Rule Risk ≥ 50 / 100',
      icon: AlertTriangle,
      badge: stats.suspiciousAccountsCount > 0 ? 'Elevated Risk' : 'Clear',
      badgeColor:
        stats.suspiciousAccountsCount > 0
          ? 'bg-amber-950 text-amber-400 border-amber-800'
          : 'bg-emerald-950 text-emerald-400 border-emerald-800',
      iconColor:
        stats.suspiciousAccountsCount > 0
          ? 'text-amber-400 bg-amber-950 border-amber-800'
          : 'text-emerald-400 bg-emerald-950 border-emerald-800',
      borderColor: stats.suspiciousAccountsCount > 0 ? 'border-amber-400' : 'border-slate-800',
      action: () => onNavigateTab && onNavigateTab('investigation'),
    },
    {
      title: 'Detected Cycles',
      value: stats.detectedCyclesCount,
      subtext: '3-State DFS Back-Edges',
      badge: stats.detectedCyclesCount > 0 ? `${stats.detectedCyclesCount} Cycles` : 'Acyclic',
      icon: RefreshCw,
      badgeColor:
        stats.detectedCyclesCount > 0
          ? 'bg-rose-950 text-rose-400 border-rose-800'
          : 'bg-emerald-950 text-emerald-400 border-emerald-800',
      iconColor:
        stats.detectedCyclesCount > 0
          ? 'text-rose-400 bg-rose-950 border-rose-800'
          : 'text-emerald-400 bg-emerald-950 border-emerald-800',
      borderColor: stats.detectedCyclesCount > 0 ? 'border-rose-400' : 'border-slate-800',
      action: () => onNavigateTab && onNavigateTab('fraud-rings'),
    },
  ];

  const secondaryStats = [
    {
      label: 'Suspicious Rings (Tarjan SCC):',
      value: `${stats.suspiciousRingsCount} cluster${stats.suspiciousRingsCount === 1 ? '' : 's'}`,
      isAlert: stats.suspiciousRingsCount > 0,
      action: () => onNavigateTab && onNavigateTab('fraud-rings'),
    },
    {
      label: 'Gross Transacted Volume:',
      value: formatINR(stats.totalVolume),
      isAlert: false,
      action: () => onNavigateTab && onNavigateTab('transactions'),
    },
    {
      label: 'Graph Engine:',
      value: 'Adjacency List Multigraph',
      isAlert: false,
      action: () => onNavigateTab && onNavigateTab('network'),
    },
  ];

  return (
    <div className="space-y-2.5 select-none font-mono">
      {/* 4 Prominent KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={card.action}
              className={`p-4 rounded-xl border bg-white ${card.borderColor} shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold font-sans text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg border ${card.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold tracking-tight text-slate-100">
                  {card.value}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-500 font-sans truncate">
                    {card.subtext}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Quick Context Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-lg bg-slate-50 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-6">
          {secondaryStats.map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              className="flex items-center gap-2 cursor-pointer hover:text-slate-100 transition-colors"
            >
              <span className="text-slate-500 font-sans">{item.label}</span>
              <span
                className={`font-semibold ${
                  item.isAlert ? 'text-amber-400 font-bold' : 'text-slate-200'
                }`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="text-[10px] text-slate-400 font-sans">
          Deterministic Rule Engine · No Synthetic Predictions
        </div>
      </div>
    </div>
  );
};
