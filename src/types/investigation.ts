export interface RiskFactor {
  title: string;
  points: number;
  maxPoints: number;
  description: string;
  triggered: boolean;
}

export interface RiskBreakdown {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: RiskFactor[];
  summary: string;
  disclaimer: string;
}

export interface AccountInvestigationReport {
  investigationId: string;
  generatedAt: string;
  account: {
    id: string;
    holder: string;
    type: string;
    createdDate: string;
  };
  metrics: {
    connectedAccounts: number;
    transactionCount: number;
    totalSent: number;
    totalReceived: number;
    cycleInvolvementCount: number;
    suspiciousRingsCount: number;
    longestChainLength: number;
    inOutRatio: number;
  };
  riskBreakdown: RiskBreakdown;
  graphEvidence: {
    cycles: Array<{ id: string; path: string; amount: number }>;
    sccMembership: string[];
    directNeighbors: {
      inflowFrom: string[];
      outflowTo: string[];
    };
    longestPath: string[];
    reachabilityBFS: string[];
  };
  transactions: Array<{
    id: string;
    counterparty: string;
    direction: 'INCOMING' | 'OUTGOING';
    amount: number;
    timestamp: string;
    flagged: boolean;
  }>;
}

export interface SimulationResult {
  simulatedEdge: {
    source: string;
    target: string;
    amount: number;
    timestamp: string;
  };
  beforeState: {
    cycleCount: number;
    sccCount: number;
    sourceRisk: number;
    targetRisk: number;
  };
  afterState: {
    cycleCount: number;
    sccCount: number;
    sourceRisk: number;
    targetRisk: number;
    newCyclesDetected: Array<{ path: string; amount: number }>;
    newSCCFormed: boolean;
  };
  impactAssessment: {
    createsCycle: boolean;
    createsRing: boolean;
    riskDeltaSource: number;
    riskDeltaTarget: number;
    verdict: 'LOW_IMPACT' | 'POTENTIALLY_SUSPICIOUS' | 'HIGH_RISK_CYCLE_FORMED';
    explanation: string;
  };
}
