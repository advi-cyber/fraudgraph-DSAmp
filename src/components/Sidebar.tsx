import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Network,
  ShieldAlert,
  SearchCode,
  History,
  GitFork,
  ArrowRightLeft,
  FileCheck2,
  BookOpen,
} from 'lucide-react';

export type PageTab =
  | 'dashboard'
  | 'transactions'
  | 'network'
  | 'fraud-rings'
  | 'investigation'
  | 'timeline'
  | 'simulator'
  | 'comparison'
  | 'reports';

interface SidebarProps {
  activeTab: PageTab;
  onTabChange: (tab: PageTab) => void;
  detectedCyclesCount: number;
  suspiciousRingsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  detectedCyclesCount,
  suspiciousRingsCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as PageTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'transactions' as PageTab,
      label: 'Transactions',
      icon: ReceiptText,
      badge: null,
    },
    {
      id: 'network' as PageTab,
      label: 'Network Visualizer',
      icon: Network,
      badge: null,
    },
    {
      id: 'fraud-rings' as PageTab,
      label: 'Fraud Ring Detector',
      icon: ShieldAlert,
      badge: suspiciousRingsCount > 0 ? `${suspiciousRingsCount} Rings` : null,
      badgeColor: 'bg-rose-900/60 text-rose-300 border-rose-700/50',
    },
    {
      id: 'investigation' as PageTab,
      label: 'Account Investigation',
      icon: SearchCode,
      badge: null,
    },
    {
      id: 'timeline' as PageTab,
      label: 'Timeline Replay',
      icon: History,
      badge: 'Novelty',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    },
    {
      id: 'simulator' as PageTab,
      label: 'What-If Simulator',
      icon: GitFork,
      badge: 'Sim',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    },
    {
      id: 'comparison' as PageTab,
      label: 'BFS vs DFS Lab',
      icon: ArrowRightLeft,
      badge: 'DSA',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    },
    {
      id: 'reports' as PageTab,
      label: 'Audit Reports',
      icon: FileCheck2,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Core Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                    item.badgeColor || 'bg-slate-100 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Academic syllabus footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Academic DSA Rigor</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          Manually implemented Adjacency List Directed Graph, FIFO Queue, Min-Heap Priority Queue, Tarjan SCC & 3-State Cycle Detection.
        </p>
      </div>
    </aside>
  );
};
