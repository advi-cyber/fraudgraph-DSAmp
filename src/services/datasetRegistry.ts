import { DatasetDefinition, DatasetCategory } from '../types/dataset';
import { normalTransactions } from '../data/normalTransactions';
import { suspiciousTransactions } from '../data/suspiciousTransactions';

/**
 * Authoritative Central Dataset Registry.
 * Centralizes all 9 established scenarios with stable IDs, human-readable titles,
 * explicit metadata, and non-mutating record access.
 */
const REGISTRY_DATASETS: DatasetDefinition[] = [
  {
    id: 'case-normal',
    name: 'Dataset 1: Normal Commerce Network',
    description:
      'Standard corporate payroll disbursement and everyday merchant commerce. Completely acyclic directed graph with no circular flows.',
    category: 'NORMAL',
    recommendedStartNode: 'CORP-CORP01',
    recommendedTargetNode: 'MERCHANT-GROCERY',
    expectedCycles: 0,
    expectedSCCs: 0,
    transactions: normalTransactions,
  },
  {
    id: 'case-simple-cycle',
    name: 'Dataset 2: Simple 4-Node Circular Ring',
    description:
      'A classic circular layering scheme: ACC-ALPHA → ACC-BETA → ACC-GAMMA → ACC-DELTA → ACC-ALPHA. Funds return to the originator with nominal friction losses.',
    category: 'CYCLE',
    recommendedStartNode: 'ACC-ALPHA',
    recommendedTargetNode: 'ACC-GAMMA',
    expectedCycles: 1,
    expectedSCCs: 1,
    transactions: suspiciousTransactions.slice(0, 4),
  },
  {
    id: 'case-multiple-rings',
    name: 'Dataset 3: Multiple Interconnected Rings',
    description:
      'Two separate circular laundering syndicates connected by an inter-syndicate rebalancing edge. Demonstrates Tarjan SCC cluster separation.',
    category: 'RINGS',
    recommendedStartNode: 'ACC-ALPHA',
    recommendedTargetNode: 'OFFSHORE-LLC',
    expectedCycles: 2,
    expectedSCCs: 2,
    transactions: [
      ...suspiciousTransactions.slice(0, 4),
      ...suspiciousTransactions.slice(4, 7),
      suspiciousTransactions[12], // Inter-ring bridge
    ],
  },
  {
    id: 'case-long-chain',
    name: 'Dataset 4: Long Layering Mule Chain',
    description:
      'A multi-hop linear transaction chain designed to obscure origin funds through rapid successive hops (ORIGIN-HEIST → MULE-1 → MULE-2 → MULE-3 → MULE-4 → EXFIL).',
    category: 'CHAIN',
    recommendedStartNode: 'ORIGIN-HEIST',
    recommendedTargetNode: 'EXFIL-CRYPTO-DESK',
    expectedCycles: 0,
    expectedSCCs: 0,
    transactions: suspiciousTransactions.slice(7, 12),
  },
  {
    id: 'case-complex-network',
    name: 'Dataset 5: Complex Enterprise Network (28 Accounts, 60+ Transactions)',
    description:
      'Comprehensive financial graph containing legitimate corporate payrolls, merchant commerce hubs, 2 suspicious circular rings, and an exfiltration chain.',
    category: 'COMPLEX',
    recommendedStartNode: 'CORP-CORP01',
    recommendedTargetNode: 'ACC-DELTA',
    expectedCycles: 2,
    expectedSCCs: 2,
    transactions: [
      ...normalTransactions,
      ...suspiciousTransactions,
      {
        id: 'TX3001',
        sender: 'CORP-CORP01',
        receiver: 'AUDIT-FIRM',
        amount: 350000,
        timestamp: '2026-09-02T11:00:00Z',
        description: 'Statutory Financial Audit Retainer',
        type: 'WIRE',
        status: 'COMPLETED',
      },
      {
        id: 'TX3002',
        sender: 'CORP-CORP01',
        receiver: 'CLOUD-INFRA',
        amount: 220000,
        timestamp: '2026-09-03T09:30:00Z',
        description: 'Multi-Region Datacenter Lease',
        type: 'WIRE',
        status: 'COMPLETED',
      },
      {
        id: 'TX3003',
        sender: 'MERCHANT-GROCERY',
        receiver: 'TAX-AUTHORITY',
        amount: 18500,
        timestamp: '2026-09-08T14:00:00Z',
        description: 'Monthly GST Tax Remittance',
        type: 'TRANSFER',
        status: 'COMPLETED',
      },
      {
        id: 'TX3004',
        sender: 'SUPPLIER-AGRO',
        receiver: 'TAX-AUTHORITY',
        amount: 12000,
        timestamp: '2026-09-08T15:10:00Z',
        description: 'Advance Commercial Tax',
        type: 'TRANSFER',
        status: 'COMPLETED',
      },
      {
        id: 'TX3005',
        sender: 'EMP-ROHAN',
        receiver: 'INVEST-MUTUAL',
        amount: 30000,
        timestamp: '2026-09-09T08:00:00Z',
        description: 'Equity Mutual Fund Systematic Investment',
        type: 'TRANSFER',
        status: 'COMPLETED',
      },
      {
        id: 'TX3006',
        sender: 'EMP-NEHA',
        receiver: 'SAVINGS-RESERVE',
        amount: 40000,
        timestamp: '2026-09-09T09:00:00Z',
        description: 'Fixed Deposit Certificate',
        type: 'TRANSFER',
        status: 'COMPLETED',
      },
      {
        id: 'TX3007',
        sender: 'AUDIT-FIRM',
        receiver: 'LEGAL-COUNSEL',
        amount: 80000,
        timestamp: '2026-09-11T16:00:00Z',
        description: 'Regulatory Compliance Opinion',
        type: 'TRANSFER',
        status: 'COMPLETED',
      },
      {
        id: 'TX3008',
        sender: 'MERCHANT-AUTO',
        receiver: 'SUPPLIER-PARTS',
        amount: 98000,
        timestamp: '2026-09-12T10:00:00Z',
        description: 'OEM Spare Parts Batch Procurement',
        type: 'WIRE',
        status: 'COMPLETED',
      },
      {
        id: 'TX3009',
        sender: 'SUPPLIER-PARTS',
        receiver: 'LOGISTICS-FREIGHT',
        amount: 16500,
        timestamp: '2026-09-12T13:45:00Z',
        description: 'Interstate Air Cargo Courier',
        type: 'TRANSFER',
        status: 'COMPLETED',
      },
      {
        id: 'TX3010',
        sender: 'MULE-TIER4',
        receiver: 'ATM-CASH-OUT',
        amount: 75000,
        timestamp: '2026-09-15T05:45:00Z',
        description: 'ATM Quick Cash Withdrawal',
        type: 'ATM',
        status: 'FLAGGED',
      },
      {
        id: 'TX3011',
        sender: 'ATM-CASH-OUT',
        receiver: 'ACC-ALPHA',
        amount: 70000,
        timestamp: '2026-09-16T12:00:00Z',
        description: 'Cash Deposit Structuring',
        type: 'ATM',
        status: 'FLAGGED',
      },
      {
        id: 'TX3012',
        sender: 'OFFSHORE-LLC',
        receiver: 'INVEST-MUTUAL',
        amount: 150000,
        timestamp: '2026-09-17T14:20:00Z',
        description: 'Foreign Portfolio Investment Inflow',
        type: 'WIRE',
        status: 'COMPLETED',
      },
      {
        id: 'TX3013',
        sender: 'STRUCT-SRC1',
        receiver: 'STRUCT-COLLECTOR',
        amount: 48000,
        timestamp: '2026-09-18T10:05:00Z',
        description: 'Retail Inbound Deposit Leg 1',
        type: 'TRANSFER',
        status: 'FLAGGED',
      },
      {
        id: 'TX3014',
        sender: 'STRUCT-SRC2',
        receiver: 'STRUCT-COLLECTOR',
        amount: 49500,
        timestamp: '2026-09-18T10:18:00Z',
        description: 'Retail Inbound Deposit Leg 2',
        type: 'TRANSFER',
        status: 'FLAGGED',
      },
      {
        id: 'TX3015',
        sender: 'STRUCT-SRC3',
        receiver: 'STRUCT-COLLECTOR',
        amount: 47000,
        timestamp: '2026-09-18T10:35:00Z',
        description: 'Retail Inbound Deposit Leg 3',
        type: 'TRANSFER',
        status: 'FLAGGED',
      },
      {
        id: 'TX3016',
        sender: 'DISPERSE-ORIGIN',
        receiver: 'DISPERSE-DST1',
        amount: 120000,
        timestamp: '2026-09-19T09:10:00Z',
        description: 'Rapid Outbound Tranche Alpha',
        type: 'WIRE',
        status: 'FLAGGED',
      },
      {
        id: 'TX3017',
        sender: 'DISPERSE-ORIGIN',
        receiver: 'DISPERSE-DST2',
        amount: 115000,
        timestamp: '2026-09-19T09:20:00Z',
        description: 'Rapid Outbound Tranche Beta',
        type: 'WIRE',
        status: 'FLAGGED',
      },
      {
        id: 'TX3018',
        sender: 'DISPERSE-ORIGIN',
        receiver: 'DISPERSE-DST3',
        amount: 110000,
        timestamp: '2026-09-19T09:30:00Z',
        description: 'Rapid Outbound Tranche Gamma',
        type: 'WIRE',
        status: 'FLAGGED',
      },
      {
        id: 'TX3019',
        sender: 'EMP-ROHAN',
        receiver: 'MULE-RECEIVE',
        amount: 250000,
        timestamp: '2026-09-20T14:00:00Z',
        description: 'Inbound Infiltration Liquidity',
        type: 'TRANSFER',
        status: 'FLAGGED',
      },
      {
        id: 'TX3020',
        sender: 'MULE-RECEIVE',
        receiver: 'MULE-PASS',
        amount: 245000,
        timestamp: '2026-09-20T14:12:00Z',
        description: 'Immediate Mule Outbound Forwarding (12 mins)',
        type: 'TRANSFER',
        status: 'FLAGGED',
      },
      {
        id: 'TX3021',
        sender: 'ISOLATED-TRUST',
        receiver: 'ISOLATED-FOUNDATION',
        amount: 160000,
        timestamp: '2026-09-21T11:00:00Z',
        description: 'Isolated Autonomous Subnet Movement',
        type: 'WIRE',
        status: 'COMPLETED',
      },
    ],
  },
  {
    id: 'case-fan-in',
    name: 'Dataset 6: Fan-In Structuring (Smurfing)',
    description:
      'Multiple independent satellite accounts depositing amounts just under threshold into a single aggregator hub within minutes.',
    category: 'STRUCTURING',
    recommendedStartNode: 'STRUCT-SRC1',
    recommendedTargetNode: 'STRUCT-COLLECTOR',
    expectedCycles: 0,
    expectedSCCs: 0,
    transactions: [
      {
        id: 'TX6001',
        sender: 'STRUCT-SRC1',
        receiver: 'STRUCT-COLLECTOR',
        amount: 48000,
        timestamp: '2026-09-18T10:05:00Z',
        description: 'Smurfed Deposit 1',
        type: 'TRANSFER',
        status: 'FLAGGED',
      },
      {
        id: 'TX6002',
        sender: 'STRUCT-SRC2',
        receiver: 'STRUCT-COLLECTOR',
        amount: 49500,
        timestamp: '2026-09-18T10:18:00Z',
        description: 'Smurfed Deposit 2',
        type: 'TRANSFER',
        status: 'FLAGGED',
      },
      {
        id: 'TX6003',
        sender: 'STRUCT-SRC3',
        receiver: 'STRUCT-COLLECTOR',
        amount: 47000,
        timestamp: '2026-09-18T10:35:00Z',
        description: 'Smurfed Deposit 3',
        type: 'TRANSFER',
        status: 'FLAGGED',
      },
      {
        id: 'TX6004',
        sender: 'STRUCT-COLLECTOR',
        receiver: 'MERCHANT-GROCERY',
        amount: 12000,
        timestamp: '2026-09-18T12:00:00Z',
        description: 'Incidental Outflow',
        type: 'MERCHANT',
        status: 'COMPLETED',
      },
    ],
  },
  {
    id: 'case-fan-out',
    name: 'Dataset 7: Fan-Out Dispersion (Layering)',
    description:
      'A single capital source rapidly dispersing funds to multiple outward recipients in short succession to evade threshold limits.',
    category: 'DISPERSION',
    recommendedStartNode: 'DISPERSE-ORIGIN',
    recommendedTargetNode: 'DISPERSE-DST2',
    expectedCycles: 0,
    expectedSCCs: 0,
    transactions: [
      {
        id: 'TX7001',
        sender: 'DISPERSE-ORIGIN',
        receiver: 'DISPERSE-DST1',
        amount: 120000,
        timestamp: '2026-09-19T09:10:00Z',
        description: 'Outbound Dispersion Leg 1',
        type: 'WIRE',
        status: 'FLAGGED',
      },
      {
        id: 'TX7002',
        sender: 'DISPERSE-ORIGIN',
        receiver: 'DISPERSE-DST2',
        amount: 115000,
        timestamp: '2026-09-19T09:20:00Z',
        description: 'Outbound Dispersion Leg 2',
        type: 'WIRE',
        status: 'FLAGGED',
      },
      {
        id: 'TX7003',
        sender: 'DISPERSE-ORIGIN',
        receiver: 'DISPERSE-DST3',
        amount: 110000,
        timestamp: '2026-09-19T09:30:00Z',
        description: 'Outbound Dispersion Leg 3',
        type: 'WIRE',
        status: 'FLAGGED',
      },
    ],
  },
  {
    id: 'case-pass-through',
    name: 'Dataset 8: Rapid Mule Pass-Through',
    description:
      'Classic money mule transit: account receives ₹250,000 and immediately forwards ₹245,000 within 12 minutes, leaving nominal residual balance.',
    category: 'PASS_THROUGH',
    recommendedStartNode: 'EMP-ROHAN',
    recommendedTargetNode: 'MULE-PASS',
    expectedCycles: 0,
    expectedSCCs: 0,
    transactions: [
      {
        id: 'TX8001',
        sender: 'EMP-ROHAN',
        receiver: 'MULE-RECEIVE',
        amount: 250000,
        timestamp: '2026-09-20T14:00:00Z',
        description: 'Inbound Staged Capital',
        type: 'TRANSFER',
        status: 'FLAGGED',
      },
      {
        id: 'TX8002',
        sender: 'MULE-RECEIVE',
        receiver: 'MULE-PASS',
        amount: 245000,
        timestamp: '2026-09-20T14:12:00Z',
        description: 'Forwarding Outflow (98% Retention Loss in 12m)',
        type: 'TRANSFER',
        status: 'FLAGGED',
      },
    ],
  },
  {
    id: 'case-disconnected',
    name: 'Dataset 9: Disconnected Financial Clusters',
    description:
      'Contains an isolated corporate subnet that has zero paths to the rest of the banking network. Used to test shortest-path reachability and disconnected handling.',
    category: 'DISCONNECTED',
    recommendedStartNode: 'CORP-CORP01',
    recommendedTargetNode: 'ISOLATED-FOUNDATION',
    expectedCycles: 0,
    expectedSCCs: 0,
    transactions: [
      ...normalTransactions.slice(0, 5),
      {
        id: 'TX9001',
        sender: 'ISOLATED-TRUST',
        receiver: 'ISOLATED-FOUNDATION',
        amount: 160000,
        timestamp: '2026-09-21T11:00:00Z',
        description: 'Disconnected Private Endowment',
        type: 'WIRE',
        status: 'COMPLETED',
      },
    ],
  },
];

const DATASET_MAP: Map<string, DatasetDefinition> = new Map(
  REGISTRY_DATASETS.map((d) => [d.id, d])
);

/**
 * Returns all 9 registered datasets in canonical order.
 */
export function getAllDatasets(): DatasetDefinition[] {
  return [...REGISTRY_DATASETS];
}

/**
 * Resolves a dataset by its stable unique ID.
 * Throws explicit Error if not found — NEVER silently falls back to dataset 5.
 */
export function getDatasetById(id: string): DatasetDefinition {
  const found = DATASET_MAP.get(id);
  if (!found) {
    const validIds = Array.from(DATASET_MAP.keys()).join(', ');
    throw new Error(
      `Dataset with ID "${id}" was not found in the Dataset Registry. Available dataset IDs are: ${validIds}`
    );
  }
  return found;
}

/**
 * Checks if a dataset ID exists in the registry.
 */
export function hasDataset(id: string): boolean {
  return DATASET_MAP.has(id);
}

// Backward-compatible alias for existing imports
export const sampleCases = REGISTRY_DATASETS;
export type DemoCase = DatasetDefinition;
