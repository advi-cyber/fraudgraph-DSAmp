import { Graph } from '../dataStructures/Graph';
import { Stack } from '../dataStructures/Stack';
import { AlgorithmStep, DFSResult } from '../types/algorithm';

/**
 * Manual implementation of Depth-First Search (DFS) for directed transaction graphs.
 * Demonstrates deep path recursion and explicit backtracking.
 * Time Complexity: O(V + E)
 * Space Complexity: O(V)
 */
export function runDFS(graph: Graph, startNodeId: string): DFSResult {
  const steps: AlgorithmStep[] = [];
  const traversalOrder: string[] = [];
  const visitedNodes: string[] = [];
  const treeEdges: string[] = [];
  const backEdges: string[] = [];
  const visitedSet = new Set<string>();
  const recursionStack = new Stack<string>();
  let maxDepth = 0;
  let stepCounter = 1;

  if (!graph.hasNode(startNodeId)) {
    return {
      startNode: startNodeId,
      traversalOrder,
      visitedNodes,
      treeEdges,
      backEdges,
      steps,
      maxDepth: 0,
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
    };
  }

  function dfsRecursive(currentNode: string, depth: number) {
    if (depth > maxDepth) maxDepth = depth;

    visitedSet.add(currentNode);
    visitedNodes.push(currentNode);
    traversalOrder.push(currentNode);
    recursionStack.push(currentNode);

    steps.push({
      stepNumber: stepCounter++,
      algorithmName: 'DFS',
      action: 'ENTER_NODE',
      currentNode: currentNode,
      stackState: recursionStack.toArray(),
      visitedNodes: Array.from(visitedSet),
      activePath: recursionStack.toArray(),
      highlightedNodes: [currentNode],
      highlightedEdges: [],
      description: `Entering account [${currentNode}] at depth ${depth}. Pushed onto call stack.`,
      pseudoCodeLine: 3,
    });

    const outgoingEdges = graph.getOutgoingEdges(currentNode);

    for (const edge of outgoingEdges) {
      const neighbor = edge.target;

      steps.push({
        stepNumber: stepCounter++,
        algorithmName: 'DFS',
        action: 'EXAMINE_EDGE',
        currentNode: currentNode,
        targetNode: neighbor,
        currentEdge: edge.id,
        stackState: recursionStack.toArray(),
        visitedNodes: Array.from(visitedSet),
        activePath: recursionStack.toArray(),
        highlightedNodes: [currentNode, neighbor],
        highlightedEdges: [edge.id],
        description: `Inspecting outgoing transaction ${edge.transactionId} (${currentNode} → ${neighbor}) of ₹${edge.weight.toLocaleString('en-IN')}.`,
        pseudoCodeLine: 5,
      });

      if (!visitedSet.has(neighbor)) {
        treeEdges.push(edge.id);
        steps.push({
          stepNumber: stepCounter++,
          algorithmName: 'DFS',
          action: 'RECURSE_DEEP',
          currentNode: currentNode,
          targetNode: neighbor,
          currentEdge: edge.id,
          stackState: recursionStack.toArray(),
          visitedNodes: Array.from(visitedSet),
          activePath: recursionStack.toArray(),
          highlightedNodes: [neighbor],
          highlightedEdges: [edge.id],
          description: `Account [${neighbor}] is unvisited. Descending deeper into transaction chain.`,
          pseudoCodeLine: 7,
        });

        dfsRecursive(neighbor, depth + 1);

        steps.push({
          stepNumber: stepCounter++,
          algorithmName: 'DFS',
          action: 'RESUME_AFTER_RETURN',
          currentNode: currentNode,
          targetNode: neighbor,
          stackState: recursionStack.toArray(),
          visitedNodes: Array.from(visitedSet),
          activePath: recursionStack.toArray(),
          highlightedNodes: [currentNode],
          highlightedEdges: [],
          description: `Returned from branch [${neighbor}]. Resuming inspection of remaining outbound paths from [${currentNode}].`,
          pseudoCodeLine: 9,
        });
      } else {
        if (recursionStack.toArray().includes(neighbor)) {
          backEdges.push(edge.id);
          steps.push({
            stepNumber: stepCounter++,
            algorithmName: 'DFS',
            action: 'BACK_EDGE_ENCOUNTERED',
            currentNode: currentNode,
            targetNode: neighbor,
            currentEdge: edge.id,
            stackState: recursionStack.toArray(),
            visitedNodes: Array.from(visitedSet),
            activePath: recursionStack.toArray(),
            highlightedNodes: [currentNode, neighbor],
            highlightedEdges: [edge.id],
            description: `Target [${neighbor}] is currently on the active recursion stack! Back-edge detected (${currentNode} → ${neighbor}).`,
            pseudoCodeLine: 11,
          });
        } else {
          steps.push({
            stepNumber: stepCounter++,
            algorithmName: 'DFS',
            action: 'ALREADY_PROCESSED',
            currentNode: currentNode,
            targetNode: neighbor,
            currentEdge: edge.id,
            stackState: recursionStack.toArray(),
            visitedNodes: Array.from(visitedSet),
            activePath: recursionStack.toArray(),
            highlightedNodes: [neighbor],
            highlightedEdges: [edge.id],
            description: `Account [${neighbor}] was already fully explored in a previous branch. Skipping recursion.`,
            pseudoCodeLine: 13,
          });
        }
      }
    }

    recursionStack.pop();
    steps.push({
      stepNumber: stepCounter++,
      algorithmName: 'DFS',
      action: 'BACKTRACK',
      currentNode: currentNode,
      stackState: recursionStack.toArray(),
      visitedNodes: Array.from(visitedSet),
      activePath: recursionStack.toArray(),
      highlightedNodes: [currentNode],
      highlightedEdges: [],
      description: `All outbound links from [${currentNode}] evaluated. Popping from stack and backtracking.`,
      pseudoCodeLine: 16,
    });
  }

  dfsRecursive(startNodeId, 0);

  steps.push({
    stepNumber: stepCounter++,
    algorithmName: 'DFS',
    action: 'COMPLETE',
    stackState: [],
    visitedNodes: Array.from(visitedSet),
    highlightedNodes: traversalOrder,
    highlightedEdges: treeEdges,
    description: `DFS completed. Explored ${traversalOrder.length} accounts to a maximum depth of ${maxDepth}.`,
    pseudoCodeLine: 18,
  });

  return {
    startNode: startNodeId,
    traversalOrder,
    visitedNodes,
    treeEdges,
    backEdges,
    steps,
    maxDepth,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
  };
}
