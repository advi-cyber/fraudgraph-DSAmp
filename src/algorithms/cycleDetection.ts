import { Graph } from '../dataStructures/Graph';
import { AlgorithmStep, CycleDetectionResult, DetectedCycle } from '../types/algorithm';

/**
 * 3-State Directed Cycle Detection using Depth-First Search (DFS).
 * State Representation:
 * 0 = UNVISITED  (Node not yet reached)
 * 1 = VISITING   (Node currently in active DFS recursion stack - ancestor)
 * 2 = PROCESSED  (Node and all its descendants completely explored)
 *
 * A back-edge to a node in state 1 indicates a directed cycle (circular fund routing).
 * Time Complexity: O(V + E)
 * Space Complexity: O(V)
 */
export function detectDirectedCycles(graph: Graph): CycleDetectionResult {
  const steps: AlgorithmStep[] = [];
  const detectedCycles: DetectedCycle[] = [];
  const state: Record<string, 0 | 1 | 2> = {};
  const parentNode: Record<string, string | null> = {};
  const currentPath: string[] = [];
  const seenCycleSignatures = new Set<string>();

  const nodeIds = graph.getNodeIds();
  for (const id of nodeIds) {
    state[id] = 0;
    parentNode[id] = null;
  }

  let stepCounter = 1;

  steps.push({
    stepNumber: stepCounter++,
    algorithmName: 'CYCLE_DETECTION',
    action: 'INITIALIZE',
    visitedNodes: [],
    highlightedNodes: [],
    highlightedEdges: [],
    description: `Initialized 3-state Cycle Detection for ${nodeIds.length} accounts. All set to UNVISITED (0).`,
    pseudoCodeLine: 1,
  });

  function dfsCycle(nodeId: string): void {
    state[nodeId] = 1; // VISITING
    currentPath.push(nodeId);

    steps.push({
      stepNumber: stepCounter++,
      algorithmName: 'CYCLE_DETECTION',
      action: 'STATE_VISITING',
      currentNode: nodeId,
      stackState: [...currentPath],
      visitedNodes: Object.keys(state).filter((k) => state[k] !== 0),
      highlightedNodes: [nodeId],
      highlightedEdges: [],
      description: `Account [${nodeId}] transitioned to state VISITING (1). Added to current recursion stack.`,
      pseudoCodeLine: 4,
    });

    const outgoingEdges = graph.getOutgoingEdges(nodeId);

    for (const edge of outgoingEdges) {
      const neighbor = edge.target;

      steps.push({
        stepNumber: stepCounter++,
        algorithmName: 'CYCLE_DETECTION',
        action: 'EXAMINE_EDGE',
        currentNode: nodeId,
        targetNode: neighbor,
        currentEdge: edge.id,
        stackState: [...currentPath],
        visitedNodes: Object.keys(state).filter((k) => state[k] !== 0),
        highlightedNodes: [nodeId, neighbor],
        highlightedEdges: [edge.id],
        description: `Inspecting edge ${nodeId} → ${neighbor} (Tx: ${edge.transactionId}, ₹${edge.weight.toLocaleString('en-IN')}). Target state: ${
          state[neighbor] === 0 ? 'UNVISITED (0)' : state[neighbor] === 1 ? 'VISITING (1)' : 'PROCESSED (2)'
        }.`,
        pseudoCodeLine: 6,
      });

      if (state[neighbor] === 1) {
        // Back edge found! Cycle detected!
        const cycleStartIndex = currentPath.indexOf(neighbor);
        if (cycleStartIndex !== -1) {
          const cycleNodes = currentPath.slice(cycleStartIndex);
          // Standardize cycle signature to avoid duplicate rotations
          const minNode = cycleNodes.reduce((min, cur) => (cur < min ? cur : min), cycleNodes[0]);
          const minIdx = cycleNodes.indexOf(minNode);
          const canonicalCycle = [
            ...cycleNodes.slice(minIdx),
            ...cycleNodes.slice(0, minIdx),
          ];
          const signature = canonicalCycle.join('->');

          if (!seenCycleSignatures.has(signature)) {
            seenCycleSignatures.add(signature);

            // Collect edge IDs and total amount
            const cycleEdgeIds: string[] = [];
            let totalAmount = 0;

            for (let i = 0; i < cycleNodes.length; i++) {
              const u = cycleNodes[i];
              const v = cycleNodes[(i + 1) % cycleNodes.length];
              const connectingEdge = graph.getEdgeBetween(u, v);
              if (connectingEdge) {
                cycleEdgeIds.push(connectingEdge.id);
                totalAmount += connectingEdge.weight;
              }
            }

            const pathDesc = [...cycleNodes, cycleNodes[0]].join(' → ');

            const detected: DetectedCycle = {
              id: `CYC-${detectedCycles.length + 1}`,
              nodes: cycleNodes,
              edgeIds: cycleEdgeIds,
              totalAmount,
              pathDescription: pathDesc,
              evidence: `Back-edge detected from ${nodeId} to ancestor ${neighbor} in active DFS stack.`,
            };

            detectedCycles.push(detected);

            steps.push({
              stepNumber: stepCounter++,
              algorithmName: 'CYCLE_DETECTION',
              action: 'CYCLE_DETECTED',
              currentNode: nodeId,
              targetNode: neighbor,
              currentEdge: edge.id,
              stackState: [...currentPath],
              visitedNodes: Object.keys(state).filter((k) => state[k] !== 0),
              highlightedNodes: cycleNodes,
              highlightedEdges: cycleEdgeIds,
              description: `POTENTIALLY SUSPICIOUS CYCLE DETECTED! Back-edge ${nodeId} → ${neighbor}. Path: ${pathDesc}. Total value: ₹${totalAmount.toLocaleString('en-IN')}.`,
              pseudoCodeLine: 9,
              metadata: { cycle: detected },
            });
          }
        }
      } else if (state[neighbor] === 0) {
        parentNode[neighbor] = nodeId;
        dfsCycle(neighbor);
      }
    }

    state[nodeId] = 2; // PROCESSED
    currentPath.pop();

    steps.push({
      stepNumber: stepCounter++,
      algorithmName: 'CYCLE_DETECTION',
      action: 'STATE_PROCESSED',
      currentNode: nodeId,
      stackState: [...currentPath],
      visitedNodes: Object.keys(state).filter((k) => state[k] === 2),
      highlightedNodes: [nodeId],
      highlightedEdges: [],
      description: `Account [${nodeId}] transitioned to state PROCESSED (2). All child paths verified.`,
      pseudoCodeLine: 13,
    });
  }

  // Iterate over all nodes in case the graph is disconnected
  for (const nodeId of nodeIds) {
    if (state[nodeId] === 0) {
      dfsCycle(nodeId);
    }
  }

  steps.push({
    stepNumber: stepCounter++,
    algorithmName: 'CYCLE_DETECTION',
    action: 'COMPLETE',
    visitedNodes: nodeIds,
    highlightedNodes: detectedCycles.flatMap((c) => c.nodes),
    highlightedEdges: detectedCycles.flatMap((c) => c.edgeIds),
    description: `Cycle Detection finished. Discovered ${detectedCycles.length} potentially suspicious circular routing patterns.`,
    pseudoCodeLine: 16,
  });

  return {
    hasCycle: detectedCycles.length > 0,
    cycles: detectedCycles,
    steps,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
  };
}
