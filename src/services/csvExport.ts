import { Graph } from '../dataStructures/Graph';
import { calculateAccountRisk } from './riskAnalyzer';
import { detectDirectedCycles } from '../algorithms/cycleDetection';
import { runTarjanSCC } from '../algorithms/stronglyConnectedComponents';
import { AccountInvestigationReport } from '../types/investigation';

/**
 * Generates and downloads a comprehensive CSV investigation summary report
 * based on currently calculated graph analytics.
 */
export function exportInvestigationSummaryCSV(graph: Graph): void {
  const cycleResult = detectDirectedCycles(graph);
  const sccResult = runTarjanSCC(graph);
  const nodeIds = graph.getNodeIds();

  const headers = [
    'Account ID',
    'Account Holder',
    'Account Type',
    'Risk Score',
    'Risk Category',
    'In-Degree',
    'Out-Degree',
    'Total Inflow (INR)',
    'Total Outflow (INR)',
    'Triggered Rules',
    'Supporting Transactions',
    'Cycle Involvement',
    'Cycle Ordered Sequence',
    'SCC Group Members',
  ];

  const rows: string[][] = [];

  for (const id of nodeIds) {
    const node = graph.getNode(id);
    const risk = calculateAccountRisk(graph, id, cycleResult, sccResult);
    const inDeg = graph.getInDegree(id);
    const outDeg = graph.getOutDegree(id);
    const totalIn = graph.getTotalInAmount(id);
    const totalOut = graph.getTotalOutAmount(id);

    const triggeredFactors = risk.factors.filter((f) => f.triggered);
    const triggeredRulesStr = triggeredFactors.map((f) => f.title).join('; ');
    const supportingTxsStr = Array.from(
      new Set(triggeredFactors.flatMap((f) => f.supportingTransactions || []))
    ).join('; ');

    const cyclesInvolved = cycleResult.cycles.filter((c) => c.nodes.includes(id));
    const cycleCount = cyclesInvolved.length;
    const cyclePathsStr = cyclesInvolved.map((c) => c.pathDescription).join(' | ');

    const sccGroup = sccResult.components.find((c) => c.nodes.includes(id) && c.nodes.length >= 2);
    const sccGroupStr = sccGroup ? sccGroup.nodes.join(' -> ') : 'None';

    rows.push([
      id,
      node?.metadata.accountHolder || id,
      node?.metadata.accountType || 'PERSONAL',
      String(risk.score),
      risk.level,
      String(inDeg),
      String(outDeg),
      String(totalIn),
      String(totalOut),
      escapeCSVField(triggeredRulesStr || 'None'),
      escapeCSVField(supportingTxsStr || 'None'),
      String(cycleCount),
      escapeCSVField(cyclePathsStr || 'None'),
      escapeCSVField(sccGroupStr),
    ]);
  }

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(csvContent, `fraudgraph_investigation_summary_${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Exports a single targeted account forensic report as a detailed CSV.
 */
export function exportSingleAccountCSV(report: AccountInvestigationReport): void {
  const metaRows = [
    ['--- FRAUDGRAPH ACCOUNT AUDIT REPORT ---'],
    ['Investigation ID', report.investigationId],
    ['Generated At', report.generatedAt],
    ['Account ID', report.account.id],
    ['Account Holder', report.account.holder],
    ['Account Type', report.account.type],
    ['Deterministic Risk Score', `${report.riskBreakdown.score}/100`],
    ['Risk Level', report.riskBreakdown.level],
    ['Summary', escapeCSVField(report.riskBreakdown.summary)],
    ['Disclaimer', escapeCSVField(report.riskBreakdown.disclaimer)],
    [''],
    ['--- TOPOLOGICAL METRICS ---'],
    ['Connected Accounts', String(report.metrics.connectedAccounts)],
    ['Total Transactions', String(report.metrics.transactionCount)],
    ['Total Sent (INR)', String(report.metrics.totalSent)],
    ['Total Received (INR)', String(report.metrics.totalReceived)],
    ['Cycle Involvement Count', String(report.metrics.cycleInvolvementCount)],
    ['SCC Ring Size', String(report.graphEvidence.sccMembership.length)],
    ['Longest Chain Depth (Hops)', String(report.metrics.longestChainLength)],
    ['In/Out Retention Ratio', String(report.metrics.inOutRatio)],
    [''],
    ['--- TRIGGERED RISK RULES ---'],
    ['Rule Title', 'Points Awarded', 'Max Points', 'Triggered', 'Description', 'Supporting Evidence'],
    ...report.riskBreakdown.factors.map((f) => [
      escapeCSVField(f.title),
      String(f.points),
      String(f.maxPoints),
      f.triggered ? 'YES' : 'NO',
      escapeCSVField(f.description),
      escapeCSVField(f.supportingEvidence || 'None'),
    ]),
    [''],
    ['--- INCIDENT TRANSACTION LEDGER ---'],
    ['Tx ID', 'Direction', 'Counterparty', 'Amount (INR)', 'Timestamp', 'Flagged Status'],
    ...report.transactions.map((tx) => [
      tx.id,
      tx.direction,
      tx.counterparty,
      String(tx.amount),
      tx.timestamp,
      tx.flagged ? 'FLAGGED' : 'NORMAL',
    ]),
  ];

  const csvContent = metaRows.map((r) => r.join(',')).join('\n');
  downloadCSV(csvContent, `audit_report_${report.account.id}_${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Exports shortest path investigation route as CSV.
 */
export function exportPathReportCSV(
  source: string,
  target: string,
  path: string[],
  cost: number,
  hops: number,
  algorithmType: string
): void {
  const rows = [
    ['--- FRAUDGRAPH SHORTEST PATH INVESTIGATION ---'],
    ['Algorithm Employed', algorithmType],
    ['Source Account', source],
    ['Target Account', target],
    ['Path Reachable', path.length > 0 ? 'YES' : 'NO'],
    ['Total Hops', String(hops)],
    ['Total Financial Value (INR)', String(cost)],
    ['Ordered Route Sequence', escapeCSVField(path.length > 0 ? path.join(' → ') : 'No Route')],
    [''],
    ['Hop Number', 'Origin Account', 'Destination Account'],
  ];

  for (let i = 0; i < path.length - 1; i++) {
    rows.push([String(i + 1), path[i], path[i + 1]]);
  }

  const csvContent = rows.map((r) => r.join(',')).join('\n');
  downloadCSV(csvContent, `path_${source}_to_${target}_${new Date().toISOString().slice(0, 10)}.csv`);
}

function escapeCSVField(val: string): string {
  if (val.includes(',') || val.includes('\n') || val.includes('"')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return `"${val}"`;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
