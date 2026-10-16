import React, { useState, useMemo } from 'react';
import { Graph } from '../dataStructures/Graph';
import { generateAccountInvestigationReport } from '../services/reportGenerator';
import { RiskIndicator } from '../components/RiskIndicator';
import { GraphVisualizer } from '../components/GraphVisualizer';
import {
  SearchCode,
  Network,
  ArrowDownLeft,
  ArrowUpRight,
  Compass,
  Receipt,
  FileCheck2,
} from 'lucide-react';
import { formatCompactINR } from '../utils/currency';
import { formatTimestamp } from '../utils/date';


interface AccountInvestigationProps {
  graph: Graph;
  allNodeIds: string[];
  selectedAccountId: string;
  onSelectAccount: (accountId: string) => void;
  onNavigateToReports: () => void;
}

export const AccountInvestigation: React.FC<AccountInvestigationProps> = ({
  graph,
  allNodeIds,
  selectedAccountId,
  onSelectAccount,
  onNavigateToReports,
}) => {
  const activeId = selectedAccountId || allNodeIds[0] || '';

  // Mode A (Full Network) vs Mode B (Local Neighborhood Investigation)
  const [viewMode, setViewMode] = useState<'LOCAL' | 'FULL'>('LOCAL');
  // Hop depth for local BFS exploration: 1 = direct incident, 2 = 2-hops, 0 = all reachable
  const [hopDepth, setHopDepth] = useState<number>(2);

  const report = useMemo(() => {
    return activeId && graph.hasNode(activeId)
      ? generateAccountInvestigationReport(graph, activeId)
      : null;
  }, [graph, activeId]);

  // Direct incident edges
  const inEdges = useMemo(() => (activeId ? graph.getIncomingEdges(activeId) : []), [graph, activeId]);
  const outEdges = useMemo(() => (activeId ? graph.getOutgoingEdges(activeId) : []), [graph, activeId]);
  const connectedEdgeIds = useMemo(() => [...inEdges.map((e) => e.id), ...outEdges.map((e) => e.id)], [inEdges, outEdges]);

  // BFS Reachability with bounded depth
  const { reachableNodes, nodeDepths } = useMemo(() => {
    if (!activeId || !graph.hasNode(activeId)) {
      return { reachableNodes: [], nodeDepths: new Map<string, number>() };
    }
    const depths = new Map<string, number>();
    depths.set(activeId, 0);
    const queue: string[] = [activeId];
    const visited = new Set<string>([activeId]);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const d = depths.get(curr)!;
      if (hopDepth > 0 && d >= hopDepth) continue;

      for (const n of graph.getNeighbors(curr)) {
        if (!visited.has(n)) {
          visited.add(n);
          depths.set(n, d + 1);
          queue.push(n);
        }
      }
    }
    return { reachableNodes: Array.from(visited), nodeDepths: depths };
  }, [graph, activeId, hopDepth]);

  // Direct upstream sources
  const upstreamSources = useMemo(() => Array.from(new Set(inEdges.map((e) => e.source))), [inEdges]);
  const downstreamTargets = useMemo(() => Array.from(new Set(outEdges.map((e) => e.target))), [outEdges]);

  // Construct deliberate, scoped local subgraph for Mode B
  const localGraph = useMemo(() => {
    if (!activeId || !graph.hasNode(activeId)) return new Graph();

    const localNodeIds = new Set<string>([activeId, ...upstreamSources, ...reachableNodes]);
    const g = new Graph();

    for (const id of localNodeIds) {
      const n = graph.getNode(id);
      if (n) {
        g.addNode(id, { ...n.metadata, label: n.label });
      }
    }


    for (const edge of graph.getEdges()) {
      if (localNodeIds.has(edge.source) && localNodeIds.has(edge.target)) {
        g.addEdge(edge.source, edge.target, edge.weight, edge.metadata, edge.id);
      }
    }

    return g;
  }, [graph, activeId, upstreamSources, reachableNodes]);

  if (!report) {
    return (
      <div className="p-12 bg-white border border-slate-200 rounded-xl text-center text-slate-500 font-mono shadow-xs">
        Select a valid account from the network to commence investigation.
      </div>
    );
  }

  // Active graph depending on view mode
  const activeGraph = viewMode === 'LOCAL' ? localGraph : graph;
  const highlightedNodeIds = viewMode === 'LOCAL' ? reachableNodes : report.graphEvidence.reachabilityBFS;
  const highlightedEdgeIds = connectedEdgeIds;

  return (
    <div className="space-y-5 select-none font-mono">
      {/* Top Banner: Account Identity & Investigation Control */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              DSA FORENSIC TRACE ENGINE · AUDIT DOSSIER
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono">
            <SearchCode className="w-5 h-5 text-blue-600 shrink-0" />
            <span>ACCOUNT INVESTIGATION: {report.account.id}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Holder: <strong className="text-slate-800">{report.account.holder}</strong> · Type:{' '}
            <span className="font-semibold text-slate-700">{report.account.type}</span> · Risk Classification:{' '}
            <span
              className={`font-bold ${
                report.riskBreakdown.score >= 60
                  ? 'text-rose-600'
                  : report.riskBreakdown.score >= 30
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {report.riskBreakdown.level} ({report.riskBreakdown.score}/100)
            </span>
          </p>

        </div>

        {/* Account Selector & Navigation Actions */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-600 font-sans">Switch Account:</span>
          <select
            value={activeId}
            onChange={(e) => onSelectAccount(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-blue-700 font-bold focus:outline-none cursor-pointer"
          >
            {allNodeIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>

          <button
            onClick={onNavigateToReports}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-sans font-semibold cursor-pointer shadow-xs transition-all"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Formal Audit Report</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase block font-sans">Direct Connections</span>
          <span className="text-xl font-bold text-blue-700 mt-0.5 block font-mono">
            {report.metrics.connectedAccounts}
          </span>
          <span className="text-[9px] text-slate-400">In: {inEdges.length} | Out: {outEdges.length}</span>
        </div>

        <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase block font-sans">Transactions</span>
          <span className="text-xl font-bold text-slate-900 mt-0.5 block font-mono">
            {report.metrics.transactionCount}
          </span>
          <span className="text-[9px] text-slate-400">Incident Volume ₹{formatCompactINR(report.metrics.totalReceived + report.metrics.totalSent)}</span>

        </div>

        <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase block font-sans">Cycle Involvement</span>
          <span
            className={`text-xl font-bold mt-0.5 block font-mono ${
              report.metrics.cycleInvolvementCount > 0 ? 'text-rose-700' : 'text-slate-400'
            }`}
          >
            {report.metrics.cycleInvolvementCount}
          </span>
          <span className="text-[9px] text-slate-400">3-State DFS Back-Edges</span>
        </div>

        <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase block font-sans">Suspicious Rings</span>
          <span
            className={`text-xl font-bold mt-0.5 block font-mono ${
              report.metrics.suspiciousRingsCount > 0 ? 'text-amber-800' : 'text-slate-400'
            }`}
          >
            {report.metrics.suspiciousRingsCount}
          </span>
          <span className="text-[9px] text-slate-400">Tarjan SCC Cluster</span>
        </div>

        <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase block font-sans">Forward Reachable</span>
          <span className="text-xl font-bold text-indigo-700 mt-0.5 block font-mono">
            {report.graphEvidence.reachabilityBFS.length} Nodes
          </span>
          <span className="text-[9px] text-slate-400">Full BFS Forward Tree</span>
        </div>

        <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase block font-sans">Out/In Ratio</span>
          <span className="text-xl font-bold text-emerald-700 mt-0.5 block font-mono">
            {report.metrics.inOutRatio}
          </span>
          <span className="text-[9px] text-slate-400">Outflow ÷ Inflow</span>
        </div>
      </div>

      {/* Main Workspace Area: Network Canvas (Left 7 Cols) + Forensic Evidence & Ledger (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Graph Canvas with Mode Switcher (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          {/* Mode Switcher & Depth Selector Header */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-sans">
              <span className="text-slate-500 font-semibold mr-1">Scope:</span>
              <button
                onClick={() => setViewMode('LOCAL')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'LOCAL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Local Subgraph ({localGraph.getNodeCount()} Accounts)</span>
              </button>

              <button
                onClick={() => setViewMode('FULL')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'FULL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Full Enterprise Network ({graph.getNodeCount()} Accounts)</span>
              </button>
            </div>

            {/* Hop Depth Selector when in Local Mode */}
            {viewMode === 'LOCAL' && (
              <div className="flex items-center gap-1 text-[11px] font-sans">
                <span className="text-slate-500 mr-1">Depth:</span>
                {[
                  { depth: 1, label: '1 Hop' },
                  { depth: 2, label: '2 Hops' },
                  { depth: 0, label: 'All Reachable' },
                ].map(({ depth, label }) => (
                  <button
                    key={depth}
                    onClick={() => setHopDepth(depth)}
                    className={`px-2 py-1 rounded-md text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                      hopDepth === depth
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mode Guidance Subtitle */}
          <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-sans">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>
                Investigating <strong className="text-slate-900 font-mono">{activeId}</strong>
                {viewMode === 'LOCAL'
                  ? ` · Displaying ${localGraph.getNodeCount()} local vertices and ${localGraph.getEdgeCount()} incident transactions`
                  : ` · Displaying full enterprise topology with reachability highlighted`}
              </span>
            </span>

            {viewMode === 'FULL' && (
              <button
                onClick={() => setViewMode('LOCAL')}
                className="text-blue-600 hover:text-blue-700 font-semibold underline text-[11px] cursor-pointer"
              >
                Focus on local neighborhood
              </button>
            )}
          </div>

          {/* Graph Visualizer Canvas */}
          <div className="h-[480px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-xs">
            <GraphVisualizer
              graph={activeGraph}
              highlightedNodes={highlightedNodeIds}
              highlightedEdges={highlightedEdgeIds}
              currentNode={activeId}
              onSelectNode={onSelectAccount}
            />
          </div>

          {/* Connected Accounts Quick Jump Chips */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block font-sans">
              Immediate Counterparties (Click to investigate):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {upstreamSources.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <ArrowDownLeft className="w-3 h-3" /> Inflow Sources:
                  </span>
                  {upstreamSources.map((src) => (
                    <button
                      key={src}
                      onClick={() => onSelectAccount(src)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-800 text-[11px] font-mono transition-colors border border-slate-200 cursor-pointer"
                    >
                      {src}
                    </button>
                  ))}
                </div>
              )}

              {downstreamTargets.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap ml-2">
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> Outflow Targets:
                  </span>
                  {downstreamTargets.map((tgt) => (
                    <button
                      key={tgt}
                      onClick={() => onSelectAccount(tgt)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-100 text-slate-800 hover:text-blue-800 text-[11px] font-mono transition-colors border border-slate-200 cursor-pointer"
                    >
                      {tgt}
                    </button>
                  ))}
                </div>
              )}

              {upstreamSources.length === 0 && downstreamTargets.length === 0 && (
                <span className="text-slate-400 italic">No direct counterparty transactions found.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Explainable Risk, Evidence, and Incident Ledger (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Risk Meter Breakdown */}
          <RiskIndicator breakdown={report.riskBreakdown} />

          {/* Graph Evidence Checklist */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-700 block font-sans">
              Algorithmic Graph Evidence:
            </span>

            <div className="space-y-2 font-sans">
              <div className="flex items-start gap-2">
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    report.metrics.cycleInvolvementCount > 0 ? 'bg-rose-500' : 'bg-slate-300'
                  }`}
                />
                <span className="text-slate-700 text-xs">
                  <strong className="text-slate-900">Cycle Involvement:</strong>{' '}
                  {report.metrics.cycleInvolvementCount > 0
                    ? `Participates in ${report.metrics.cycleInvolvementCount} circular routing loop(s).`
                    : 'No circular routing loops detected.'}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    report.graphEvidence.sccMembership.length > 0 ? 'bg-amber-500' : 'bg-slate-300'
                  }`}
                />
                <span className="text-slate-700 text-xs">
                  <strong className="text-slate-900">SCC Ring Membership:</strong>{' '}
                  {report.graphEvidence.sccMembership.length > 0
                    ? `Member of strongly connected component [${report.graphEvidence.sccMembership.join(', ')}].`
                    : 'Not part of any multi-node strongly connected ring.'}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    report.metrics.longestChainLength >= 4 ? 'bg-indigo-500' : 'bg-slate-300'
                  }`}
                />
                <span className="text-slate-700 text-xs">
                  <strong className="text-slate-900">Long Transaction Chain:</strong>{' '}
                  DFS trace extends {report.metrics.longestChainLength} consecutive account hops.
                </span>
              </div>
            </div>
          </div>

          {/* Incident Transactions Ledger */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-sans font-bold text-slate-900">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span>Incident Transactions ({inEdges.length + outEdges.length})</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Real Audit Ledger</span>
            </div>

            <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
              {/* Outgoing transactions */}
              {outEdges.map((e) => (
                <div
                  key={e.id}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                        OUT
                      </span>
                      <span className="text-slate-600 font-sans">To:</span>
                      <button
                        onClick={() => onSelectAccount(e.target)}
                        className="font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        {e.target}
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans truncate max-w-[190px]">
                      {e.metadata.description || 'Transfer'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-700 block">
                      -₹{formatCompactINR(e.weight)}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {formatTimestamp(e.metadata.timestamp || '')}
                    </span>
                  </div>
                </div>
              ))}

              {/* Incoming transactions */}
              {inEdges.map((e) => (
                <div
                  key={e.id}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        IN
                      </span>
                      <span className="text-slate-600 font-sans">From:</span>
                      <button
                        onClick={() => onSelectAccount(e.source)}
                        className="font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        {e.source}
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans truncate max-w-[190px]">
                      {e.metadata.description || 'Transfer'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700 block">
                      +₹{formatCompactINR(e.weight)}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {formatTimestamp(e.metadata.timestamp || '')}
                    </span>
                  </div>
                </div>
              ))}

              {inEdges.length === 0 && outEdges.length === 0 && (
                <div className="p-4 text-center text-slate-400 italic font-sans">
                  No incident transactions found for this account.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
