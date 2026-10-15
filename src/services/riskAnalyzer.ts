import { Graph } from '../dataStructures/Graph';
import { RiskBreakdown, RiskFactor } from '../types/investigation';
import { detectDirectedCycles } from '../algorithms/cycleDetection';
import { runTarjanSCC } from '../algorithms/stronglyConnectedComponents';
import { runDFS } from '../algorithms/dfs';
import { RISK_CONFIG } from '../config/riskRules';

/**
 * Pure graph-theoretic, rule-based risk scoring engine.
 * Computes an explainable 0 - 100 score based strictly on topological graph properties,
 * transaction velocity, and fund flow heuristics.
 *
 * Absolutely NO machine learning or black-box models.
 * Transparent and deterministic for financial investigation audits.
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

  const inEdges = graph.getIncomingEdges(accountId);
  const outEdges = graph.getOutgoingEdges(accountId);
  const totalIn = graph.getTotalInAmount(accountId);
  const totalOut = graph.getTotalOutAmount(accountId);

  // 1. Rule: Cycle Involvement
  const cycleRule = RISK_CONFIG.rules.cycleInvolvement;
  const cyclesInvolved = cyclesResult.cycles.filter((c) => c.nodes.includes(accountId));
  const hasCycle = cyclesInvolved.length >= (cycleRule.threshold.count || 1);
  const cycleFactor: RiskFactor = {
    ruleId: cycleRule.id,
    title: cycleRule.name,
    points: hasCycle ? Math.min(cycleRule.weight, 20 + cyclesInvolved.length * 5) : 0,
    maxPoints: cycleRule.weight,
    description: hasCycle
      ? `Account actively participates in ${cyclesInvolved.length} detected directed cycle(s). Funds flow back to originator.`
      : 'No circular fund routing detected for this account.',
    triggered: hasCycle,
    supportingEvidence: hasCycle
      ? cyclesInvolved.map((c) => c.pathDescription).join(' | ')
      : undefined,
  };

  // 2. Rule: SCC Ring Membership
  const sccRule = RISK_CONFIG.rules.sccMembership;
  const matchingSCC = sccResult.components.find(
    (s) => s.nodes.includes(accountId) && s.nodes.length >= (sccRule.threshold.count || 2)
  );
  const isInRing = !!matchingSCC;
  const sccFactor: RiskFactor = {
    ruleId: sccRule.id,
    title: sccRule.name,
    points: isInRing ? sccRule.weight : 0,
    maxPoints: sccRule.weight,
    description: isInRing
      ? `Part of a strongly connected cluster of ${matchingSCC.nodes.length} mutually reachable accounts.`
      : 'Not part of any multi-node strongly connected component.',
    triggered: isInRing,
    supportingEvidence: isInRing ? `Group: [${matchingSCC.nodes.join(' ↔ ')}]` : undefined,
  };

  // 3. Rule: High-Value Single Transaction Threshold
  const highValRule = RISK_CONFIG.rules.highValueTransfer;
  const thresholdAmt = highValRule.threshold.amount || 500000;
  const highValTxs = [...inEdges, ...outEdges].filter((e) => e.weight >= thresholdAmt);
  const hasHighVal = highValTxs.length > 0;
  const highValFactor: RiskFactor = {
    ruleId: highValRule.id,
    title: highValRule.name,
    points: hasHighVal ? highValRule.weight : 0,
    maxPoints: highValRule.weight,
    description: hasHighVal
      ? `Engaged in ${highValTxs.length} transaction(s) exceeding the demonstration threshold of ₹${thresholdAmt.toLocaleString('en-IN')}.`
      : `All transaction amounts are below the demonstration threshold of ₹${thresholdAmt.toLocaleString('en-IN')}.`,
    triggered: hasHighVal,
    supportingTransactions: highValTxs.map((e) => e.transactionId),
    supportingEvidence: hasHighVal
      ? highValTxs.map((e) => `${e.transactionId} (₹${e.weight.toLocaleString('en-IN')})`).join(', ')
      : undefined,
  };

  // 4. Rule: Rapid Fan-Out (Dispersion within Time Window)
  const fanOutRule = RISK_CONFIG.rules.rapidFanOut;
  const windowMs = (fanOutRule.threshold.windowMinutes || 60) * 60 * 1000;
  const requiredCount = fanOutRule.threshold.count || 3;
  const sortedOutEdges = [...outEdges].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  let fanOutTriggered = false;
  const fanOutSupportingTxs: string[] = [];

  for (let i = 0; i < sortedOutEdges.length; i++) {
    const tStart = new Date(sortedOutEdges[i].timestamp).getTime();
    const cluster = [sortedOutEdges[i]];
    for (let j = i + 1; j < sortedOutEdges.length; j++) {
      const tCurrent = new Date(sortedOutEdges[j].timestamp).getTime();
      if (tCurrent - tStart <= windowMs) {
        cluster.push(sortedOutEdges[j]);
      } else {
        break;
      }
    }
    if (cluster.length >= requiredCount) {
      fanOutTriggered = true;
      cluster.forEach((e) => {
        if (!fanOutSupportingTxs.includes(e.transactionId)) {
          fanOutSupportingTxs.push(e.transactionId);
        }
      });
      break;
    }
  }

  const fanOutFactor: RiskFactor = {
    ruleId: fanOutRule.id,
    title: fanOutRule.name,
    points: fanOutTriggered ? fanOutRule.weight : 0,
    maxPoints: fanOutRule.weight,
    description: fanOutTriggered
      ? `Dispatched ${fanOutSupportingTxs.length} outbound transfers within a ${fanOutRule.threshold.windowMinutes}-minute window (rapid dispersion pattern).`
      : 'Outbound transfer velocity exhibits normal pacing.',
    triggered: fanOutTriggered,
    supportingTransactions: fanOutSupportingTxs,
    supportingEvidence: fanOutTriggered ? `Transactions: ${fanOutSupportingTxs.join(', ')}` : undefined,
  };

  // 5. Rule: Rapid Fan-In (Structuring / Funneling within Time Window)
  const fanInRule = RISK_CONFIG.rules.rapidFanIn;
  const sortedInEdges = [...inEdges].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  let fanInTriggered = false;
  const fanInSupportingTxs: string[] = [];

  for (let i = 0; i < sortedInEdges.length; i++) {
    const tStart = new Date(sortedInEdges[i].timestamp).getTime();
    const cluster = [sortedInEdges[i]];
    for (let j = i + 1; j < sortedInEdges.length; j++) {
      const tCurrent = new Date(sortedInEdges[j].timestamp).getTime();
      if (tCurrent - tStart <= windowMs) {
        cluster.push(sortedInEdges[j]);
      } else {
        break;
      }
    }
    if (cluster.length >= requiredCount) {
      fanInTriggered = true;
      cluster.forEach((e) => {
        if (!fanInSupportingTxs.includes(e.transactionId)) {
          fanInSupportingTxs.push(e.transactionId);
        }
      });
      break;
    }
  }

  const fanInFactor: RiskFactor = {
    ruleId: fanInRule.id,
    title: fanInRule.name,
    points: fanInTriggered ? fanInRule.weight : 0,
    maxPoints: fanInRule.weight,
    description: fanInTriggered
      ? `Aggregated ${fanInSupportingTxs.length} inbound transfers within a ${fanInRule.threshold.windowMinutes}-minute window (structuring funnel).`
      : 'Inbound transfer velocity exhibits normal distribution.',
    triggered: fanInTriggered,
    supportingTransactions: fanInSupportingTxs,
    supportingEvidence: fanInTriggered ? `Transactions: ${fanInSupportingTxs.join(', ')}` : undefined,
  };

  // 6. Rule: Fast Pass-Through / Low Retention (Mule Forwarding)
  const passRule = RISK_CONFIG.rules.fastPassThrough;
  const passRatioThreshold = passRule.threshold.ratio || 0.75;
  const passWindowMs = (passRule.threshold.windowMinutes || 120) * 60 * 1000;
  let passThroughTriggered = false;
  const passThroughPairs: string[] = [];
  const passSupportingTxs: string[] = [];

  // Check timestamp-based forwarding: an inflow followed by similar outflow within window
  for (const inEdge of inEdges) {
    const inTime = new Date(inEdge.timestamp).getTime();
    for (const outEdge of outEdges) {
      const outTime = new Date(outEdge.timestamp).getTime();
      const timeDiff = outTime - inTime;
      if (timeDiff >= 0 && timeDiff <= passWindowMs) {
        const ratio = Math.min(inEdge.weight, outEdge.weight) / Math.max(inEdge.weight, outEdge.weight);
        if (ratio >= passRatioThreshold) {
          passThroughTriggered = true;
          passThroughPairs.push(`${inEdge.transactionId} → ${outEdge.transactionId}`);
          if (!passSupportingTxs.includes(inEdge.transactionId)) passSupportingTxs.push(inEdge.transactionId);
          if (!passSupportingTxs.includes(outEdge.transactionId)) passSupportingTxs.push(outEdge.transactionId);
        }
      }
    }
  }

  // Fallback to cumulative in/out ratio if accounts pass substantial volume
  if (!passThroughTriggered && totalIn > 0 && totalOut > 0) {
    const cumulativeRatio = Math.min(totalIn, totalOut) / Math.max(totalIn, totalOut);
    if (cumulativeRatio >= 0.85 && inEdges.length >= 1 && outEdges.length >= 1) {
      passThroughTriggered = true;
    }
  }

  const passThroughFactor: RiskFactor = {
    ruleId: passRule.id,
    title: passRule.name,
    points: passThroughTriggered ? passRule.weight : 0,
    maxPoints: passRule.weight,
    description: passThroughTriggered
      ? `Rapid fund depletion: Account immediately forwards received capital outbound with low retention (mule forwarding indicator).`
      : 'Inflow and outflow retention ratios exhibit normal balance.',
    triggered: passThroughTriggered,
    supportingTransactions: passSupportingTxs,
    supportingEvidence: passThroughPairs.length > 0 ? passThroughPairs.join(', ') : undefined,
  };

  // 7. Rule: Multi-Hop Layering Chain Depth
  const dfsResult = runDFS(graph, accountId);
  const chainRule = RISK_CONFIG.rules.deepLayeringChain;
  const isDeepChain = dfsResult.maxDepth >= (chainRule.threshold.chainDepth || 4);
  const chainFactor: RiskFactor = {
    ruleId: chainRule.id,
    title: chainRule.name,
    points: isDeepChain ? chainRule.weight : dfsResult.maxDepth >= 3 ? 5 : 0,
    maxPoints: chainRule.weight,
    description: isDeepChain
      ? `Outbound transaction chain spans ${dfsResult.maxDepth} consecutive account hops (layering indicator).`
      : `Outbound chain depth is ${dfsResult.maxDepth} hop(s), within normal threshold.`,
    triggered: isDeepChain || dfsResult.maxDepth >= 3,
    supportingEvidence: `Max Depth: ${dfsResult.maxDepth} hops`,
  };

  const factors: RiskFactor[] = [
    cycleFactor,
    sccFactor,
    highValFactor,
    fanOutFactor,
    fanInFactor,
    passThroughFactor,
    chainFactor,
  ];

  const rawScore = factors.reduce((sum, f) => sum + f.points, 0);
  const score = Math.min(RISK_CONFIG.maxScore, Math.max(0, rawScore));

  let level: RiskBreakdown['level'] = 'LOW';
  if (score >= RISK_CONFIG.thresholds.highRiskScore) {
    level = score >= 80 ? 'CRITICAL' : 'HIGH';
  } else if (score >= RISK_CONFIG.thresholds.mediumRiskScore) {
    level = 'MEDIUM';
  }

  const triggeredCount = factors.filter((f) => f.triggered).length;
  const summary =
    level === 'CRITICAL' || level === 'HIGH'
      ? `Elevated risk indicators observed based on ${triggeredCount} rule trigger(s) (Topological score: ${score}/100). Further investigation is recommended.`
      : level === 'MEDIUM'
      ? `Moderate risk indicators observed based on ${triggeredCount} rule trigger(s) (Score: ${score}/100). Review transaction counterparty context.`
      : `Account topology aligns with ordinary transactional flows (Score: ${score}/100). No significant anomaly flags.`;

  return {
    score,
    level,
    factors,
    summary,
    disclaimer:
      'This risk score is an explainable heuristic derived from rule-based graph properties. It serves as an investigative priority indicator, not proof of financial wrongdoing.',
  };
}
