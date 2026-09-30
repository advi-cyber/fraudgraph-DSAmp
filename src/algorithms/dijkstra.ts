import { Graph } from '../dataStructures/Graph';
import { PriorityQueue } from '../dataStructures/PriorityQueue';
import { AlgorithmStep, DijkstraResult } from '../types/algorithm';

/**
 * Manual implementation of Dijkstra's Algorithm for Directed Weighted Graphs.
 * Uses manual Min-Heap Priority Queue.
 * Edge weights represent transaction amounts (or friction).
 * Time Complexity: O((V + E) log V)
 * Space Complexity: O(V)
 */
export function runDijkstra(
  graph: Graph,
  sourceNodeId: string,
  targetNodeId?: string
): DijkstraResult {
  const steps: AlgorithmStep[] = [];
  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};
  const finalized = new Set<string>();
  const pq = new PriorityQueue<string>();

  const nodeIds = graph.getNodeIds();
  for (const id of nodeIds) {
    distances[id] = Infinity;
    predecessors[id] = null;
  }

  let stepCounter = 1;

  if (!graph.hasNode(sourceNodeId)) {
    return {
      source: sourceNodeId,
      target: targetNodeId,
      distances,
      predecessors,
      shortestPath: [],
      totalWeight: Infinity,
      edgeIds: [],
      steps,
      timeComplexity: 'O((V + E) log V)',
      spaceComplexity: 'O(V)',
    };
  }

  distances[sourceNodeId] = 0;
  pq.insert(sourceNodeId, 0);

  const getDistSnapshot = () => {
    const table: Record<string, { distance: number; predecessor: string | null }> = {};
    for (const id of nodeIds) {
      table[id] = {
        distance: distances[id],
        predecessor: predecessors[id],
      };
    }
    return table;
  };

  steps.push({
    stepNumber: stepCounter++,
    algorithmName: 'DIJKSTRA',
    action: 'INITIALIZE',
    currentNode: sourceNodeId,
    visitedNodes: [],
    distanceTable: getDistSnapshot(),
    highlightedNodes: [sourceNodeId],
    highlightedEdges: [],
    description: `Initialized Dijkstra from source [${sourceNodeId}]. Distance to source = 0, all others = ∞.`,
    pseudoCodeLine: 1,
  });

  while (!pq.isEmpty()) {
    const minEntry = pq.extractMin()!;
    const u = minEntry.item;
    const currentDist = minEntry.priority;

    // Skip if outdated entry
    if (finalized.has(u)) continue;
    finalized.add(u);

    steps.push({
      stepNumber: stepCounter++,
      algorithmName: 'DIJKSTRA',
      action: 'EXTRACT_MIN',
      currentNode: u,
      visitedNodes: Array.from(finalized),
      distanceTable: getDistSnapshot(),
      highlightedNodes: [u],
      highlightedEdges: [],
      description: `Extracted account [${u}] with minimum tentative cost ₹${currentDist.toLocaleString('en-IN')}. Distance finalized.`,
      pseudoCodeLine: 5,
    });

    if (targetNodeId && u === targetNodeId) {
      steps.push({
        stepNumber: stepCounter++,
        algorithmName: 'DIJKSTRA',
        action: 'TARGET_REACHED',
        currentNode: u,
        targetNode: targetNodeId,
        visitedNodes: Array.from(finalized),
        distanceTable: getDistSnapshot(),
        highlightedNodes: [u],
        highlightedEdges: [],
        description: `Target destination [${targetNodeId}] finalized with minimum total transfer value of ₹${distances[u].toLocaleString('en-IN')}.`,
        pseudoCodeLine: 8,
      });
      break;
    }

    const outgoingEdges = graph.getOutgoingEdges(u);

    for (const edge of outgoingEdges) {
      const v = edge.target;
      const weight = edge.weight;

      steps.push({
        stepNumber: stepCounter++,
        algorithmName: 'DIJKSTRA',
        action: 'EVALUATE_EDGE',
        currentNode: u,
        targetNode: v,
        currentEdge: edge.id,
        visitedNodes: Array.from(finalized),
        distanceTable: getDistSnapshot(),
        highlightedNodes: [u, v],
        highlightedEdges: [edge.id],
        description: `Evaluating edge ${u} → ${v} (Weight: ₹${weight.toLocaleString('en-IN')}). Tentative candidate: ₹${(currentDist + weight).toLocaleString('en-IN')}.`,
        pseudoCodeLine: 10,
      });

      if (!finalized.has(v)) {
        if (distances[u] + weight < distances[v]) {
          const oldDist = distances[v];
          distances[v] = distances[u] + weight;
          predecessors[v] = u;
          pq.insert(v, distances[v]);

          steps.push({
            stepNumber: stepCounter++,
            algorithmName: 'DIJKSTRA',
            action: 'RELAX_EDGE',
            currentNode: u,
            targetNode: v,
            currentEdge: edge.id,
            visitedNodes: Array.from(finalized),
            distanceTable: getDistSnapshot(),
            highlightedNodes: [u, v],
            highlightedEdges: [edge.id],
            description: `Edge relaxed! Shortest path to [${v}] updated from ${oldDist === Infinity ? '∞' : '₹' + oldDist.toLocaleString('en-IN')} to ₹${distances[v].toLocaleString('en-IN')} via [${u}].`,
            pseudoCodeLine: 12,
          });
        }
      }
    }
  }

  // Path reconstruction if target is provided
  const shortestPath: string[] = [];
  const edgeIds: string[] = [];
  let totalWeight = 0;

  if (targetNodeId && distances[targetNodeId] !== Infinity) {
    let curr: string | null = targetNodeId;
    while (curr) {
      shortestPath.unshift(curr);
      const prev: string | null = predecessors[curr];
      if (prev) {
        const edge = graph.getEdgeBetween(prev, curr);
        if (edge) edgeIds.unshift(edge.id);
      }
      curr = prev;
    }
    totalWeight = distances[targetNodeId];
  }

  steps.push({
    stepNumber: stepCounter++,
    algorithmName: 'DIJKSTRA',
    action: 'COMPLETE',
    visitedNodes: Array.from(finalized),
    activePath: shortestPath,
    distanceTable: getDistSnapshot(),
    highlightedNodes: shortestPath.length > 0 ? shortestPath : Array.from(finalized),
    highlightedEdges: edgeIds,
    description: targetNodeId
      ? shortestPath.length > 0
        ? `Found minimum cost transaction path: ${shortestPath.join(' → ')} with total weight ₹${totalWeight.toLocaleString('en-IN')}.`
        : `No directed path exists from [${sourceNodeId}] to [${targetNodeId}].`
      : `Dijkstra completed for all reachable accounts from [${sourceNodeId}].`,
    pseudoCodeLine: 15,
  });

  return {
    source: sourceNodeId,
    target: targetNodeId,
    distances,
    predecessors,
    shortestPath,
    totalWeight,
    edgeIds,
    steps,
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
  };
}
