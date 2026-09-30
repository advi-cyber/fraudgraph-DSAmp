import { useState, useMemo, useCallback } from 'react';
import { Transaction } from '../types/transaction';
import { Graph } from '../dataStructures/Graph';
import { buildGraphFromTransactions } from '../services/graphBuilder';
import { sampleCases, DemoCase } from '../data/sampleCases';
import { detectDirectedCycles } from '../algorithms/cycleDetection';
import { runTarjanSCC } from '../algorithms/stronglyConnectedComponents';
import { GraphStats } from '../types/graph';

export function useGraph(initialTransactions?: Transaction[]) {
  // Start with complex dataset (case 5) so the user has an immediate, rich banking network
  const defaultTransactions = initialTransactions || sampleCases[4].transactions;
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);
  const [activeDemoCaseId, setActiveDemoCaseId] = useState<string>('case-complex-network');

  // Build manual Graph instance
  const graph = useMemo(() => {
    return buildGraphFromTransactions(transactions);
  }, [transactions]);

  // Compute graph statistics
  const stats: GraphStats = useMemo(() => {
    const cycleRes = detectDirectedCycles(graph);
    const sccRes = runTarjanSCC(graph);
    const nodeCount = graph.getNodeCount();
    const edgeCount = graph.getEdgeCount();
    const totalVolume = graph.getTotalTransactionVolume();
    const avgDegree = nodeCount > 0 ? (edgeCount * 2) / nodeCount : 0;
    const density = nodeCount > 1 ? edgeCount / (nodeCount * (nodeCount - 1)) : 0;
    const multiNodeSCC = sccRes.components.filter((c) => c.nodes.length >= 2);

    return {
      totalNodes: nodeCount,
      totalEdges: edgeCount,
      totalVolume,
      averageDegree: Number(avgDegree.toFixed(2)),
      density: Number(density.toFixed(3)),
      detectedCyclesCount: cycleRes.cycles.length,
      suspiciousRingsCount: multiNodeSCC.length,
      stronglyConnectedCount: sccRes.components.length,
    };
  }, [graph]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'> & { id?: string }) => {
    const newTx: Transaction = {
      id: tx.id || `TX${Math.floor(1000 + Math.random() * 9000)}`,
      sender: tx.sender.trim().toUpperCase(),
      receiver: tx.receiver.trim().toUpperCase(),
      amount: Number(tx.amount),
      timestamp: tx.timestamp || new Date().toISOString(),
      description: tx.description || 'Manual Transfer',
      type: tx.type || 'TRANSFER',
      status: tx.status || 'COMPLETED',
    };

    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadDemoCase = useCallback((caseId: string) => {
    const found = sampleCases.find((c) => c.id === caseId);
    if (found) {
      setTransactions([...found.transactions]);
      setActiveDemoCaseId(caseId);
    }
  }, []);

  const resetToDefault = useCallback(() => {
    setTransactions([...sampleCases[4].transactions]);
    setActiveDemoCaseId('case-complex-network');
  }, []);

  const clearAllTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  const allNodeIds = useMemo(() => {
    return graph.getNodeIds();
  }, [graph]);

  return {
    graph,
    transactions,
    stats,
    activeDemoCaseId,
    allNodeIds,
    addTransaction,
    deleteTransaction,
    loadDemoCase,
    resetToDefault,
    clearAllTransactions,
  };
}
