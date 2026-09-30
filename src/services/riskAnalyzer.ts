import { Graph } from '../dataStructures/Graph';
import { RiskBreakdown, RiskFactor } from '../types/investigation';
import { detectDirectedCycles } from '../algorithms/cycleDetection';
import { runTarjanSCC } from '../algorithms/stronglyConnectedComponents';
import { runDFS } from '../algorithms/dfs';

/**
 * Pure graph-theoretic mathematical risk scoring engine.
 * Computes an explainable 0 - 100 score based strictly on topological graph properties.
 * Absolutely NO machine learning or probabilistic black boxes.
 */
export function calculateAccountRisk(
  graph: Graph,
  accountId: string,
  cachedCycles?: ReturnType<typeof detectDirectedCycles>,
  cachedSCC?: ReturnType<typeof runTarjanSCC>
): RiskBreakdown {
  if (!graph.hasNode(accountId)) {
    return {
      score: 0,
      level: 'LOW',
      factors: [],
      summary: 'Account does not exist in graph.',
      disclaimer: 'This is an educational graph-based risk indicator, not a prediction or proof of fraud.',
    };
  }

  const cyclesResult = cachedCycles || detectDirectedCycles(graph);
  const sccResult = cachedSCC || runTarjanSCC(graph);

  const inDegree = graph.getInDegree(accountId);
  const outDegree = graph.getOutDegree(accountId);
  const totalIn = graph.getTotalInAmount(accountId);
  const totalOut = graph.getTotalOutAmount(accountId);

  // Factor 1: Cycle Involvement (+30 max)
  const cyclesInvolved = cyclesResult.cycles.filter((c) => c.nodes.includes(accountId));
  const hasCycle = cyclesInvolved.length > 0;
  const cyclePoints = hasCycle ? Math.min(30, 20 + cyclesInvolved.length * 5) : 0;
  const cycleFactor: RiskFactor = {
    title: 'Circular Fund Routing Involvement',
    points: cyclePoints,
    maxPoints: 30,
    description: hasCycle
      ? `Account actively participates in ${cyclesInvolved.length} detected directed cycle(s). Funds flow back to originator.`
      : 'No cyclic back-edge connections detected for this account.',
    triggered: hasCycle,
  };

  // Factor 2: SCC Membership (+25 max)
  const matchingSCC = sccResult.components.find((s) => s.nodes.includes(accountId) && s.nodes.length >= 2);
  const isInRing = !!matchingSCC;
  const sccPoints = isInRing ? (matchingSCC.nodes.length >= 4 ? 25 : 20) : 0;
  const sccFactor: RiskFactor = {
    title: 'Strongly Connected Component Ring Member',
    points: sccPoints,
    maxPoints: 25,
    description: isInRing
      ? `Part of a strongly connected cluster of ${matchingSCC.nodes.length} accounts with mutual reachability.`
      : 'Not part of any multi-node strongly connected component.',
    triggered: isInRing,
  };

  // Factor 3: Long Layering Funnel Chain (+15 max)
  const dfsResult = runDFS(graph, accountId);
  const isLongChain = dfsResult.maxDepth >= 4;
  const chainPoints = isLongChain ? 15 : dfsResult.maxDepth >= 3 ? 10 : 0;
  const chainFactor: RiskFactor = {
    title: 'Multi-Hop Layering Chain Depth',
    points: chainPoints,
    maxPoints: 15,
    description: isLongChain
      ? `Outbound transaction chain spans ${dfsResult.maxDepth} consecutive account hops (layering indicator).`
      : `Outbound depth is ${dfsResult.maxDepth} hop(s), within normal threshold.`,
    triggered: isLongChain || dfsResult.maxDepth >= 3,
  };

  // Factor 4: High Transaction Concentration & Velocity (+15 max)
  const totalVolume = totalIn + totalOut;
  const isHighVolume = totalVolume > 500000;
  const concentrationPoints = totalVolume > 1000000 ? 15 : totalVolume > 500000 ? 10 : totalVolume > 200000 ? 5 : 0;
  const concentrationFactor: RiskFactor = {
    title: 'Transaction Volume & Concentration',
    points: concentrationPoints,
    maxPoints: 15,
    description: `Cumulative transactional throughput: ₹${totalVolume.toLocaleString('en-IN')}.`,
    triggered: isHighVolume,
  };

  // Factor 5: Rapid Pass-Through / Low Retention (+15 max)
  // Smurfing or mule accounts exhibit nearly equal in-flow and out-flow within short duration
  let passThroughPoints = 0;
  let passThroughTriggered = false;
  if (totalIn > 0 && totalOut > 0) {
    const ratio = Math.min(totalIn, totalOut) / Math.max(totalIn, totalOut);
    if (ratio > 0.9 && inDegree >= 1 && outDegree >= 1) {
      passThroughPoints = 15;
      passThroughTriggered = true;
    } else if (ratio > 0.75) {
      passThroughPoints = 8;
      passThroughTriggered = true;
    }
  }
  const passThroughFactor: RiskFactor = {
    title: 'Pass-Through Funnel Balance (Mule Ratio)',
    points: passThroughPoints,
    maxPoints: 15,
    description: passThroughTriggered
      ? `Rapid fund depletion: ${(Math.min(totalIn, totalOut) / Math.max(totalIn, totalOut) * 100).toFixed(1)}% of inbound capital is immediately forwarded outbound.`
      : 'Inflow and outflow ratios exhibit normal balance.',
    triggered: passThroughTriggered,
  };

  const factors = [cycleFactor, sccFactor, chainFactor, concentrationFactor, passThroughFactor];
  const rawScore = factors.reduce((sum, f) => sum + f.points, 0);
  const score = Math.min(100, Math.max(5, rawScore));

  let level: RiskBreakdown['level'] = 'LOW';
  if (score >= 70) level = 'CRITICAL';
  else if (score >= 50) level = 'HIGH';
  else if (score >= 25) level = 'MEDIUM';

  const summary =
    level === 'CRITICAL' || level === 'HIGH'
      ? `Elevated risk indicators observed based on topological graph structure (${cyclesInvolved.length} cycle(s), SCC size: ${matchingSCC?.nodes.length || 0}).`
      : 'Account topology aligns with ordinary transactional flows.';

  return {
    score,
    level,
    factors,
    summary,
    disclaimer: 'This is an educational graph-based risk indicator, not a prediction or proof of fraud.',
  };
}
