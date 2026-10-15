import { Graph } from '../dataStructures/Graph';
import { Stack } from '../dataStructures/Stack';
import { AlgorithmStep, SCCGroup, SCCResult } from '../types/algorithm';

/**
 * Manual implementation of Tarjan's Strongly Connected Components (SCC) Algorithm.
 * Identifies subgraphs where every vertex is reachable from every other vertex in that component.
 * In transaction analysis, non-trivial SCCs (size >= 2) indicate circular money-laundering rings or layering loops.
 *
 * Time Complexity: O(V + E)
 * Space Complexity: O(V)
 */
export function runTarjanSCC(graph: Graph): SCCResult {
  const steps: AlgorithmStep[] = [];
  const components: SCCGroup[] = [];
  const nodeIds = graph.getNodeIds();

  const disc: Record<string, number> = {};
  const low: Record<string, number> = {};
  const onStack: Record<string, boolean> = {};
  const stack = new Stack<string>();

  let time = 0;
  let stepCounter = 1;

  for (const id of nodeIds) {
    disc[id] = -1;
    low[id] = -1;
    onStack[id] = false;
  }

  steps.push({
    stepNumber: stepCounter++,
    algorithmName: 'SCC',
    action: 'INITIALIZE',
    visitedNodes: [],
    highlightedNodes: [],
    highlightedEdges: [],
    description: `Initialized Tarjan's SCC algorithm for ${nodeIds.length} accounts. Discovery times and low-link values set to -1.`,
    pseudoCodeLine: 1,
  });

  function sccDFS(u: string): void {
    disc[u] = low[u] = ++time;
    stack.push(u);
    onStack[u] = true;

    steps.push({
      stepNumber: stepCounter++,
      algorithmName: 'SCC',
      action: 'DISCOVER_NODE',
      currentNode: u,
      stackState: stack.toArray(),
      visitedNodes: Object.keys(disc).filter((k) => disc[k] !== -1),
      highlightedNodes: [u],
      highlightedEdges: [],
      description: `Discovered [${u}] at time ${time}. Set disc[${u}] = low[${u}] = ${time}. Pushed to Tarjan stack.`,
      pseudoCodeLine: 3,
    });

    const outgoingEdges = graph.getOutgoingEdges(u);

    for (const edge of outgoingEdges) {
      const v = edge.target;

      steps.push({
        stepNumber: stepCounter++,
        algorithmName: 'SCC',
        action: 'EXAMINE_EDGE',
        currentNode: u,
        targetNode: v,
        currentEdge: edge.id,
        stackState: stack.toArray(),
        visitedNodes: Object.keys(disc).filter((k) => disc[k] !== -1),
        highlightedNodes: [u, v],
        highlightedEdges: [edge.id],
        description: `Inspecting directed transaction edge ${u} → ${v} (Tx: ${edge.transactionId}).`,
        pseudoCodeLine: 5,
      });

      if (disc[v] === -1) {
        // v is unvisited, recurse
        sccDFS(v);
        // On return, update low-link
        low[u] = Math.min(low[u], low[v]);

        steps.push({
          stepNumber: stepCounter++,
          algorithmName: 'SCC',
          action: 'UPDATE_LOW_LINK',
          currentNode: u,
          targetNode: v,
          stackState: stack.toArray(),
          visitedNodes: Object.keys(disc).filter((k) => disc[k] !== -1),
          highlightedNodes: [u],
          highlightedEdges: [],
          description: `Updated low-link of [${u}] to min(low[${u}], low[${v}]) = ${low[u]} via subtree from [${v}].`,
          pseudoCodeLine: 8,
        });
      } else if (onStack[v]) {
        // v is in stack, back edge to current component
        low[u] = Math.min(low[u], disc[v]);

        steps.push({
          stepNumber: stepCounter++,
          algorithmName: 'SCC',
          action: 'CROSS_EDGE_TO_STACK',
          currentNode: u,
          targetNode: v,
          currentEdge: edge.id,
          stackState: stack.toArray(),
          visitedNodes: Object.keys(disc).filter((k) => disc[k] !== -1),
          highlightedNodes: [u, v],
          highlightedEdges: [edge.id],
          description: `Back-edge or cross-edge to stack ancestor [${v}]. Updated low[${u}] = min(low[${u}], disc[${v}]) = ${low[u]}.`,
          pseudoCodeLine: 10,
        });
      }
    }

    // If u is root of an SCC
    if (low[u] === disc[u]) {
      const componentNodes: string[] = [];
      let w: string | undefined;

      do {
        w = stack.pop();
        if (w) {
          onStack[w] = false;
          componentNodes.push(w);
        }
      } while (w && w !== u);

      // Calculate internal volume and edges
      let internalEdgeCount = 0;
      let internalVolume = 0;
      const nodeSet = new Set(componentNodes);

      for (const node of componentNodes) {
        const outEdges = graph.getOutgoingEdges(node);
        for (const e of outEdges) {
          if (nodeSet.has(e.target)) {
            internalEdgeCount++;
            internalVolume += e.weight;
          }
        }
      }

      const isMultiNodeRing = componentNodes.length >= 2;
      const group: SCCGroup = {
        id: `SCC-${components.length + 1}`,
        nodes: componentNodes,
        internalEdgeCount,
        internalVolume,
        riskRating: isMultiNodeRing ? (componentNodes.length >= 4 ? 'HIGH' : 'MEDIUM') : 'LOW',
        explanation: isMultiNodeRing
          ? `These ${componentNodes.length} accounts form a strongly connected component in the directed transaction graph. Every account can reach every other account through a cyclic chain of transactions.`
          : `Single account component [${componentNodes[0]}]; no mutual cyclic transfer loop.`,
      };

      components.push(group);

      steps.push({
        stepNumber: stepCounter++,
        algorithmName: 'SCC',
        action: 'SCC_FORMED',
        currentNode: u,
        stackState: stack.toArray(),
        visitedNodes: Object.keys(disc).filter((k) => disc[k] !== -1),
        highlightedNodes: componentNodes,
        highlightedEdges: [],
        description: isMultiNodeRing
          ? `POTENTIAL TRANSACTION RING FORMED! Low[${u}] === Disc[${u}] (${low[u]}). Popped ${componentNodes.length} accounts: [${componentNodes.join(', ')}]. Internal Volume: ₹${internalVolume.toLocaleString('en-IN')}.`
          : `Trivial SCC resolved for single node [${componentNodes[0]}].`,
        pseudoCodeLine: 13,
        metadata: { scc: group },
      });
    }
  }

  for (const id of nodeIds) {
    if (disc[id] === -1) {
      sccDFS(id);
    }
  }

  steps.push({
    stepNumber: stepCounter++,
    algorithmName: 'SCC',
    action: 'COMPLETE',
    stackState: [],
    visitedNodes: nodeIds,
    highlightedNodes: components.flatMap((c) => (c.nodes.length > 1 ? c.nodes : [])),
    highlightedEdges: [],
    description: `Tarjan's SCC completed. Identified ${components.length} total components (${components.filter((c) => c.nodes.length > 1).length} multi-account transaction rings).`,
    pseudoCodeLine: 16,
  });

  return {
    components,
    steps,
    algorithmUsed: "Tarjan's Algorithm (Low-Link DFS)",
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
  };
}
