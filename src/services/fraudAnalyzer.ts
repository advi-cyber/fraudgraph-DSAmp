import { Graph } from '../dataStructures/Graph';
import { detectDirectedCycles } from '../algorithms/cycleDetection';
import { runTarjanSCC } from '../algorithms/stronglyConnectedComponents';
import { DetectedCycle, SCCGroup } from '../types/algorithm';

export interface FraudRingDetails {
  ringId: string;
  name: string;
  accounts: string[];
  transactions: string[];
  totalVolume: number;
  cyclePaths: string[];
  graphEvidence: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sccComponentId: string;
}

/**
 * Combines Cycle Detection and Strongly Connected Components to identify
 * and categorize Potentially Suspicious Transaction Rings.
 */
export function analyzeFraudRings(graph: Graph): FraudRingDetails[] {
  const cycleResult = detectDirectedCycles(graph);
  const sccResult = runTarjanSCC(graph);

  const multiNodeSCCs = sccResult.components.filter((c) => c.nodes.length >= 2);
  const rings: FraudRingDetails[] = [];

  multiNodeSCCs.forEach((scc, index) => {
    const sccNodeSet = new Set(scc.nodes);
    const relatedCycles = cycleResult.cycles.filter((c) =>
      c.nodes.some((node) => sccNodeSet.has(node))
    );

    const relatedTransactions: string[] = [];
    let aggregatedVolume = scc.internalVolume;

    for (const node of scc.nodes) {
      const outEdges = graph.getOutgoingEdges(node);
      for (const edge of outEdges) {
        if (sccNodeSet.has(edge.target)) {
          relatedTransactions.push(edge.transactionId);
        }
      }
    }

    const cyclePaths = relatedCycles.map((c) => c.pathDescription);
    if (cyclePaths.length === 0 && scc.nodes.length >= 2) {
      cyclePaths.push(scc.nodes.join(' ↔ ') + ' (Mutual Reachability)');
    }

    rings.push({
      ringId: `RING-00${index + 1}`,
      name: `Potentially Suspicious Ring [${scc.id}]`,
      accounts: scc.nodes,
      transactions: Array.from(new Set(relatedTransactions)),
      totalVolume: aggregatedVolume,
      cyclePaths,
      graphEvidence: `Tarjan SCC identified mutual reachability across ${scc.nodes.length} accounts. 3-State DFS confirmed ${relatedCycles.length} directed cyclic flow(s).`,
      riskRating: scc.nodes.length >= 4 || aggregatedVolume > 500000 ? 'CRITICAL' : 'HIGH',
      sccComponentId: scc.id,
    });
  });

  return rings;
}
