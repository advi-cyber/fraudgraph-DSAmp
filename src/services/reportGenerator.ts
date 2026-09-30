import { Graph } from '../dataStructures/Graph';
import { runBFS } from '../algorithms/bfs';
import { runDFS } from '../algorithms/dfs';
import { detectDirectedCycles } from '../algorithms/cycleDetection';
import { runTarjanSCC } from '../algorithms/stronglyConnectedComponents';
import { calculateAccountRisk } from './riskAnalyzer';
import { AccountInvestigationReport } from '../types/investigation';

/**
 * Executes a comprehensive multi-algorithm assessment on a selected account
 * and generates a formal, audited Investigation Report.
 */
export function generateAccountInvestigationReport(
  graph: Graph,
  accountId: string
): AccountInvestigationReport {
  const node = graph.getNode(accountId);
  const now = new Date().toISOString();
  const investigationId = `INV-${accountId.replace(/[^A-Za-z0-9]/g, '')}-${Date.now().toString().slice(-6)}`;

  if (!node) {
    throw new Error(`Account [${accountId}] not found in transaction graph.`);
  }

  // Run all manual DSA algorithms
  const bfsResult = runBFS(graph, accountId);
  const dfsResult = runDFS(graph, accountId);
  const cycleResult = detectDirectedCycles(graph);
  const sccResult = runTarjanSCC(graph);
  const riskBreakdown = calculateAccountRisk(graph, accountId, cycleResult, sccResult);

  // Extract metrics
  const inEdges = graph.getIncomingEdges(accountId);
  const outEdges = graph.getOutgoingEdges(accountId);
  const connectedAccounts = new Set([...inEdges.map((e) => e.source), ...outEdges.map((e) => e.target)]).size;
  const transactionCount = inEdges.length + outEdges.length;
  const totalSent = graph.getTotalOutAmount(accountId);
  const totalReceived = graph.getTotalInAmount(accountId);

  // Cycle involvement
  const cyclesInvolved = cycleResult.cycles
    .filter((c) => c.nodes.includes(accountId))
    .map((c) => ({
      id: c.id,
      path: c.pathDescription,
      amount: c.totalAmount,
    }));

  // SCC Membership
  const sccGroup = sccResult.components.find((c) => c.nodes.includes(accountId) && c.nodes.length >= 2);
  const sccMembership = sccGroup ? sccGroup.nodes : [];

  // Associated transactions
  const associatedTxs = [
    ...inEdges.map((e) => ({
      id: e.transactionId,
      counterparty: e.source,
      direction: 'INCOMING' as const,
      amount: e.weight,
      timestamp: e.timestamp,
      flagged: cyclesInvolved.length > 0 || (sccMembership.length > 0 && sccMembership.includes(e.source)),
    })),
    ...outEdges.map((e) => ({
      id: e.transactionId,
      counterparty: e.target,
      direction: 'OUTGOING' as const,
      amount: e.weight,
      timestamp: e.timestamp,
      flagged: cyclesInvolved.length > 0 || (sccMembership.length > 0 && sccMembership.includes(e.target)),
    })),
  ];

  const inOutRatio = totalReceived > 0 ? Number((totalSent / totalReceived).toFixed(2)) : totalSent > 0 ? 99 : 1;

  return {
    investigationId,
    generatedAt: now,
    account: {
      id: accountId,
      holder: node.metadata.accountHolder || `Account ${accountId}`,
      type: node.metadata.accountType || 'PERSONAL',
      createdDate: '2025-01-15',
    },
    metrics: {
      connectedAccounts,
      transactionCount,
      totalSent,
      totalReceived,
      cycleInvolvementCount: cyclesInvolved.length,
      suspiciousRingsCount: sccMembership.length > 0 ? 1 : 0,
      longestChainLength: dfsResult.maxDepth,
      inOutRatio,
    },
    riskBreakdown,
    graphEvidence: {
      cycles: cyclesInvolved,
      sccMembership,
      directNeighbors: {
        inflowFrom: inEdges.map((e) => e.source),
        outflowTo: outEdges.map((e) => e.target),
      },
      longestPath: dfsResult.traversalOrder.slice(0, dfsResult.maxDepth + 1),
      reachabilityBFS: bfsResult.traversalOrder,
    },
    transactions: associatedTxs,
  };
}
