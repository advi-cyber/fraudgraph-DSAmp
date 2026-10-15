import React, { useState } from 'react';
import { Graph } from '../dataStructures/Graph';
import { calculateAccountRisk } from '../services/riskAnalyzer';
import { detectDirectedCycles } from '../algorithms/cycleDetection';
import { runTarjanSCC } from '../algorithms/stronglyConnectedComponents';
import { formatINR } from '../utils/currency';
import { formatTimestamp } from '../utils/date';
import {
  ShieldAlert,
  User,
  Building2,
  Store,
  Skull,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Search,
  Receipt,
  Layers,
  ExternalLink,
} from 'lucide-react';

interface AccountDetailPanelProps {
  graph: Graph;
  selectedAccountId: string | null;
  selectedEdgeId: string | null;
  onSelectAccount: (accountId: string) => void;
  onNavigateToFullInvestigation: (accountId: string) => void;
  onHighlightNeighbors?: (accountId: string) => void;
}

export const AccountDetailPanel: React.FC<AccountDetailPanelProps> = ({
  graph,
  selectedAccountId,
  selectedEdgeId,
  onSelectAccount,
  onNavigateToFullInvestigation,
  onHighlightNeighbors,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'EVIDENCE' | 'INFLOW' | 'OUTFLOW'>('EVIDENCE');

  // If edge is selected
  const selectedEdge = selectedEdgeId ? graph.getEdges().find((e) => e.id === selectedEdgeId) : null;

  // If node is selected
  const node = selectedAccountId && graph.hasNode(selectedAccountId) ? graph.getNode(selectedAccountId) : null;

  if (selectedEdge) {
    const cycleRes = detectDirectedCycles(graph);
    const isCycleEdge = cycleRes.cycles.some((c) => c.edgeIds.includes(selectedEdge.id));

    return (
      <div className="bg-white border border-slate-800 rounded-xl p-4 shadow-sm select-none font-mono space-y-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${isCycleEdge ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-cyan-950 text-cyan-400 border-cyan-800'}`}>
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Transaction Inspection
              </span>
              <h4 className="text-xs font-bold text-slate-100">{selectedEdge.transactionId || selectedEdge.id}</h4>
            </div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
            isCycleEdge ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-slate-100 text-slate-300 border-slate-700'
          }`}>
            {isCycleEdge ? 'Cyclic Edge' : 'Normal Flow'}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-700 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => onSelectAccount(selectedEdge.source)}>
            <span className="text-[10px] text-slate-400 block">Sender Account:</span>
            <span className="font-bold text-slate-100 hover:text-cyan-400">{selectedEdge.source}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-cyan-400" />
          <div className="text-right cursor-pointer" onClick={() => onSelectAccount(selectedEdge.target)}>
            <span className="text-[10px] text-slate-400 block">Receiver Account:</span>
            <span className="font-bold text-slate-100 hover:text-cyan-400">{selectedEdge.target}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase">Transfer Amount:</span>
            <span className="font-bold text-slate-100 text-sm">{formatINR(selectedEdge.weight)}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase">Channel Type:</span>
            <span className="font-bold text-cyan-400">{selectedEdge.metadata.type || 'TRANSFER'}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-700 text-xs">
          <span className="text-[10px] text-slate-400 block uppercase mb-0.5">Timestamp & Description:</span>
          <div className="text-slate-200">{formatTimestamp(selectedEdge.timestamp)}</div>
          <div className="text-slate-400 text-[11px] font-sans mt-1">
            "{selectedEdge.metadata.description || 'General Wire Remittance'}"
          </div>
        </div>
      </div>
    );
  }

  if (!node || !selectedAccountId) {
    return (
      <div className="bg-white border border-slate-800 rounded-xl p-6 shadow-sm select-none text-center space-y-3 font-mono">
        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
          <Search className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
            Account Investigation Panel
          </h4>
          <p className="text-[11px] text-slate-400 font-sans mt-1 max-w-xs mx-auto">
            Click any account node on the canvas to inspect its rule-based risk score, topological evidence, and transactions.
          </p>
        </div>
      </div>
    );
  }

  const cycleResult = detectDirectedCycles(graph);
  const sccResult = runTarjanSCC(graph);
  const risk = calculateAccountRisk(graph, selectedAccountId, cycleResult, sccResult);

  const inEdges = graph.getIncomingEdges(selectedAccountId);
  const outEdges = graph.getOutgoingEdges(selectedAccountId);
  const totalIn = graph.getTotalInAmount(selectedAccountId);
  const totalOut = graph.getTotalOutAmount(selectedAccountId);
  const cyclesInvolved = cycleResult.cycles.filter((c) => c.nodes.includes(selectedAccountId));
  const sccGroup = sccResult.components.find(
    (c) => c.nodes.includes(selectedAccountId) && c.nodes.length >= 2
  );

  const getAccountIcon = () => {
    switch (node.metadata.accountType) {
      case 'SHELL_COMPANY':
        return <Skull className="w-4 h-4 text-rose-500" />;
      case 'MULE_CANDIDATE':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'BUSINESS':
        return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'MERCHANT':
        return <Store className="w-4 h-4 text-emerald-500" />;
      default:
        return <User className="w-4 h-4 text-slate-500" />;
    }
  };

  const getRiskBadge = () => {
    switch (risk.level) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'MEDIUM':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      default:
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
    }
  };

  return (
    <div className="bg-white border border-slate-800 rounded-xl p-4 shadow-sm select-none font-mono space-y-4">
      {/* Account Profile Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 border border-slate-700">
            {getAccountIcon()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-100">{selectedAccountId}</h4>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border ${getRiskBadge()}`}>
                {risk.score}/100 · {risk.level}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans truncate max-w-[200px]" title={node.metadata.accountHolder}>
              {node.metadata.accountHolder || selectedAccountId}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToFullInvestigation(selectedAccountId)}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-800 transition-colors cursor-pointer"
          title="Open complete forensic dossier"
        >
          <span>Dossier</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Primary In/Out Flow Cards */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
              <span>Inflow</span>
            </span>
            <span className="text-[10px] text-slate-500">({inEdges.length} txs)</span>
          </div>
          <span className="text-xs font-bold text-emerald-500">{formatINR(totalIn)}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-amber-500" />
              <span>Outflow</span>
            </span>
            <span className="text-[10px] text-slate-500">({outEdges.length} txs)</span>
          </div>
          <span className="text-xs font-bold text-amber-500">{formatINR(totalOut)}</span>
        </div>
      </div>

      {/* Sub Tabs: Evidence vs Inflow vs Outflow */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1 text-[10px] bg-slate-100 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveSubTab('EVIDENCE')}
            className={`flex-1 py-1 rounded cursor-pointer transition-colors ${
              activeSubTab === 'EVIDENCE' ? 'bg-white text-slate-100 font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Triggered Rules ({risk.factors.filter((f) => f.triggered).length})
          </button>
          <button
            onClick={() => setActiveSubTab('INFLOW')}
            className={`flex-1 py-1 rounded cursor-pointer transition-colors ${
              activeSubTab === 'INFLOW' ? 'bg-white text-slate-100 font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inflow ({inEdges.length})
          </button>
          <button
            onClick={() => setActiveSubTab('OUTFLOW')}
            className={`flex-1 py-1 rounded cursor-pointer transition-colors ${
              activeSubTab === 'OUTFLOW' ? 'bg-white text-slate-100 font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Outflow ({outEdges.length})
          </button>
        </div>

        {activeSubTab === 'EVIDENCE' && (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {risk.factors.filter((f) => f.triggered).length > 0 ? (
              risk.factors
                .filter((f) => f.triggered)
                .map((factor, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-100 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{factor.title}</span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-500">+{factor.points} pts</span>
                    </div>
                    <p className="text-[10px] font-sans text-slate-400 leading-tight">
                      {factor.description}
                    </p>
                    {factor.supportingEvidence && (
                      <div className="text-[9px] text-cyan-400 bg-cyan-950 p-1 rounded border border-cyan-800/60 truncate">
                        Evidence: {factor.supportingEvidence}
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="p-4 rounded-lg bg-emerald-950 border border-emerald-800 text-center text-xs text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero suspicious rules triggered. Clean ordinary flow profile.</span>
              </div>
            )}

            {cyclesInvolved.length > 0 && (
              <div className="p-2.5 rounded-lg bg-rose-950 border border-rose-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-400 block">
                  Directed Cycle Membership ({cyclesInvolved.length}):
                </span>
                {cyclesInvolved.map((c, i) => (
                  <div key={i} className="text-[10px] text-rose-300 truncate">
                    {c.pathDescription}
                  </div>
                ))}
              </div>
            )}

            {sccGroup && (
              <div className="p-2 rounded-lg bg-amber-950 border border-amber-800 text-[10px] text-amber-300">
                <span className="font-bold">SCC Ring Cluster:</span> {sccGroup.nodes.join(' ↔ ')}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'INFLOW' && (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {inEdges.length > 0 ? (
              inEdges.map((e) => (
                <div
                  key={e.id}
                  onClick={() => onSelectAccount(e.source)}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-700 flex items-center justify-between text-xs hover:border-slate-500 cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] text-slate-400 block">From: {e.source}</span>
                    <span className="text-[10px] text-slate-500">Tx {e.transactionId}</span>
                  </div>
                  <span className="font-bold text-emerald-500">{formatINR(e.weight)}</span>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">No incoming transactions.</div>
            )}
          </div>
        )}

        {activeSubTab === 'OUTFLOW' && (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {outEdges.length > 0 ? (
              outEdges.map((e) => (
                <div
                  key={e.id}
                  onClick={() => onSelectAccount(e.target)}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-700 flex items-center justify-between text-xs hover:border-slate-500 cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] text-slate-400 block">To: {e.target}</span>
                    <span className="text-[10px] text-slate-500">Tx {e.transactionId}</span>
                  </div>
                  <span className="font-bold text-amber-500">{formatINR(e.weight)}</span>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">No outgoing transactions.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
