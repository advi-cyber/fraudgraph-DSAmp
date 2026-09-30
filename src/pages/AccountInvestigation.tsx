import React, { useState } from 'react';
import { Graph } from '../dataStructures/Graph';
import { generateAccountInvestigationReport } from '../services/reportGenerator';
import { RiskIndicator } from '../components/RiskIndicator';
import { GraphVisualizer } from '../components/GraphVisualizer';
import { SearchCode, Users, ArrowRight, ShieldAlert, Layers, Route, ArrowDownLeft, ArrowUpRight, Activity } from 'lucide-react';
import { formatINR } from '../utils/currency';
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
  const report = activeId && graph.hasNode(activeId)
    ? generateAccountInvestigationReport(graph, activeId)
    : null;

  if (!report) {
    return (
      <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-500 font-mono">
        Select a valid account from the network to commence investigation.
      </div>
    );
  }

  const inEdges = graph.getIncomingEdges(activeId);
  const outEdges = graph.getOutgoingEdges(activeId);
  const connectedEdgeIds = [...inEdges.map((e) => e.id), ...outEdges.map((e) => e.id)];
  const reachableBfsNodes = report.graphEvidence.reachabilityBFS;

  return (
    <div className="space-y-5 select-none font-mono">
      {/* Investigation Control Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              DSA FORENSIC TRACE ENGINE
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <SearchCode className="w-5 h-5 text-cyan-400" />
            <span>ACCOUNT INVESTIGATION MODE: {report.account.id}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Holder: <strong className="text-slate-200">{report.account.holder}</strong> · Type: {report.account.type}
          </p>
        </div>

        {/* Account Selector */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">Investigate Account:</span>
          <select
            value={activeId}
            onChange={(e) => onSelectAccount(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-cyan-400 font-bold focus:outline-none cursor-pointer"
          >
            {allNodeIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>

          <button
            onClick={onNavigateToReports}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-sans font-semibold cursor-pointer shadow-md shadow-cyan-600/20"
          >
            View Formal Audit Report
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid (Section 14 Specification) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Connected Accounts:</span>
          <span className="text-xl font-bold text-cyan-400 mt-0.5 block">
            {report.metrics.connectedAccounts}
          </span>
          <span className="text-[9px] text-slate-500">Direct In/Out Degree</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Total Transactions:</span>
          <span className="text-xl font-bold text-slate-100 mt-0.5 block">
            {report.metrics.transactionCount}
          </span>
          <span className="text-[9px] text-slate-500">Incident Edges</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Cycle Involvement:</span>
          <span
            className={`text-xl font-bold mt-0.5 block ${
              report.metrics.cycleInvolvementCount > 0 ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            {report.metrics.cycleInvolvementCount}
          </span>
          <span className="text-[9px] text-slate-500">3-State DFS Back-Edges</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Suspicious Rings:</span>
          <span
            className={`text-xl font-bold mt-0.5 block ${
              report.metrics.suspiciousRingsCount > 0 ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            {report.metrics.suspiciousRingsCount}
          </span>
          <span className="text-[9px] text-slate-500">Tarjan SCC Cluster</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Longest Chain:</span>
          <span className="text-xl font-bold text-indigo-400 mt-0.5 block">
            {report.metrics.longestChainLength} Hops
          </span>
          <span className="text-[9px] text-slate-500">DFS Max Exploration</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">In/Out Balance Ratio:</span>
          <span className="text-xl font-bold text-emerald-400 mt-0.5 block">
            {report.metrics.inOutRatio}
          </span>
          <span className="text-[9px] text-slate-500">Outflow ÷ Inflow</span>
        </div>
      </div>

      {/* Middle Layout: Graph Subgraph (Left) + Explainable Risk Meter (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Local Neighborhood Graph (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-sans">
            <span className="font-mono font-bold text-slate-200 uppercase">
              Local Subgraph Reachability (BFS & Incident Edges)
            </span>
            <span className="font-mono text-[11px] text-cyan-400">
              Reachable: {reachableBfsNodes.length} nodes
            </span>
          </div>

          <div className="h-[460px]">
            <GraphVisualizer
              graph={graph}
              highlightedNodes={reachableBfsNodes}
              highlightedEdges={connectedEdgeIds}
              currentNode={activeId}
              onSelectNode={onSelectAccount}
            />
          </div>
        </div>

        {/* Explainable Risk Engine (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <RiskIndicator breakdown={report.riskBreakdown} />

          {/* Graph Evidence Checklist */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Supporting Graph Evidence:
            </span>

            <div className="space-y-1.5 font-sans">
              <div className="flex items-start gap-2">
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    report.metrics.cycleInvolvementCount > 0 ? 'bg-rose-400' : 'bg-slate-600'
                  }`}
                />
                <span className="text-slate-300">
                  <strong>Cycle Involvement:</strong>{' '}
                  {report.metrics.cycleInvolvementCount > 0
                    ? `Participates in ${report.metrics.cycleInvolvementCount} circular routing loop(s).`
                    : 'No circular routing loops detected.'}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    report.graphEvidence.sccMembership.length > 0 ? 'bg-amber-400' : 'bg-slate-600'
                  }`}
                />
                <span className="text-slate-300">
                  <strong>SCC Ring Membership:</strong>{' '}
                  {report.graphEvidence.sccMembership.length > 0
                    ? `Member of strongly connected component [${report.graphEvidence.sccMembership.join(', ')}].`
                    : 'Not part of any multi-node strongly connected ring.'}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    report.metrics.longestChainLength >= 4 ? 'bg-indigo-400' : 'bg-slate-600'
                  }`}
                />
                <span className="text-slate-300">
                  <strong>Long Transaction Chain:</strong>{' '}
                  DFS trace extends {report.metrics.longestChainLength} consecutive account hops.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
