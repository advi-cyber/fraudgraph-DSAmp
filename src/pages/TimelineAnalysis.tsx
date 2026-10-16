import React, { useState, useMemo } from 'react';
import { Transaction } from '../types/transaction';
import { buildGraphFromTransactions } from '../services/graphBuilder';
import { detectDirectedCycles } from '../algorithms/cycleDetection';
import { Timeline } from '../components/Timeline';
import { GraphVisualizer } from '../components/GraphVisualizer';
import { History, ShieldAlert, Sparkles, Layers } from 'lucide-react';

interface TimelineAnalysisProps {
  transactions: Transaction[];
  onInvestigateAccount: (accountId: string) => void;
}

export const TimelineAnalysis: React.FC<TimelineAnalysisProps> = ({
  transactions,
  onInvestigateAccount,
}) => {
  const [activeSlice, setActiveSlice] = useState<Transaction[]>(transactions);

  React.useEffect(() => {
    setActiveSlice(transactions);
  }, [transactions]);


  // Dynamic partial graph built from active time slice
  const partialGraph = useMemo(() => {
    return buildGraphFromTransactions(activeSlice);
  }, [activeSlice]);

  const cycleResult = useMemo(() => {
    return detectDirectedCycles(partialGraph);
  }, [partialGraph]);

  const cycleEdges = cycleResult.cycles.flatMap((c) => c.edgeIds);
  const cycleNodes = cycleResult.cycles.flatMap((c) => c.nodes);

  return (
    <div className="space-y-4 select-none">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              CORE NOVELTY FEATURE
            </span>
          </div>
          <h2 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2 uppercase tracking-wide">
            <History className="w-4 h-4 text-amber-400" />
            <span>DYNAMIC TRANSACTION TIMELINE & CYCLE EMERGENCE TRACKER</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Slide through historical transaction timestamps to observe graph evolution edge-by-edge and pinpoint the exact moment of cycle emergence.
          </p>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Active Edges: </span>
            <span className="text-cyan-400 font-bold">{partialGraph.getEdgeCount()}</span> / {transactions.length}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Cycles Formed: </span>
            <span className={`font-bold ${cycleResult.hasCycle ? 'text-rose-400' : 'text-slate-400'}`}>
              {cycleResult.cycles.length}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Controls Card */}
      <Timeline
        transactions={transactions}
        onTransactionsChange={(slice) => setActiveSlice(slice)}
      />

      {/* Dynamic Graph Canvas */}
      <div className="h-[520px]">
        <GraphVisualizer
          graph={partialGraph}
          highlightedNodes={cycleNodes}
          highlightedEdges={cycleEdges}
          cycleEdgeIds={cycleEdges}
          onSelectNode={onInvestigateAccount}
        />
      </div>
    </div>
  );
};
