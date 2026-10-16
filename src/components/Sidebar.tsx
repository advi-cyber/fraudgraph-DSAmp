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
  const navGroups = [
    {
      group: 'Overview',
      items: [
        {
          id: 'dashboard' as PageTab,
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null,
          badgeColor: '',
        },
      ],
    },
    {
      group: 'Investigation',
      items: [
        {
          id: 'transactions' as PageTab,
          label: 'Transaction Ledger',
          icon: ReceiptText,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'network' as PageTab,
          label: 'Network Visualizer',
          icon: Network,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'fraud-rings' as PageTab,
          label: 'Fraud Ring Detector',
          icon: ShieldAlert,
          badge: suspiciousRingsCount > 0 ? `${suspiciousRingsCount} Rings` : null,
          badgeColor: 'bg-rose-950 text-rose-400 border-rose-800',
        },
        {
          id: 'investigation' as PageTab,
          label: 'Account Investigation',
          icon: SearchCode,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'timeline' as PageTab,
          label: 'Timeline Replay',
          icon: History,
          badge: detectedCyclesCount > 0 ? `${detectedCyclesCount} Cycles` : null,
          badgeColor: 'bg-amber-950 text-amber-400 border-amber-800',
        },
      ],
    },
    {
      group: 'DSA Laboratory',
      items: [
        {
          id: 'comparison' as PageTab,
          label: 'BFS vs DFS Traversal',
          icon: ArrowRightLeft,
          badge: 'CO4',
          badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-800',
        },
        {
          id: 'simulator' as PageTab,
          label: 'What-If Edge Simulator',
          icon: GitFork,
          badge: 'Sim',
          badgeColor: 'bg-blue-950 text-blue-400 border-blue-800',
        },
      ],
    },
    {
      group: 'Reporting',
      items: [
        {
          id: 'reports' as PageTab,
          label: 'Forensic Audit Dossier',
          icon: FileCheck2,
          badge: null,
          badgeColor: '',
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div className="p-3.5 space-y-4 overflow-y-auto">
        {navGroups.map((grp) => (
          <div key={grp.group} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              {grp.group}
            </div>

            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
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
                        item.badgeColor || 'bg-slate-100 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Academic syllabus footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-50 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[10px] uppercase tracking-wider">Academic DSA Rigor</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-500 font-sans">
          Adjacency List Directed Graph, FIFO Queue, Min-Heap PQ, Tarjan SCC & 3-State Directed Cycle Detection.
        </p>
      </div>
    </aside>
  );
};
