import React from 'react';
import { Printer, ShieldAlert, FileText, ArrowRight, CheckCircle2, AlertOctagon, Share2, Layers } from 'lucide-react';
import { AccountInvestigationReport } from '../types/investigation';
import { RiskIndicator } from './RiskIndicator';
import { formatINR } from '../utils/currency';
import { formatTimestamp } from '../utils/date';

interface InvestigationReportProps {
  report: AccountInvestigationReport | null;
  onPrint?: () => void;
}

export const InvestigationReport: React.FC<InvestigationReportProps> = ({ report, onPrint }) => {
  if (!report) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 font-mono select-none">
        No account selected for investigation. Select an account to compile the audit dossier.
      </div>
    );
  }

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6 select-none print:bg-white print:text-black print:border-none print:shadow-none">
      {/* Top Header & Audit Details */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800 print:border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 print:bg-gray-100 print:text-black print:border-gray-400">
              AUDITED FINANCIAL INVESTIGATION DOSSIER
            </span>
            <span className="text-[10px] font-mono text-slate-500">CONFIDENTIAL / ACADEMIC</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-slate-100 print:text-black">
            INVESTIGATION REPORT: {report.account.id}
          </h2>
          <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
            Subject: {report.account.holder} · Category: {report.account.type}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-xs text-slate-400 print:text-gray-600">
            <div>
              Case ID: <span className="font-bold text-cyan-400 print:text-black">{report.investigationId}</span>
            </div>
            <div className="text-[10px]">{formatTimestamp(report.generatedAt)}</div>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all cursor-pointer print:hidden"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 print:border-gray-300">
          <span className="text-[10px] uppercase text-slate-400 block">Connected Accounts:</span>
          <span className="text-lg font-bold text-slate-100 print:text-black">
            {report.metrics.connectedAccounts}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 print:border-gray-300">
          <span className="text-[10px] uppercase text-slate-400 block">Total Transactions:</span>
          <span className="text-lg font-bold text-slate-100 print:text-black">
            {report.metrics.transactionCount}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 print:border-gray-300">
          <span className="text-[10px] uppercase text-slate-400 block">Cycle Involvement:</span>
          <span
            className={`text-lg font-bold ${
              report.metrics.cycleInvolvementCount > 0 ? 'text-rose-400 font-black' : 'text-slate-100 print:text-black'
            }`}
          >
            {report.metrics.cycleInvolvementCount}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 print:border-gray-300">
          <span className="text-[10px] uppercase text-slate-400 block">Longest Chain Depth:</span>
          <span className="text-lg font-bold text-slate-100 print:text-black">
            {report.metrics.longestChainLength} Hops
          </span>
        </div>
      </div>

      {/* Financial Throughput */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 print:border-gray-300 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Total Funds Inflow:</span>
            <span className="text-base font-bold text-emerald-400 print:text-emerald-700">
              {formatINR(report.metrics.totalReceived)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block">Direct Inflow Sources:</span>
            <span className="font-semibold text-slate-300">
              {report.graphEvidence.directNeighbors.inflowFrom.length} Accounts
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 print:border-gray-300 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Total Funds Outflow:</span>
            <span className="text-base font-bold text-amber-400 print:text-amber-700">
              {formatINR(report.metrics.totalSent)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block">Direct Outflow Targets:</span>
            <span className="font-semibold text-slate-300">
              {report.graphEvidence.directNeighbors.outflowTo.length} Accounts
            </span>
          </div>
        </div>
      </div>

      {/* Risk Indicator Panel */}
      <RiskIndicator breakdown={report.riskBreakdown} />

      {/* Graph Evidence Sections */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-black pb-1 border-b border-slate-800">
          <AlertOctagon className="w-4 h-4 text-cyan-400" />
          <span>Topological Graph Evidence & Algorithm Findings</span>
        </div>

        {/* Cycles */}
        {report.graphEvidence.cycles.length > 0 ? (
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/60 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold font-mono text-xs uppercase">
              <ShieldAlert className="w-4 h-4" />
              <span>Confirmed Directed Cycle Involvement ({report.graphEvidence.cycles.length}):</span>
            </div>
            {report.graphEvidence.cycles.map((cyc, idx) => (
              <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs flex justify-between items-center">
                <span className="text-rose-300">{cyc.path}</span>
                <span className="text-slate-400 font-bold">{formatINR(cyc.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 font-mono">
            No cyclic back-edges intersect account [{report.account.id}].
          </div>
        )}

        {/* SCC Group Membership */}
        {report.graphEvidence.sccMembership.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/60 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold font-mono text-xs uppercase">
              <Layers className="w-4 h-4" />
              <span>Strongly Connected Component Ring Group ({report.graphEvidence.sccMembership.length} Accounts):</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-amber-200">
              {report.graphEvidence.sccMembership.join(' ↔ ')}
            </div>
          </div>
        )}
      </div>

      {/* Associated Transactions Ledger */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-black">
          <span>Incident Transaction Ledger ({report.transactions.length})</span>
        </div>

        <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-800 print:max-h-none font-mono text-[11px]">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800 text-[10px] uppercase">
              <tr>
                <th className="py-2 px-3">Tx ID</th>
                <th className="py-2 px-3">Direction</th>
                <th className="py-2 px-3">Counterparty</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3 text-right">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-300">
              {report.transactions.map((tx) => (
                <tr key={tx.id} className={tx.flagged ? 'bg-rose-950/20' : ''}>
                  <td className="py-1.5 px-3 font-semibold text-slate-200">{tx.id}</td>
                  <td className="py-1.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        tx.direction === 'INCOMING'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {tx.direction}
                    </span>
                  </td>
                  <td className="py-1.5 px-3">{tx.counterparty}</td>
                  <td className="py-1.5 px-3 font-bold text-slate-100">{formatINR(tx.amount)}</td>
                  <td className="py-1.5 px-3 text-slate-400">{formatTimestamp(tx.timestamp)}</td>
                  <td className="py-1.5 px-3 text-right">
                    {tx.flagged ? (
                      <span className="text-[10px] text-rose-400 font-bold uppercase">FLAGGED</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 uppercase">NORMAL</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal Signature Block */}
      <div className="pt-6 border-t border-slate-800 print:border-black flex justify-between items-end text-xs font-mono text-slate-500">
        <div>
          <div>Generated by: FRAUDGRAPH Computational Engine</div>
          <div>Academic Course Outcomes: CO3, CO4, CO5 Certified</div>
        </div>
        <div className="text-right">
          <div className="h-8 border-b border-slate-700 w-44 mb-1"></div>
          <div>Lead Financial Crime Auditor</div>
        </div>
      </div>
    </div>
  );
};
