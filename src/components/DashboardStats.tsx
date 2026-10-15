import React from 'react';
import { Users, ArrowLeftRight, Coins, RefreshCw, ShieldAlert, AlertTriangle } from 'lucide-react';
import { GraphStats } from '../types/graph';
import { formatINR } from '../utils/currency';

interface DashboardStatsProps {
  stats: GraphStats;
  onNavigateTab?: (tab: any) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, onNavigateTab }) => {
  const cards = [
    {
      title: 'Total Accounts',
      value: stats.totalNodes,
      subtext: `Vertices |V| in Graph`,
      icon: Users,
      badge: 'Graph Order',
      badgeColor: 'bg-slate-100 text-slate-400 border-slate-700',
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
      borderColor: 'border-slate-800',
      action: () => onNavigateTab && onNavigateTab('network'),
    },
    {
      title: 'Total Transactions',
      value: stats.totalEdges,
      subtext: `Directed Edges |E|`,
      icon: ArrowLeftRight,
      badge: 'Graph Size',
      badgeColor: 'bg-slate-100 text-slate-400 border-slate-700',
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
      borderColor: 'border-slate-800',
      action: () => onNavigateTab && onNavigateTab('transactions'),
    },
    {
      title: 'Suspicious Accounts',
      value: stats.suspiciousAccountsCount,
      subtext: `Elevated Rule Risk (≥50)`,
      icon: AlertTriangle,
      badge: stats.suspiciousAccountsCount > 0 ? 'Action Required' : 'Clean',
      badgeColor: stats.suspiciousAccountsCount > 0 ? 'bg-amber-950 text-amber-400 border-amber-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800',
      iconColor: stats.suspiciousAccountsCount > 0 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-slate-400 bg-slate-50 border-slate-200',
      borderColor: stats.suspiciousAccountsCount > 0 ? 'border-amber-400/60' : 'border-slate-800',
      action: () => onNavigateTab && onNavigateTab('investigation'),
    },
    {
      title: 'Detected Cycles',
      value: stats.detectedCyclesCount,
      subtext: `3-State DFS Back-Edges`,
      icon: RefreshCw,
      badge: stats.detectedCyclesCount > 0 ? 'Cyclic Flows' : 'Acyclic',
      badgeColor: stats.detectedCyclesCount > 0 ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800',
      iconColor: stats.detectedCyclesCount > 0 ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-slate-400 bg-slate-50 border-slate-200',
      borderColor: stats.detectedCyclesCount > 0 ? 'border-rose-400/60' : 'border-slate-800',
      action: () => onNavigateTab && onNavigateTab('fraud-rings'),
    },
    {
      title: 'Suspicious Rings (SCC)',
      value: stats.suspiciousRingsCount,
      subtext: `Tarjan Mutual Reachability`,
      icon: ShieldAlert,
      badge: stats.suspiciousRingsCount > 0 ? 'Laundering Rings' : 'None',
      badgeColor: stats.suspiciousRingsCount > 0 ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-slate-100 text-slate-400 border-slate-700',
      iconColor: stats.suspiciousRingsCount > 0 ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-slate-400 bg-slate-50 border-slate-200',
      borderColor: stats.suspiciousRingsCount > 0 ? 'border-rose-400/60' : 'border-slate-800',
      action: () => onNavigateTab && onNavigateTab('fraud-rings'),
    },
    {
      title: 'Gross Volume',
      value: formatINR(stats.totalVolume),
      subtext: `Aggregated Edge Weights`,
      icon: Coins,
      badge: 'Throughput',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800',
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      borderColor: 'border-slate-800',
      action: () => onNavigateTab && onNavigateTab('transactions'),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 select-none font-mono">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            onClick={card.action}
            className={`p-3.5 rounded-xl border bg-white ${card.borderColor} shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium font-sans text-slate-400 leading-tight">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg border ${card.iconColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="text-xl font-bold tracking-tight text-slate-100">
                {card.value}
              </div>
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 font-sans truncate max-w-[100px]">
                  {card.subtext}
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded border ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
