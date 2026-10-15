import React from 'react';
import { Network, Database, PlusCircle, RotateCcw, Upload, FileDown, ShieldCheck } from 'lucide-react';
import { sampleCases } from '../data/sampleCases';
import { exportInvestigationSummaryCSV } from '../services/csvExport';
import { Graph } from '../dataStructures/Graph';

interface NavbarProps {
  graph: Graph;
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  onOpenAddModal: () => void;
  onOpenCSVModal: () => void;
  onResetDefault: () => void;
  nodeCount: number;
  edgeCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  graph,
  activeCaseId,
  onSelectCase,
  onOpenAddModal,
  onOpenCSVModal,
  onResetDefault,
  nodeCount,
  edgeCount,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm select-none">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-600/20 text-white font-black text-xl tracking-wider">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wider text-slate-100 font-mono">
                FRAUD<span className="text-cyan-400">GRAPH</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                DSA Project
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-300 border border-slate-700">
                CO3 · CO4 · CO5
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium font-sans">
              Explainable Transaction Fraud Investigation System
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Graph Status Telemetry */}
      <div className="hidden lg:flex items-center gap-5 px-4 py-1.5 rounded-xl bg-slate-50 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-400">Engine:</span>
          <span className="text-emerald-400 font-semibold">Active Adjacency Graph</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Vertices |V|:</span>
          <span className="text-cyan-400 font-bold">{nodeCount}</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Directed Edges |E|:</span>
          <span className="text-cyan-400 font-bold">{edgeCount}</span>
        </div>
      </div>

      {/* Right Controls: Dataset Selector, CSV Upload, Reset & New Transaction */}
      <div className="flex items-center gap-2.5">
        {/* Dataset Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-700 rounded-lg px-2.5 py-1.5">
          <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            value={activeCaseId}
            onChange={(e) => onSelectCase(e.target.value)}
            className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
          >
            {sampleCases.map((c) => (
              <option key={c.id} value={c.id} className="bg-white text-slate-200">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Action */}
        <button
          onClick={onResetDefault}
          title="Restore Initial Sample Demonstration Network"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-300 hover:text-slate-100 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset State</span>
        </button>

        {/* CSV Import */}
        <button
          onClick={onOpenCSVModal}
          title="Import custom transactions CSV"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-300 hover:text-slate-100 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Import CSV</span>
        </button>

        {/* Export CSV Dossier */}
        <button
          onClick={() => exportInvestigationSummaryCSV(graph)}
          title="Download complete investigation report as CSV"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-800 text-xs font-mono transition-colors cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        {/* New Transaction Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 rounded-lg shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Transaction</span>
        </button>
      </div>
    </header>
  );
};
