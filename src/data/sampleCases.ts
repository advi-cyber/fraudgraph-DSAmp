import { Transaction } from '../types/transaction';
import { normalTransactions } from './normalTransactions';
import { suspiciousTransactions } from './suspiciousTransactions';

export interface DemoCase {
  id: string;
  name: string;
  description: string;
  category: 'NORMAL' | 'CYCLE' | 'RINGS' | 'CHAIN' | 'COMPLEX';
  recommendedStartNode: string;
  recommendedTargetNode?: string;
  expectedCycles: number;
  expectedSCCs: number;
  transactions: Transaction[];
}

export const sampleCases: DemoCase[] = [
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
      // Additional transactions to enrich the graph to 25+ accounts and 50+ transactions
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
    ],
  },
];
