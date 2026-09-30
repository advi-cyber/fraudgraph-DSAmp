import { Graph } from '../dataStructures/Graph';
import { Queue } from '../dataStructures/Queue';
import { AlgorithmStep, BFSResult } from '../types/algorithm';

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
