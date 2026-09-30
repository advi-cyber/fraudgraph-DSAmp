export interface AlgorithmComplexityInfo {
  name: string;
  category: string;
  timeComplexity: string;
  spaceComplexity: string;
  dataStructuresUsed: string[];
  bestUseInBanking: string;
  limitations: string;
  coMapping: string[];
}

export const ALGORITHM_COMPLEXITIES: Record<string, AlgorithmComplexityInfo> = {
  BFS: {
    name: 'Breadth-First Search (BFS)',
    category: 'Graph Traversal / Layered Exploration',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    dataStructuresUsed: ['Queue (FIFO)', 'Adjacency List', 'Visited Set'],
    bestUseInBanking:
      'Detecting immediate hop-by-hop fund dispersal, identifying accounts reachable within N transaction tiers, and tracing multi-tier fan-out distributions.',
    limitations: 'Does not account for edge weights (amounts); treats high-value and low-value transactions identically.',
    coMapping: ['CO3: Adjacency List & Queue', 'CO4: Layered Graph Search Analysis', 'CO5: Blast Radius Computation'],
  },
  DFS: {
    name: 'Depth-First Search (DFS)',
    category: 'Graph Traversal / Deep Chain Tracking',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    dataStructuresUsed: ['Call Stack / Stack (LIFO)', 'Adjacency List', 'Visited Array'],
    bestUseInBanking:
      'Following narrow, deep layering funnels (mule chains) from source of illicit funds to ultimate cash-out / offshore accounts.',
    limitations: 'Does not guarantee the shortest path; may descend deep into irrelevant branch paths without early termination.',
    coMapping: ['CO3: Stack-based Processing', 'CO4: Recursive Traversal & Backtracking', 'CO5: Linear Mule Chain Discovery'],
  },
  CYCLE_DETECTION: {
    name: 'Directed Cycle Detection (3-State DFS)',
    category: 'Topological Anomaly Detection',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    dataStructuresUsed: ['3-State Color/Status Array (0/1/2)', 'Parent Map', 'Recursion Stack'],
    bestUseInBanking:
      'Identifying circular fund routing schemes where money cycles through multiple intermediaries and returns to the originator (round-tripping/wash transactions).',
    limitations: 'Finds elementary cycles; enumeration of all cycles in dense graphs can be exponential without pruning.',
    coMapping: ['CO3: Graph Vertex Coloring & State Tracking', 'CO4: Back-Edge Cycle Proof Analysis', 'CO5: Wash Trading & Round-Tripping Detection'],
  },
  DIJKSTRA: {
    name: "Dijkstra's Shortest Path Algorithm",
    category: 'Single-Source Shortest Path',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    dataStructuresUsed: ['Min-Heap Priority Queue', 'Distance Hash Map', 'Predecessor Hash Map'],
    bestUseInBanking:
      'Finding the minimum-friction / lowest-cost fund channel between any sender and beneficiary across the banking network.',
    limitations: 'Assumes non-negative transaction edge weights; unable to handle negative balances or fee rebates.',
    coMapping: ['CO3: Binary Min-Heap Priority Queue', 'CO4: Greedy Relaxation & Invariant Proofs', 'CO5: Optimal Transaction Flow Pathing'],
  },
  SCC: {
    name: "Strongly Connected Components (Tarjan's Algorithm)",
    category: 'Graph Decomposition / Component Partitioning',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    dataStructuresUsed: ['Stack (LIFO)', 'Discovery Time Array', 'Low-Link Array', 'In-Stack Boolean Map'],
    bestUseInBanking:
      'Isolating entire organized fraud syndicates and collusion rings where every participant is reachable mutually from all others in the group.',
    limitations: 'Components may contain sub-cycles of varying transaction volumes; requires secondary volume aggregation.',
    coMapping: ['CO3: Low-Link & Discovery Time Arrays', 'CO4: Tarjan DFS Decomposition', 'CO5: Organized Laundering Syndicate Isolation'],
  },
};
