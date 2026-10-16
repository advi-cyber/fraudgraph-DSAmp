import { Graph } from '../dataStructures/Graph';
import { Transaction } from '../types/transaction';
import { GraphStats } from '../types/graph';
import {
  DatasetDefinition,
  DatasetValidationResult,
  ValidationDiagnostic,
  ApplicationSnapshot,
} from '../types/dataset';
import { getDatasetById } from './datasetRegistry';
import { calculateGraphLayout } from '../utils/graphLayout';
import { detectDirectedCycles } from '../algorithms/cycleDetection';
import { runTarjanSCC } from '../algorithms/stronglyConnectedComponents';
import { calculateAccountRisk } from './riskAnalyzer';
import { buildGraphFromTransactions } from './graphBuilder';

/**
 * Validates dataset schema, record integrity, and topological consistency.
 */
export function validateDataset(dataset: DatasetDefinition): DatasetValidationResult {
  const errors: ValidationDiagnostic[] = [];
  const warnings: ValidationDiagnostic[] = [];
  const seenTxIds = new Set<string>();
  const accountsSet = new Set<string>();

  if (!dataset.id || dataset.id.trim() === '') {
    errors.push({
      type: 'ERROR',
      code: 'DATASET_ID_EMPTY',
      message: 'Dataset definition must have a valid non-empty identifier.',
    });
  }

  if (!dataset.transactions || !Array.isArray(dataset.transactions)) {
    errors.push({
      type: 'ERROR',
      code: 'DATASET_TRANSACTIONS_INVALID',
      message: 'Dataset transactions must be an array.',
    });
    return {
      isValid: false,
      errors,
      warnings,
      accountCount: 0,
      transactionCount: 0,
    };
  }

  // Inspect each transaction record
  dataset.transactions.forEach((tx, idx) => {
    const rowNum = idx + 1;

    if (!tx.id || tx.id.trim() === '') {
      errors.push({
        type: 'ERROR',
        code: 'TX_ID_MISSING',
        message: `Row ${rowNum}: Transaction record is missing a unique ID.`,
        recordId: tx.id,
      });
    } else if (seenTxIds.has(tx.id)) {
      warnings.push({
        type: 'WARNING',
        code: 'TX_ID_DUPLICATE',
        message: `Transaction ID "${tx.id}" is duplicated across parallel transfers.`,
        recordId: tx.id,
      });
    } else {
      seenTxIds.add(tx.id);
    }

    if (!tx.sender || tx.sender.trim() === '') {
      errors.push({
        type: 'ERROR',
        code: 'SENDER_MISSING',
        message: `Row ${rowNum} (${tx.id || 'unknown'}): Sender account is missing.`,
        recordId: tx.id,
      });
    } else {
      accountsSet.add(tx.sender.trim().toUpperCase());
    }

    if (!tx.receiver || tx.receiver.trim() === '') {
      errors.push({
        type: 'ERROR',
        code: 'RECEIVER_MISSING',
        message: `Row ${rowNum} (${tx.id || 'unknown'}): Receiver account is missing.`,
        recordId: tx.id,
      });
    } else {
      accountsSet.add(tx.receiver.trim().toUpperCase());
    }

    if (tx.sender && tx.receiver && tx.sender.trim().toUpperCase() === tx.receiver.trim().toUpperCase()) {
      warnings.push({
        type: 'WARNING',
        code: 'SELF_LOOP_TRANSACTION',
        message: `Row ${rowNum} (${tx.id}): Self-transfer within single account "${tx.sender}".`,
        recordId: tx.id,
      });
    }

    if (typeof tx.amount !== 'number' || !Number.isFinite(tx.amount)) {
      errors.push({
        type: 'ERROR',
        code: 'AMOUNT_INVALID',
        message: `Row ${rowNum} (${tx.id}): Amount "${tx.amount}" must be a finite number.`,
        recordId: tx.id,
      });
    } else if (tx.amount <= 0) {
      warnings.push({
        type: 'WARNING',
        code: 'AMOUNT_NON_POSITIVE',
        message: `Row ${rowNum} (${tx.id}): Amount is zero or negative (₹${tx.amount}).`,
        recordId: tx.id,
      });
    }

    if (tx.timestamp) {
      const parsedDate = Date.parse(tx.timestamp);
      if (isNaN(parsedDate)) {
        warnings.push({
          type: 'WARNING',
          code: 'TIMESTAMP_INVALID',
          message: `Row ${rowNum} (${tx.id}): Timestamp "${tx.timestamp}" is not ISO-8601 compliant.`,
          recordId: tx.id,
        });
      }
    }
  });

  if (dataset.isolatedNodes) {
    dataset.isolatedNodes.forEach((nodeId) => {
      accountsSet.add(nodeId.trim().toUpperCase());
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    accountCount: accountsSet.size,
    transactionCount: dataset.transactions.length,
  };
}

/**
 * Normalizes transaction records into canonical types without mutating originals.
 */
export function normalizeTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.map((tx, idx) => ({
    id: tx.id ? tx.id.trim() : `TX_AUTO_${idx + 1}`,
    sender: tx.sender ? tx.sender.trim().toUpperCase() : 'UNKNOWN_SENDER',
    receiver: tx.receiver ? tx.receiver.trim().toUpperCase() : 'UNKNOWN_RECEIVER',
    amount: typeof tx.amount === 'number' && Number.isFinite(tx.amount) ? tx.amount : 0,
    timestamp: tx.timestamp || new Date().toISOString(),
    description: tx.description || 'Normalized Transaction',
    type: tx.type || 'TRANSFER',
    status: tx.status || 'COMPLETED',
  }));
}

/**
 * Constructs the canonical Graph instance from normalized transactions.
 */
export function constructCanonicalGraph(
  transactions: Transaction[],
  isolatedNodes: string[] = []
): Graph {
  const graph = buildGraphFromTransactions(transactions);

  // Preserve isolated accounts with zero incident edges
  if (isolatedNodes && isolatedNodes.length > 0) {
    for (const isolatedId of isolatedNodes) {
      if (!graph.hasNode(isolatedId)) {
        graph.addNode(isolatedId, {
          accountHolder: `Isolated Account ${isolatedId}`,
          accountType: 'PERSONAL',
          inDegree: 0,
          outDegree: 0,
          totalInAmount: 0,
          totalOutAmount: 0,
        });
      }
    }
  }

  return graph;
}

/**
 * Derives comprehensive graph statistics in a single deterministic pass.
 */
export function computeDerivedStats(graph: Graph): GraphStats {
  const cycleRes = detectDirectedCycles(graph);
  const sccRes = runTarjanSCC(graph);
  const nodeCount = graph.getNodeCount();
  const edgeCount = graph.getEdgeCount();
  const totalVolume = graph.getTotalTransactionVolume();
  const avgDegree = nodeCount > 0 ? (edgeCount * 2) / nodeCount : 0;
  const density = nodeCount > 1 ? edgeCount / (nodeCount * (nodeCount - 1)) : 0;
  const multiNodeSCC = sccRes.components.filter((c) => c.nodes.length >= 2);

  let suspiciousAccountsCount = 0;
  const cycleNodesSet = new Set(cycleRes.cycles.flatMap((c) => c.nodes));

  for (const nodeId of graph.getNodeIds()) {
    if (cycleNodesSet.has(nodeId)) {
      suspiciousAccountsCount++;
    } else {
      const risk = calculateAccountRisk(graph, nodeId, cycleRes, sccRes);
      if (risk.score >= 50) {
        suspiciousAccountsCount++;
      }
    }
  }

  return {
    totalNodes: nodeCount,
    totalEdges: edgeCount,
    totalVolume,
    averageDegree: Number(avgDegree.toFixed(2)),
    density: Number(density.toFixed(3)),
    detectedCyclesCount: cycleRes.cycles.length,
    suspiciousRingsCount: multiNodeSCC.length,
    stronglyConnectedCount: sccRes.components.length,
    suspiciousAccountsCount,
  };
}

/**
 * Executes the complete end-to-end data pipeline to construct an atomic ApplicationSnapshot.
 *
 * Pipeline Flow:
 * Registry Lookup → Validation → Normalization → Canonical Graph → Layout → Derived Analysis → Atomic Snapshot
 */
export function createApplicationSnapshot(
  datasetId: string,
  customTransactions?: Transaction[]
): ApplicationSnapshot {
  let definition: DatasetDefinition;

  if (datasetId === 'case-custom-csv' && customTransactions) {
    definition = {
      id: 'case-custom-csv',
      name: 'Custom CSV Dataset',
      description: 'Transactions dynamically imported from user CSV file.',
      category: 'CUSTOM',
      recommendedStartNode: customTransactions[0]?.sender || 'ACC-1',
      expectedCycles: 0,
      expectedSCCs: 0,
      transactions: customTransactions,
    };
  } else {
    // Explicit lookup. Never silently falls back to dataset 5.
    definition = getDatasetById(datasetId);
  }

  // 1. Validation
  const validation = validateDataset(definition);

  // 2. Normalization
  const normalizedTxs = normalizeTransactions(definition.transactions);

  // 3. Canonical Graph Construction
  const graph = constructCanonicalGraph(normalizedTxs, definition.isolatedNodes);

  // 4. Deterministic Graph Layout
  const layout = calculateGraphLayout(graph);

  // 5. Derived Analysis & Statistics
  const stats = computeDerivedStats(graph);

  // 6. Account IDs
  const allNodeIds = graph.getNodeIds();

  // Determine safe recommended start/target nodes
  const recommendedStartNode =
    definition.recommendedStartNode && graph.hasNode(definition.recommendedStartNode)
      ? definition.recommendedStartNode
      : allNodeIds[0] || '';

  const recommendedTargetNode =
    definition.recommendedTargetNode && graph.hasNode(definition.recommendedTargetNode)
      ? definition.recommendedTargetNode
      : allNodeIds.length > 1
      ? allNodeIds[allNodeIds.length - 1]
      : undefined;

  return {
    datasetId: definition.id,
    datasetName: definition.name,
    description: definition.description,
    category: definition.category,
    recommendedStartNode,
    recommendedTargetNode,
    graph,
    transactions: normalizedTxs,
    allNodeIds,
    stats,
    layout,
    validation,
    timestamp: new Date().toISOString(),
  };
}
