import React, { useState } from 'react';
import { Graph } from '../dataStructures/Graph';
import { GraphVisualizer } from '../components/GraphVisualizer';
import { calculateAccountRisk } from '../services/riskAnalyzer';
import { RiskIndicator } from '../components/RiskIndicator';
import { formatINR } from '../utils/currency';
import { Network, UserCheck, ArrowRight, ArrowDownLeft, ArrowUpRight, Search, ShieldAlert } from 'lucide-react';
import { detectDirectedCycles } from '../algorithms/cycleDetection';

interface NetworkAnalysisProps {
  graph: Graph;
  onInvestigateAccount: (accountId: string) => void;
}

export const NetworkAnalysis: React.FC<NetworkAnalysisProps> = ({
  graph,
  onInvestigateAccount,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    graph.getNodeCount() > 0 ? graph.getNodeIds()[0] : ''
  );
  const [filterCyclesOnly, setFilterCyclesOnly] = useState(false);

  React.useEffect(() => {
    const nodeIds = graph.getNodeIds();
    setFilterCyclesOnly(false);
    if (nodeIds.length > 0 && !nodeIds.includes(selectedNodeId)) {
      setSelectedNodeId(nodeIds[0]);
    } else if (nodeIds.length === 0) {
      setSelectedNodeId('');
    }
  }, [graph]);


  const cycleResult = detectDirectedCycles(graph);
  const cycleEdges = cycleResult.cycles.flatMap((c) => c.edgeIds);

  const selectedNode = selectedNodeId ? graph.getNode(selectedNodeId) : null;
  const inEdges = selectedNodeId ? graph.getIncomingEdges(selectedNodeId) : [];
  const outEdges = selectedNodeId ? graph.getOutgoingEdges(selectedNodeId) : [];

  const riskBreakdown = selectedNodeId
    ? calculateAccountRisk(graph, selectedNodeId, cycleResult)
    : null;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wide">
              INTERACTIVE DIRECTED GRAPH NETWORK TOPOLOGY
            </h2>
            <p className="text-xs text-slate-500">
              Accounts as vertices |V|, transactions as directed weighted edges |E|. Click any node to inspect local topology.
            </p>
          </div>
        </div>

        {/* Quick Node Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-600">Inspect Node:</span>
          <select
            value={selectedNodeId}
            onChange={(e) => setSelectedNodeId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-blue-700 font-bold focus:outline-none"
          >
            {graph.getNodeIds().map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-Column Canvas & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Expansive React Flow Canvas (8 cols) */}
        <div className="lg:col-span-8 h-[640px]">
          <GraphVisualizer
            graph={graph}
            highlightedNodes={selectedNodeId ? [selectedNodeId] : []}
            highlightedEdges={[...inEdges.map((e) => e.id), ...outEdges.map((e) => e.id)]}
            cycleEdgeIds={cycleEdges}
            onSelectNode={(id) => setSelectedNodeId(id)}
            filterCyclesOnly={filterCyclesOnly}
            onToggleFilterCycles={() => setFilterCyclesOnly(!filterCyclesOnly)}
          />
        </div>

        {/* Right: Detailed Node Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 font-mono select-none">
              {/* Header */}
              <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                    Account Inspector
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{selectedNode.id}</h3>
                  <div className="text-[11px] text-slate-500 font-sans truncate max-w-[200px]">
                    {selectedNode.metadata.accountHolder || selectedNode.id}
                  </div>
                </div>

                <button
                  onClick={() => onInvestigateAccount(selectedNode.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-sans font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-sm transition-all"
                >
                  Full Audit
                </button>
              </div>

              {/* Degrees & Balances */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase mb-0.5">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In-Degree:</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-700">
                    {inEdges.length} ({formatINR(graph.getTotalInAmount(selectedNode.id))})
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase mb-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                    <span>Out-Degree:</span>
                  </div>
                  <div className="text-sm font-bold text-amber-800">
                    {outEdges.length} ({formatINR(graph.getTotalOutAmount(selectedNode.id))})
                  </div>
                </div>
              </div>

              {/* Explainable Risk Meter */}
              {riskBreakdown && <RiskIndicator breakdown={riskBreakdown} compact={true} />}

              {/* Direct Inflow Neighbors */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                  Inflow Sources ({inEdges.length}):
                </span>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {inEdges.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => setSelectedNodeId(e.source)}
                      className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] flex justify-between items-center cursor-pointer transition-colors"
                    >
                      <span className="text-slate-800 font-semibold">{e.source}</span>
                      <span className="text-emerald-700 font-semibold">{formatINR(e.weight)}</span>
                    </div>
                  ))}
                  {inEdges.length === 0 && (
                    <span className="text-slate-400 text-xs">No direct inbound edges</span>
                  )}
                </div>
              </div>

              {/* Direct Outflow Neighbors */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                  Outflow Destinations ({outEdges.length}):
                </span>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {outEdges.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => setSelectedNodeId(e.target)}
                      className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] flex justify-between items-center cursor-pointer transition-colors"
                    >
                      <span className="text-slate-800 font-semibold">{e.target}</span>
                      <span className="text-amber-800 font-semibold">{formatINR(e.weight)}</span>
                    </div>
                  ))}
                  {outEdges.length === 0 && (
                    <span className="text-slate-400 text-xs">No direct outbound edges</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-white border border-slate-200 text-center text-slate-500 font-mono text-xs shadow-sm">
              Select a node to inspect local degree and balance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
