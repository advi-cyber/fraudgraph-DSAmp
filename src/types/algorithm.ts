export type AlgorithmType = 'BFS' | 'DFS' | 'CYCLE_DETECTION' | 'DIJKSTRA' | 'SCC';

export interface AlgorithmStep {
  stepNumber: number;
  algorithmName: AlgorithmType;
  action: string;
  currentNode?: string;
  targetNode?: string;
  currentEdge?: string;
  queueState?: string[];
  stackState?: string[];
  visitedNodes: string[];
  activePath?: string[];
  distanceTable?: Record<string, { distance: number; predecessor: string | null }>;
  highlightedNodes: string[];
  highlightedEdges: string[];
  description: string;
  pseudoCodeLine?: number;
  metadata?: Record<string, unknown>;
}

export interface BFSResult {
  startNode: string;
  traversalOrder: string[];
  visitedNodes: string[];
  treeEdges: string[];
  steps: AlgorithmStep[];
  levels: Record<string, number>;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface BFSShortestPathResult {
  source: string;
  target: string;
  shortestPath: string[];
  hopCount: number;
  edgeIds: string[];
  totalWeight: number;
  isReachable: boolean;
  steps: AlgorithmStep[];
  timeComplexity: string;
  spaceComplexity: string;
}

export interface DFSResult {
  startNode: string;
  traversalOrder: string[];
  visitedNodes: string[];
  treeEdges: string[];
  backEdges: string[];
  steps: AlgorithmStep[];
  maxDepth: number;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface DetectedCycle {
  id: string;
  nodes: string[];
  edgeIds: string[];
  totalAmount: number;
  pathDescription: string;
  evidence: string;
}

export interface CycleDetectionResult {
  hasCycle: boolean;
  cycles: DetectedCycle[];
  steps: AlgorithmStep[];
  timeComplexity: string;
  spaceComplexity: string;
}

export interface DijkstraResult {
  source: string;
  target?: string;
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  shortestPath: string[];
  totalWeight: number;
  edgeIds: string[];
  steps: AlgorithmStep[];
  timeComplexity: string;
  spaceComplexity: string;
}

export interface SCCGroup {
  id: string;
  nodes: string[];
  internalEdgeCount: number;
  internalVolume: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
}

export interface SCCResult {
  components: SCCGroup[];
  steps: AlgorithmStep[];
  algorithmUsed: string;
  timeComplexity: string;
  spaceComplexity: string;
}
