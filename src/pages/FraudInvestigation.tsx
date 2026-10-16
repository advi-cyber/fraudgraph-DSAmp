import React, { useState } from 'react';
import { Graph } from '../dataStructures/Graph';
import { analyzeFraudRings, FraudRingDetails } from '../services/fraudAnalyzer';
import { detectDirectedCycles } from '../algorithms/cycleDetection';
import { FraudRingCard } from '../components/FraudRingCard';
import { CycleCard } from '../components/CycleCard';
import { GraphVisualizer } from '../components/GraphVisualizer';
import { ShieldAlert, RefreshCw, Layers, Info } from 'lucide-react';
import { formatINR } from '../utils/currency';

interface FraudInvestigationProps {
  graph: Graph;
  onInvestigateAccount: (accountId: string) => void;
}

export const FraudInvestigation: React.FC<FraudInvestigationProps> = ({
  graph,
  onInvestigateAccount,
}) => {
  const rings = analyzeFraudRings(graph);
  const cycleResult = detectDirectedCycles(graph);

  const [selectedRing, setSelectedRing] = useState<FraudRingDetails | null>(
    rings.length > 0 ? rings[0] : null
  );

  React.useEffect(() => {
    setSelectedRing(rings.length > 0 ? rings[0] : null);
  }, [graph]);

  const [activeTab, setActiveTab] = useState<'RINGS' | 'CYCLES'>('RINGS');


  const highlightedNodes = selectedRing ? selectedRing.accounts : [];
  const cycleEdges = cycleResult.cycles.flatMap((c) => c.edgeIds);

  const totalRingVolume = rings.reduce((sum, r) => sum + r.totalVolume, 0);

  return (
    <div className="space-y-5 select-none">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              DSA EXTENSION: TARJAN SCC + 3-STATE DFS
            </span>
          </div>
          <h2 className="text-base font-bold font-mono tracking-wide text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>POTENTIALLY SUSPICIOUS TRANSACTION RING DETECTION</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Identifies mutual reachability components and closed circular fund flow loops. Graph patterns indicate anomalous topological routing for regulatory review, not automatic proof of criminality.
          </p>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 uppercase block">Rings Detected:</span>
            <span className="text-amber-800 font-bold text-base">{rings.length}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 uppercase block">Circular Loops:</span>
            <span className="text-rose-700 font-bold text-base">{cycleResult.cycles.length}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 uppercase block">Ring Volume:</span>
            <span className="text-emerald-700 font-bold text-base">{formatINR(totalRingVolume)}</span>
          </div>
        </div>
      </div>

      {/* Grid: Ring List & Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Rings & Cycles Switcher (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 font-mono text-xs">
            <button
              onClick={() => setActiveTab('RINGS')}
              className={`flex-1 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'RINGS'
                  ? 'bg-white text-amber-800 border border-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Suspicious Rings ({rings.length})
            </button>
            <button
              onClick={() => setActiveTab('CYCLES')}
              className={`flex-1 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'CYCLES'
                  ? 'bg-white text-rose-700 border border-rose-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Directed Cycles ({cycleResult.cycles.length})
            </button>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {activeTab === 'RINGS' ? (
              rings.length > 0 ? (
                rings.map((ring) => (
                  <FraudRingCard
                    key={ring.ringId}
                    ring={ring}
                    isSelected={selectedRing?.ringId === ring.ringId}
                    onSelectRing={(r) => setSelectedRing(r)}
                  />
                ))
              ) : (
                <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-500 font-mono text-xs">
                  No multi-node strongly connected components detected in this graph.
                </div>
              )
            ) : cycleResult.cycles.length > 0 ? (
              cycleResult.cycles.map((cycle) => (
                <CycleCard
                  key={cycle.id}
                  cycle={cycle}
                  isSelected={false}
                  onHighlightCycle={(c) => {
                    const match = rings.find((r) => r.accounts.some((a) => c.nodes.includes(a)));
                    if (match) setSelectedRing(match);
                  }}
                />
              ))
            ) : (
              <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-500 font-mono text-xs">
                No directed cycles detected. Graph is acyclic (DAG).
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visualizer with Isolated Highlighting (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="h-[520px]">
            <GraphVisualizer
              graph={graph}
              highlightedNodes={highlightedNodes}
              highlightedEdges={cycleEdges}
              cycleEdgeIds={cycleEdges}
              onSelectNode={onInvestigateAccount}
            />
          </div>

          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>Academic Methodology:</strong> Non-trivial Strongly Connected Components (Tarjan O(V+E)) group mutually reachable accounts into candidate rings. DFS 3-State back-edges confirm closed circular fund flows. Click any account to view the full forensic audit.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
