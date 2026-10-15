/**
 * Explainable Rule-Based Risk Scoring Configuration
 *
 * Defines deterministic weights, time windows, and volume thresholds
 * for calculating account fraud risk scores (0 - 100).
 *
 * NOTE: These are academic educational heuristics for graph pattern detection,
 * not a certified banking production fraud model.
 */

export interface RiskRuleConfig {
  id: string;
  name: string;
  description: string;
  weight: number;
  category: 'TOPOLOGY' | 'VELOCITY' | 'VOLUME' | 'STRUCTURING';
  threshold: {
    amount?: number;
    count?: number;
    windowMinutes?: number;
    ratio?: number;
    chainDepth?: number;
  };
}

export interface RiskEngineConfig {
  maxScore: number;
  thresholds: {
    highRiskScore: number;
    mediumRiskScore: number;
  };
  rules: {
    cycleInvolvement: RiskRuleConfig;
    sccMembership: RiskRuleConfig;
    highValueTransfer: RiskRuleConfig;
    rapidFanOut: RiskRuleConfig;
    rapidFanIn: RiskRuleConfig;
    fastPassThrough: RiskRuleConfig;
    deepLayeringChain: RiskRuleConfig;
  };
}

export const RISK_CONFIG: RiskEngineConfig = {
  maxScore: 100,
  thresholds: {
    highRiskScore: 60,
    mediumRiskScore: 30,
  },
  rules: {
    cycleInvolvement: {
      id: 'RULE_CYCLE_INVOLVEMENT',
      name: 'Circular Fund Routing (Cycle)',
      description: 'Account is a participating vertex in one or more directed transaction cycles.',
      weight: 30,
      category: 'TOPOLOGY',
      threshold: {
        count: 1, // >= 1 cycle
      },
    },
    sccMembership: {
      id: 'RULE_SCC_MEMBERSHIP',
      name: 'Strongly Connected Component Member',
      description: 'Account belongs to a strongly connected cluster with mutual reachability among members.',
      weight: 20,
      category: 'TOPOLOGY',
      threshold: {
        count: 2, // >= 2 nodes in SCC
      },
    },
    highValueTransfer: {
      id: 'RULE_HIGH_VALUE_TRANSFER',
      name: 'High-Value Single Transaction',
      description: 'Account engaged in one or more transactions exceeding demonstration threshold.',
      weight: 15,
      category: 'VOLUME',
      threshold: {
        amount: 500000, // ₹5,00,000 threshold
      },
    },
    rapidFanOut: {
      id: 'RULE_RAPID_FAN_OUT',
      name: 'Rapid Outbound Dispersion (Fan-Out)',
      description: 'Multiple outbound transfers dispatched within a tight time window (dispersion heuristic).',
      weight: 15,
      category: 'VELOCITY',
      threshold: {
        count: 3, // >= 3 outgoing transfers
        windowMinutes: 60, // within 60 minutes
      },
    },
    rapidFanIn: {
      id: 'RULE_RAPID_FAN_IN',
      name: 'Rapid Inbound Funneling (Fan-In)',
      description: 'Multiple inbound transfers received from disparate sources within a short window (structuring).',
      weight: 15,
      category: 'STRUCTURING',
      threshold: {
        count: 3, // >= 3 incoming transfers
        windowMinutes: 60, // within 60 minutes
      },
    },
    fastPassThrough: {
      id: 'RULE_FAST_PASS_THROUGH',
      name: 'Rapid Pass-Through Forwarding (Money Mule)',
      description: 'Account forwards a substantial portion of received funds within a rapid window with minimal retention.',
      weight: 15,
      category: 'VELOCITY',
      threshold: {
        ratio: 0.75, // forwards >= 75% of incoming funds
        windowMinutes: 120, // within 120 minutes of inbound credit
      },
    },
    deepLayeringChain: {
      id: 'RULE_DEEP_LAYERING_CHAIN',
      name: 'Multi-Hop Layering Chain Depth',
      description: 'Account is part of an outbound transaction chain spanning multiple consecutive hops.',
      weight: 10,
      category: 'TOPOLOGY',
      threshold: {
        chainDepth: 4, // >= 4 consecutive hops
      },
    },
  },
};
