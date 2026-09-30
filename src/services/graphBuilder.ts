import { Graph } from '../dataStructures/Graph';
import { Transaction } from '../types/transaction';
import { NodeData, EdgeData } from '../types/graph';
import { calculateGraphLayout } from '../utils/graphLayout';

/**
 * Builds an adjacency list Graph from a collection of transactions.
 * Calculates in-degree, out-degree, total amounts, and initial node classifications.
 */
export function buildGraphFromTransactions(transactions: Transaction[]): Graph {
  const graph = new Graph();

  // First pass: add all edges (nodes are auto-created)
  for (const tx of transactions) {
    graph.addEdge({
      source: tx.sender,
      target: tx.receiver,
      weight: tx.amount,
      metadata: {
        transactionId: tx.id,
        timestamp: tx.timestamp,
        description: tx.description,
        type: tx.type,
        status: tx.status,
      },
      id: tx.id,
    });
  }

  // Second pass: enrich node metadata
  for (const node of graph.getNodes()) {
    const inDeg = graph.getInDegree(node.id);
    const outDeg = graph.getOutDegree(node.id);
    const totalIn = graph.getTotalInAmount(node.id);
    const totalOut = graph.getTotalOutAmount(node.id);

    // Identify account type heuristic
    let accountType: NodeData['accountType'] = 'PERSONAL';
    if (node.id.includes('CORP') || node.id.includes('PAYROLL') || node.id.includes('AUDIT')) {
      accountType = 'BUSINESS';
    } else if (node.id.includes('MERCHANT') || node.id.includes('SUPPLIER') || node.id.includes('LOGISTICS')) {
      accountType = 'MERCHANT';
    } else if (node.id.includes('SHELL') || node.id.includes('OFFSHORE')) {
      accountType = 'SHELL_COMPANY';
    } else if (node.id.includes('MULE') || node.id.includes('HEIST')) {
      accountType = 'MULE_CANDIDATE';
    }

    node.metadata = {
      ...node.metadata,
      accountHolder: getAccountHolderName(node.id),
      accountType,
      inDegree: inDeg,
      outDegree: outDeg,
      totalInAmount: totalIn,
      totalOutAmount: totalOut,
    };
  }

  return graph;
}

function getAccountHolderName(accountId: string): string {
  const map: Record<string, string> = {
    'CORP-CORP01': 'Apex Global Holdings Inc.',
    'PAYROLL-OPS': 'Enterprise Automated Payroll Hub',
    'EMP-ANIKET': 'Aniket Sharma',
    'EMP-PRIYA': 'Priya Nair',
    'EMP-ROHAN': 'Rohan Mehta',
    'EMP-NEHA': 'Neha Verma',
    'MERCHANT-GROCERY': 'FreshMart Supermarkets Ltd.',
    'MERCHANT-UTILITY': 'National Grid Electricity Corp.',
    'MERCHANT-AUTO': 'Apex Motors & Service',
    'MERCHANT-CLOTHING': 'Urban Vogue Retailers',
    'INVEST-MUTUAL': 'HDFC Prudential Mutual Fund',
    'SAVINGS-RESERVE': 'Federal High-Yield Reserve',
    'SUPPLIER-AGRO': 'Kisan Agro Producers Syndicate',
    'LOGISTICS-FREIGHT': 'Trans-India Freight Logistics',
    'ACC-ALPHA': 'Nexus Trading Consortium (Alpha)',
    'ACC-BETA': 'Bluecrest Capital Intermediary',
    'ACC-GAMMA': 'Crestview Liquidity Vault',
    'ACC-DELTA': 'Delta Horizon Management',
    'SHELL-HOLDING': 'Grand Cayman Offshore Holdings',
    'OFFSHORE-LLC': 'Panama Meridian Ventures LLC',
    'CONSULTING-CORP': 'Geneva Strategic Advisory SA',
    'ORIGIN-HEIST': 'Compromised Gateway Hub',
    'MULE-TIER1': 'Intermediary Account Tier 1',
    'MULE-TIER2': 'Intermediary Account Tier 2',
    'MULE-TIER3': 'Intermediary Account Tier 3',
    'MULE-TIER4': 'Intermediary Account Tier 4',
    'EXFIL-CRYPTO-DESK': 'Decentralized OTC Liquidity Pool',
    'ATM-CASH-OUT': 'Kolkata Central ATM Cash-out',
    'TAX-AUTHORITY': 'Goods & Services Tax Department',
    'AUDIT-FIRM': 'KPMG Allied Assurance LLP',
    'CLOUD-INFRA': 'AWS Cloud Compute Infrastructure',
    'LEGAL-COUNSEL': 'Khaitan & Partners Legal Advisory',
    'SUPPLIER-PARTS': 'Bharat Heavy Components Pvt.',
  };
  return map[accountId] || `Account ${accountId}`;
}

/**
 * Converts internal Graph data structures to React Flow compatible nodes and edges.
 */
export function convertGraphToFlowElements(
  graph: Graph,
  highlightedNodes: string[] = [],
  highlightedEdges: string[] = [],
  cycleEdgeIds: string[] = []
) {
  const layout = calculateGraphLayout(graph, highlightedNodes);
  const flowNodes = graph.getNodes().map((node) => {
    const pos = layout.get(node.id) || { x: 300, y: 300 };
    const isHighlighted = highlightedNodes.includes(node.id);
    const nodeData: NodeData = {
      id: node.id,
      label: node.label,
      accountHolder: node.metadata.accountHolder,
      accountType: node.metadata.accountType || 'PERSONAL',
      inDegree: graph.getInDegree(node.id),
      outDegree: graph.getOutDegree(node.id),
      totalInAmount: graph.getTotalInAmount(node.id),
      totalOutAmount: graph.getTotalOutAmount(node.id),
      riskScore: node.metadata.riskScore || 10,
      riskLevel: node.metadata.riskLevel || 'LOW',
    };

    return {
      id: node.id,
      type: 'accountNode',
      position: pos,
      data: {
        ...nodeData,
        isHighlighted,
      },
    };
  });

  const flowEdges = graph.getEdges().map((edge) => {
    const isHighlighted = highlightedEdges.includes(edge.id);
    const isCycle = cycleEdgeIds.includes(edge.id);

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'transactionEdge',
      animated: isHighlighted || isCycle,
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        amount: edge.weight,
        transactionId: edge.transactionId,
        timestamp: edge.timestamp,
        description: edge.metadata.description,
        isCycleEdge: isCycle,
        isHighlighted: isHighlighted,
      },
      style: {
        stroke: isCycle ? '#ef4444' : isHighlighted ? '#38bdf8' : '#64748b',
        strokeWidth: isCycle ? 3 : isHighlighted ? 2.5 : 1.5,
      },
    };
  });

  return { flowNodes, flowEdges };
}
