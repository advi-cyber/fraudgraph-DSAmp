import React, { useState } from 'react';
import { Graph } from '../dataStructures/Graph';
import { InvestigationReport } from '../components/InvestigationReport';
import { generateAccountInvestigationReport } from '../services/reportGenerator';
import { FileCheck2, Printer, Search, ShieldCheck, FileDown } from 'lucide-react';
import { exportInvestigationSummaryCSV } from '../services/csvExport';

interface ReportsPageProps {
  graph: Graph;
  allNodeIds: string[];
  initialAccountId?: string;
}

export const Reports: React.FC<ReportsPageProps> = ({
  graph,
  allNodeIds,
  initialAccountId,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<string>(
    initialAccountId || (allNodeIds.length > 0 ? allNodeIds[0] : '')
  );

  const report = selectedAccount && graph.hasNode(selectedAccount)
    ? generateAccountInvestigationReport(graph, selectedAccount)
    : null;

  return (
    <div className="space-y-5">
      {/* Top Banner & Account Selector (Hidden on Print) */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4 print:hidden select-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              AUDIT DOSSIER GENERATOR
            </span>
          </div>
          <h2 className="text-base font-bold font-mono tracking-wide text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <span>FORENSIC INVESTIGATION REPORT & AUDIT TRAIL</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Compile rigorous graph algorithm findings, cycle proofs, SCC cluster memberships, and explainable risk scores into an exportable formal audit document.
          </p>
        </div>

        {/* Account Selector & Bulk Export */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={() => exportInvestigationSummaryCSV(graph)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-800 transition-colors cursor-pointer"
            title="Download complete investigation summary for all network accounts"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export All Accounts CSV</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Target Account:</span>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="bg-slate-50 border border-slate-700 rounded-lg px-3 py-2 text-cyan-400 font-semibold focus:outline-none cursor-pointer"
            >
              {allNodeIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audited Report UI */}
      <InvestigationReport report={report} />
    </div>
  );
};
