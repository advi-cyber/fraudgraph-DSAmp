import React from 'react';
import { Network, ShieldCheck, Database, Layers, PlusCircle, Activity } from 'lucide-react';
import { sampleCases } from '../data/sampleCases';

interface NavbarProps {
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  onOpenAddModal: () => void;
  nodeCount: number;
  edgeCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCaseId,
  onSelectCase,
  onOpenAddModal,
  nodeCount,
  edgeCount,
}) => {
  return (
    <header className="h-16 bg-slate-900/95 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md select-none">
      {/* Brand & Academic Badges */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xl tracking-wider">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-slate-100 font-mono">
                FRAUD<span className="text-cyan-400">GRAPH</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60">
                DSA Project
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                CO3 · CO4 · CO5
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Graph-Based Fraud Detection & Transaction Investigation System
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Graph Status Telemetry */}
      <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Status:</span>
          <span className="text-emerald-300 font-medium">Graph Engine Active</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Vertices |V|:</span>
          <span className="text-cyan-400 font-semibold">{nodeCount}</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Directed Edges |E|:</span>
          <span className="text-cyan-400 font-semibold">{edgeCount}</span>
        </div>
      </div>

      {/* Right: Demo Case Loader & Action Button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={activeCaseId}
            onChange={(e) => onSelectCase(e.target.value)}
            className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
          >
            {sampleCases.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 text-xs font-medium bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3.5 py-2 rounded-lg shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Transaction</span>
        </button>
      </div>
    </header>
  );
};
