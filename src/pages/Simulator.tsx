import React, { useState } from 'react';
import { Graph } from '../dataStructures/Graph';
import { Transaction } from '../types/transaction';
import { detectDirectedCycles } from '../algorithms/cycleDetection';
import { runTarjanSCC } from '../algorithms/stronglyConnectedComponents';
import { runDijkstra } from '../algorithms/dijkstra';
import { calculateAccountRisk } from '../services/riskAnalyzer';
import { GraphVisualizer } from '../components/GraphVisualizer';
import { GitFork, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, Play, Check, Trash2 } from 'lucide-react';
import { formatINR } from '../utils/currency';

interface SimulatorProps {
  graph: Graph;
  allNodeIds: string[];
  onApplyTransaction: (tx: Omit<Transaction, 'id'> & { id?: string }) => void;
}

export const Simulator: React.FC<SimulatorProps> = ({
  graph,
  allNodeIds,
  onApplyTransaction,
}) => {
  const [source, setSource] = useState(allNodeIds[0] || '');
  const [target, setTarget] = useState(allNodeIds[1] || allNodeIds[0] || '');
  const [amount, setAmount] = useState('182500');
  const [isSimulated, setIsSimulated] = useState(false);
  const [clonedGraph, setClonedGraph] = useState<Graph | null>(null);
  const [simulatedEdgeId, setSimulatedEdgeId] = useState<string>('');

  React.useEffect(() => {
    setIsSimulated(false);
    setClonedGraph(null);
    setSimulatedEdgeId('');
    if (allNodeIds.length > 0) {
      setSource(allNodeIds[0]);
      setTarget(allNodeIds[1] || allNodeIds[0]);
    } else {
      setSource('');
      setTarget('');
    }
  }, [graph, allNodeIds]);


  // Run Simulation
  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !target || source === target) return;

    const numAmount = parseFloat(amount) || 10000;
    const simGraph = graph.clone();
    const tempTxId = `SIM-TX-${Date.now().toString().slice(-4)}`;

    const addedEdge = simGraph.addEdge(source, target, numAmount, {
      transactionId: tempTxId,
      description: 'Hypothetical Simulated Transaction',
      timestamp: new Date().toISOString(),
      isSimulated: true,
    });

    setClonedGraph(simGraph);
    setSimulatedEdgeId(addedEdge.id);
    setIsSimulated(true);
  };

  const handleApply = () => {
    if (!source || !target) return;
    onApplyTransaction({
      sender: source,
      receiver: target,
      amount: parseFloat(amount) || 10000,
      description: 'Applied from Simulation Lab',
      timestamp: new Date().toISOString(),
      type: 'TRANSFER',
      status: 'COMPLETED',
    });
    handleDiscard();
  };

  const handleDiscard = () => {
    setIsSimulated(false);
    setClonedGraph(null);
    setSimulatedEdgeId('');
  };

  // Evaluation before vs after
  const beforeCycles = detectDirectedCycles(graph);
  const beforeSCC = runTarjanSCC(graph);
  const beforeSourceRisk = calculateAccountRisk(graph, source);
  const beforeTargetRisk = calculateAccountRisk(graph, target);

  const afterCycles = clonedGraph ? detectDirectedCycles(clonedGraph) : beforeCycles;
  const afterSCC = clonedGraph ? runTarjanSCC(clonedGraph) : beforeSCC;
  const afterSourceRisk = clonedGraph ? calculateAccountRisk(clonedGraph, source) : beforeSourceRisk;
  const afterTargetRisk = clonedGraph ? calculateAccountRisk(clonedGraph, target) : beforeTargetRisk;

  const cycleDiff = afterCycles.cycles.length - beforeCycles.cycles.length;
  const sccDiff =
    afterSCC.components.filter((c) => c.nodes.length >= 2).length -
    beforeSCC.components.filter((c) => c.nodes.length >= 2).length;

  const createsCycle = cycleDiff > 0;
  const createsRing = sccDiff > 0;

  // New cycles formed
  const newCycles = afterCycles.cycles.filter(
    (ac) => !beforeCycles.cycles.some((bc) => bc.pathDescription === ac.pathDescription)
  );

  return (
    <div className="space-y-5 select-none">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              DSA WHAT-IF EXPERIMENTAL LAB
            </span>
          </div>
          <h2 className="text-base font-bold font-mono tracking-wide text-slate-900 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-blue-600" />
            <span>WHAT-IF TRANSACTION SIMULATOR</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Model hypothetical transactions in a sandbox cloned graph. Detect if adding an edge would trigger a cyclic back-edge, create a strongly connected fraud ring, or elevate graph risk scores before execution.
          </p>
        </div>
      </div>

      {/* Simulator Input Form */}
      <form
        onSubmit={handleSimulate}
        className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm font-mono text-xs space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] text-slate-700 font-semibold block mb-1">
              Source Account (Sender):
            </label>
            <input
              type="text"
              list="sim-accounts-source"
              value={source}
              onChange={(e) => setSource(e.target.value.toUpperCase())}
              placeholder="e.g. ACC-DELTA"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
            <datalist id="sim-accounts-source">
              {allNodeIds.map((id) => (
                <option key={id} value={id} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-[11px] text-slate-700 font-semibold block mb-1">
              Destination Account (Receiver):
            </label>
            <input
              type="text"
              list="sim-accounts-target"
              value={target}
              onChange={(e) => setTarget(e.target.value.toUpperCase())}
              placeholder="e.g. ACC-ALPHA"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
            <datalist id="sim-accounts-target">
              {allNodeIds.map((id) => (
                <option key={id} value={id} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-[11px] text-slate-700 font-semibold block mb-1">
              Hypothetical Amount (₹):
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 182500"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <span className="text-[11px] text-slate-500">
            Clones current graph in-memory · O(V+E) re-computation
          </span>

          <div className="flex items-center gap-3">
            {isSimulated && (
              <>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Discard Simulation</span>
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Transaction to Real Graph</span>
                </button>
              </>
            )}

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>SIMULATE TRANSACTION</span>
            </button>
          </div>
        </div>
      </form>

      {/* Simulation Impact Verdict Banner */}
      {isSimulated && (
        <div
          className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 font-mono ${
            createsCycle || createsRing
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {createsCycle || createsRing ? (
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            )}
            <div>
              <div className="font-bold uppercase tracking-wider text-xs">
                {createsCycle
                  ? 'CRITICAL SIMULATION WARNING: DIRECTED CYCLE CREATED'
                  : createsRing
                  ? 'POTENTIALLY SUSPICIOUS RING EXTENSION'
                  : 'BENIGN HYPOTHETICAL TRANSACTION'}
              </div>
              <p className="text-[11px] opacity-90 mt-0.5">
                {createsCycle
                  ? `Adding ${source} → ${target} completes a circular flow loop! Detected ${cycleDiff} new cycle(s).`
                  : createsRing
                  ? `Adding ${source} → ${target} creates a new multi-node strongly connected component!`
                  : `Transaction does not induce cycles or topological rings. Normal fund routing.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-[10px] opacity-70 block uppercase">Source Risk Delta:</span>
              <span className="font-bold">
                {beforeSourceRisk.score} → {afterSourceRisk.score} (+{afterSourceRisk.score - beforeSourceRisk.score})
              </span>
            </div>
            <div>
              <span className="text-[10px] opacity-70 block uppercase">Target Risk Delta:</span>
              <span className="font-bold">
                {beforeTargetRisk.score} → {afterTargetRisk.score} (+{afterTargetRisk.score - beforeTargetRisk.score})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side: BEFORE vs AFTER Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* BEFORE Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
            <span>BEFORE (Current Baseline Graph)</span>
            <span className="text-slate-500 font-normal">
              Cycles: {beforeCycles.cycles.length} · SCC: {beforeSCC.components.filter((c) => c.nodes.length >= 2).length}
            </span>
          </div>
          <div className="h-[440px]">
            <GraphVisualizer
              graph={graph}
              cycleEdgeIds={beforeCycles.cycles.flatMap((c) => c.edgeIds)}
            />
          </div>
        </div>

        {/* AFTER Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-blue-700">
            <span>AFTER SIMULATION (Cloned Graph + Hypothetical Edge)</span>
            {isSimulated ? (
              <span className="text-rose-600 font-bold">
                Cycles: {afterCycles.cycles.length} (+{cycleDiff})
              </span>
            ) : (
              <span className="text-slate-400 font-normal">Awaiting simulation run</span>
            )}
          </div>
          <div className="h-[440px]">
            <GraphVisualizer
              graph={clonedGraph || graph}
              highlightedEdges={simulatedEdgeId ? [simulatedEdgeId] : []}
              cycleEdgeIds={afterCycles.cycles.flatMap((c) => c.edgeIds)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
