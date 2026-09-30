export interface NodeData {
  [key: string]: unknown;
  id: string;
  label: string;
  accountHolder?: string;
  accountType?: 'PERSONAL' | 'BUSINESS' | 'MERCHANT' | 'SHELL_COMPANY' | 'MULE_CANDIDATE';
  inDegree: number;
  outDegree: number;
  totalInAmount: number;
  totalOutAmount: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: string;
}

export interface EdgeData {
  [key: string]: unknown;
  id: string;
  source: string;
  target: string;
  amount: number;
  transactionId: string;
  timestamp: string;
  description?: string;
  isCycleEdge?: boolean;
  isHighlighted?: boolean;
}

export interface GraphLayoutNode {
  id: string;
  data: NodeData;
  position: { x: number; y: number };
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  totalVolume: number;
  averageDegree: number;
  density: number;
  detectedCyclesCount: number;
  suspiciousRingsCount: number;
  stronglyConnectedCount: number;
}
