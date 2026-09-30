import React from 'react';
import { Users, ArrowLeftRight, Coins, RefreshCw, ShieldAlert, GitCommit } from 'lucide-react';
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
      subtext: `Vertices |V| in Network`,
      icon: Users,
      color: 'from-blue-500/10 to-blue-500/5',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400',
      action: () => onNavigateTab && onNavigateTab('network'),
    },
    {
      title: 'Total Transactions',
      value: stats.totalEdges,
      subtext: `Directed Edges |E|`,
      icon: ArrowLeftRight,
      color: 'from-cyan-500/10 to-cyan-500/5',
      borderColor: 'border-cyan-500/20',
      iconColor: 'text-cyan-400',
      action: () => onNavigateTab && onNavigateTab('transactions'),
    },
    {
      title: 'Transaction Volume',
      value: formatINR(stats.totalVolume),
      subtext: `Aggregated Edge Weights`,
      icon: Coins,
      color: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
      action: () => onNavigateTab && onNavigateTab('transactions'),
    },
    {
      title: 'Potentially Suspicious Cycles',
      value: stats.detectedCyclesCount,
      subtext: `3-State DFS Back-Edges`,
      icon: RefreshCw,
      color: stats.detectedCyclesCount > 0 ? 'from-rose-500/15 to-rose-500/5' : 'from-slate-500/10 to-slate-500/5',
      borderColor: stats.detectedCyclesCount > 0 ? 'border-rose-500/40' : 'border-slate-800',
      iconColor: stats.detectedCyclesCount > 0 ? 'text-rose-400' : 'text-slate-400',
      action: () => onNavigateTab && onNavigateTab('fraud-rings'),
      highlight: stats.detectedCyclesCount > 0,
    },
    {
      title: 'Suspicious Transaction Rings',
      value: stats.suspiciousRingsCount,
      subtext: `Tarjan SCC Multi-Node Clusters`,
      icon: ShieldAlert,
      color: stats.suspiciousRingsCount > 0 ? 'from-amber-500/15 to-amber-500/5' : 'from-slate-500/10 to-slate-500/5',
      borderColor: stats.suspiciousRingsCount > 0 ? 'border-amber-500/40' : 'border-slate-800',
      iconColor: stats.suspiciousRingsCount > 0 ? 'text-amber-400' : 'text-slate-400',
      action: () => onNavigateTab && onNavigateTab('fraud-rings'),
      highlight: stats.suspiciousRingsCount > 0,
    },
    {
      title: 'Connected Components',
      value: stats.stronglyConnectedCount,
      subtext: `Total Partitioned Partitions`,
      icon: GitCommit,
      color: 'from-indigo-500/10 to-indigo-500/5',
      borderColor: 'border-indigo-500/20',
      iconColor: 'text-indigo-400',
      action: () => onNavigateTab && onNavigateTab('network'),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 select-none">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            onClick={card.action}
            className={`p-3.5 rounded-xl border bg-gradient-to-b ${card.color} ${card.borderColor} transition-all duration-200 hover:scale-[1.02] cursor-pointer flex flex-col justify-between shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-400 leading-tight">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-xl font-bold font-mono tracking-tight text-slate-100">
                {card.value}
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
