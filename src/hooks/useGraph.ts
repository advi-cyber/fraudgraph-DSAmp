import { useState, useCallback } from 'react';
import { Transaction } from '../types/transaction';
import { ApplicationSnapshot } from '../types/dataset';
import { createApplicationSnapshot } from '../services/dataPipeline';
import { sampleCases } from '../data/sampleCases';

export function useGraph(initialTransactions?: Transaction[]) {
  // Initialize with the standard complex network (case 5) or custom transactions
  const [snapshot, setSnapshot] = useState<ApplicationSnapshot>(() => {
    if (initialTransactions && initialTransactions.length > 0) {
      return createApplicationSnapshot('case-custom-csv', initialTransactions);
    }
    return createApplicationSnapshot('case-complex-network');
  });

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

    setSnapshot((prev) => {
      const updatedTxs = [newTx, ...prev.transactions];
      return createApplicationSnapshot('case-custom-csv', updatedTxs);
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setSnapshot((prev) => {
      const updatedTxs = prev.transactions.filter((t) => t.id !== id);
      return createApplicationSnapshot('case-custom-csv', updatedTxs);
    });
  }, []);

  const loadDemoCase = useCallback((caseId: string) => {
    try {
      const nextSnapshot = createApplicationSnapshot(caseId);
      setSnapshot(nextSnapshot);
    } catch (err) {
      console.error(`Failed to load dataset ${caseId}:`, err);
    }
  }, []);

  const resetToDefault = useCallback(() => {
    setSnapshot(createApplicationSnapshot('case-complex-network'));
  }, []);

  const clearAllTransactions = useCallback(() => {
    setSnapshot(createApplicationSnapshot('case-custom-csv', []));
  }, []);

  const importTransactions = useCallback((newTxs: Transaction[]) => {
    setSnapshot(createApplicationSnapshot('case-custom-csv', newTxs));
  }, []);

  return {
    snapshot,
    graph: snapshot.graph,
    transactions: snapshot.transactions,
    stats: snapshot.stats,
    activeDemoCaseId: snapshot.datasetId,
    datasetName: snapshot.datasetName,
    allNodeIds: snapshot.allNodeIds,
    validation: snapshot.validation,
    layout: snapshot.layout,
    addTransaction,
    deleteTransaction,
    loadDemoCase,
    resetToDefault,
    clearAllTransactions,
    importTransactions,
  };
}

