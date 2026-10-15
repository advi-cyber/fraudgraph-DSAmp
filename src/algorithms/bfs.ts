import { Graph } from '../dataStructures/Graph';
import { Queue } from '../dataStructures/Queue';
import { AlgorithmStep, BFSResult, BFSShortestPathResult } from '../types/algorithm';

/**
 * Manual implementation of Breadth-First Search (BFS) for directed transaction graphs.
 * Uses custom Queue data structure.
 * Time Complexity: O(V + E)
 * Space Complexity: O(V)
 */
export function runBFS(graph: Graph, startNodeId: string): BFSResult {
  const steps: AlgorithmStep[] = [];
  const traversalOrder: string[] = [];
  const visitedNodes: string[] = [];
  const treeEdges: string[] = [];
  const levels: Record<string, number> = {};

  if (!graph.hasNode(startNodeId)) {
    return {
      startNode: startNodeId,
      traversalOrder,
      visitedNodes,
      treeEdges,
      steps,
      levels,
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
    };
  }

  const queue = new Queue<string>();
  const visitedSet = new Set<string>();

  let stepCounter = 1;

  // Step 1: Initialize
  queue.enqueue(startNodeId);
  visitedSet.add(startNodeId);
  visitedNodes.push(startNodeId);
  levels[startNodeId] = 0;

  steps.push({
    stepNumber: stepCounter++,
    algorithmName: 'BFS',
    action: 'INITIALIZE',
    currentNode: startNodeId,
    queueState: queue.toArray(),
    visitedNodes: Array.from(visitedSet),
    highlightedNodes: [startNodeId],
    highlightedEdges: [],
    description: `Initialized BFS. Enqueued root account [${startNodeId}] at Level 0.`,
    pseudoCodeLine: 1,
  });

  while (!queue.isEmpty()) {
    const current = queue.dequeue()!;
    traversalOrder.push(current);

    steps.push({
      stepNumber: stepCounter++,
      algorithmName: 'BFS',
      action: 'DEQUEUE_VISIT',
      currentNode: current,
      queueState: queue.toArray(),
      visitedNodes: Array.from(visitedSet),
      highlightedNodes: [current],
      highlightedEdges: [],
      description: `Dequeued and visiting account [${current}]. Exploring all direct outgoing transactions.`,
      pseudoCodeLine: 4,
    });

    const outgoingEdges = graph.getOutgoingEdges(current);

    for (const edge of outgoingEdges) {
      const neighbor = edge.target;

      steps.push({
        stepNumber: stepCounter++,
        algorithmName: 'BFS',
        action: 'EXAMINE_EDGE',
        currentNode: current,
        targetNode: neighbor,
        currentEdge: edge.id,
        queueState: queue.toArray(),
        visitedNodes: Array.from(visitedSet),
        highlightedNodes: [current, neighbor],
        highlightedEdges: [edge.id],
        description: `Examining outgoing transaction ${edge.transactionId} from [${current}] to [${neighbor}] (Amount: ₹${edge.weight.toLocaleString('en-IN')}).`,
        pseudoCodeLine: 6,
      });

      if (!visitedSet.has(neighbor)) {
        visitedSet.add(neighbor);
        visitedNodes.push(neighbor);
        queue.enqueue(neighbor);
        treeEdges.push(edge.id);
        levels[neighbor] = (levels[current] || 0) + 1;

        steps.push({
          stepNumber: stepCounter++,
          algorithmName: 'BFS',
          action: 'ENQUEUE_NEIGHBOR',
          currentNode: current,
          targetNode: neighbor,
          currentEdge: edge.id,
          queueState: queue.toArray(),
          visitedNodes: Array.from(visitedSet),
          highlightedNodes: [neighbor],
          highlightedEdges: [edge.id],
          description: `Discovered unvisited account [${neighbor}]. Set level to ${levels[neighbor]} and enqueued for further downstream flow tracking.`,
          pseudoCodeLine: 8,
        });
      } else {
        steps.push({
          stepNumber: stepCounter++,
          algorithmName: 'BFS',
          action: 'ALREADY_VISITED',
          currentNode: current,
          targetNode: neighbor,
          currentEdge: edge.id,
          queueState: queue.toArray(),
          visitedNodes: Array.from(visitedSet),
          highlightedNodes: [neighbor],
          highlightedEdges: [edge.id],
          description: `Account [${neighbor}] has already been reached in a previous step. Skipping enqueue to prevent redundant re-traversal.`,
          pseudoCodeLine: 11,
        });
      }
    }
  }

  steps.push({
    stepNumber: stepCounter++,
    algorithmName: 'BFS',
    action: 'COMPLETE',
    queueState: [],
    visitedNodes: Array.from(visitedSet),
    highlightedNodes: traversalOrder,
    highlightedEdges: treeEdges,
    description: `BFS traversal completed. Explored ${traversalOrder.length} reachable accounts across ${Math.max(...Object.values(levels), 0) + 1} layer(s).`,
    pseudoCodeLine: 14,
  });

  return {
    startNode: startNodeId,
    traversalOrder,
    visitedNodes,
    treeEdges,
    steps,
    levels,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
  };
}

/**
 * Finds the minimum-hop route between source and target accounts using manual FIFO Queue BFS.
 * Guarantees minimum number of intermediate transaction hops in an unweighted directed graph.
 *
 * Time Complexity: O(V + E)
 * Space Complexity: O(V)
 */
export function runBFSShortestPath(
  graph: Graph,
  sourceNodeId: string,
  targetNodeId: string
): BFSShortestPathResult {
  const steps: AlgorithmStep[] = [];
  let stepCounter = 1;

  if (!graph.hasNode(sourceNodeId) || !graph.hasNode(targetNodeId)) {
    return {
      source: sourceNodeId,
      target: targetNodeId,
      shortestPath: [],
      hopCount: Infinity,
      edgeIds: [],
      totalWeight: 0,
      isReachable: false,
      steps: [
        {
          stepNumber: stepCounter++,
          algorithmName: 'BFS',
          action: 'ERROR',
          visitedNodes: [],
          highlightedNodes: [],
          highlightedEdges: [],
          description: `One or both accounts ([${sourceNodeId}], [${targetNodeId}]) do not exist in graph.`,
        },
      ],
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
    };
  }

  // Handle identical source & target
  if (sourceNodeId === targetNodeId) {
    return {
      source: sourceNodeId,
      target: targetNodeId,
      shortestPath: [sourceNodeId],
      hopCount: 0,
      edgeIds: [],
      totalWeight: 0,
      isReachable: true,
      steps: [
        {
          stepNumber: stepCounter++,
          algorithmName: 'BFS',
          action: 'TARGET_REACHED',
          currentNode: sourceNodeId,
          visitedNodes: [sourceNodeId],
          highlightedNodes: [sourceNodeId],
          highlightedEdges: [],
          description: `Source and target account are identical ([${sourceNodeId}]). Route length is 0 hops.`,
        },
      ],
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
    };
  }

  const queue = new Queue<string>();
  const visitedSet = new Set<string>();
  const predecessor: Record<string, string | null> = {};
  const edgeUsed: Record<string, string | null> = {};

  for (const id of graph.getNodeIds()) {
    predecessor[id] = null;
    edgeUsed[id] = null;
  }

  queue.enqueue(sourceNodeId);
  visitedSet.add(sourceNodeId);

  steps.push({
    stepNumber: stepCounter++,
    algorithmName: 'BFS',
    action: 'INITIALIZE',
    currentNode: sourceNodeId,
    targetNode: targetNodeId,
    queueState: queue.toArray(),
    visitedNodes: [sourceNodeId],
    highlightedNodes: [sourceNodeId],
    highlightedEdges: [],
    description: `Initiated Minimum-Hop BFS Search from [${sourceNodeId}] to [${targetNodeId}]. Enqueued source vertex.`,
    pseudoCodeLine: 1,
  });

  let found = false;

  while (!queue.isEmpty() && !found) {
    const current = queue.dequeue()!;

    steps.push({
      stepNumber: stepCounter++,
      algorithmName: 'BFS',
      action: 'DEQUEUE_VISIT',
      currentNode: current,
      targetNode: targetNodeId,
      queueState: queue.toArray(),
      visitedNodes: Array.from(visitedSet),
      highlightedNodes: [current],
      highlightedEdges: [],
      description: `Dequeued [${current}]. Scanning forward transaction edges.`,
      pseudoCodeLine: 4,
    });

    const outgoingEdges = graph.getOutgoingEdges(current);

    for (const edge of outgoingEdges) {
      const neighbor = edge.target;

      if (!visitedSet.has(neighbor)) {
        visitedSet.add(neighbor);
        predecessor[neighbor] = current;
        edgeUsed[neighbor] = edge.id;
        queue.enqueue(neighbor);

        steps.push({
          stepNumber: stepCounter++,
          algorithmName: 'BFS',
          action: 'ENQUEUE_NEIGHBOR',
          currentNode: current,
          targetNode: neighbor,
          currentEdge: edge.id,
          queueState: queue.toArray(),
          visitedNodes: Array.from(visitedSet),
          highlightedNodes: [neighbor],
          highlightedEdges: [edge.id],
          description: `Discovered account [${neighbor}] via Tx ${edge.transactionId} (₹${edge.weight.toLocaleString('en-IN')}).`,
          pseudoCodeLine: 7,
        });

        if (neighbor === targetNodeId) {
          found = true;
          break;
        }
      }
    }
  }

  // Reconstruct path
  const shortestPath: string[] = [];
  const edgeIds: string[] = [];
  let totalWeight = 0;

  if (found) {
    let curr: string | null = targetNodeId;
    while (curr) {
      shortestPath.unshift(curr);
      const prev: string | null = predecessor[curr];
      if (prev) {
        const edgeId = edgeUsed[curr];
        if (edgeId) {
          edgeIds.unshift(edgeId);
          const edge = graph.getEdgeBetween(prev, curr);
          if (edge) totalWeight += edge.weight;
        }
      }
      curr = prev;
    }

    steps.push({
      stepNumber: stepCounter++,
      algorithmName: 'BFS',
      action: 'COMPLETE',
      currentNode: targetNodeId,
      visitedNodes: Array.from(visitedSet),
      activePath: shortestPath,
      highlightedNodes: shortestPath,
      highlightedEdges: edgeIds,
      description: `Target [${targetNodeId}] reached in minimum hops: ${shortestPath.join(' → ')} (${shortestPath.length - 1} hops, total volume ₹${totalWeight.toLocaleString('en-IN')}).`,
      pseudoCodeLine: 12,
    });
  } else {
    steps.push({
      stepNumber: stepCounter++,
      algorithmName: 'BFS',
      action: 'NO_PATH',
      visitedNodes: Array.from(visitedSet),
      highlightedNodes: Array.from(visitedSet),
      highlightedEdges: [],
      description: `Search exhausted. No directed transaction path exists from [${sourceNodeId}] to [${targetNodeId}].`,
      pseudoCodeLine: 15,
    });
  }

  return {
    source: sourceNodeId,
    target: targetNodeId,
    shortestPath,
    hopCount: found ? shortestPath.length - 1 : Infinity,
    edgeIds,
    totalWeight,
    isReachable: found,
    steps,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
  };
}
