import { useState, useMemo, useCallback } from 'react';
import { Graph } from '../dataStructures/Graph';
import { generateAccountInvestigationReport } from '../services/reportGenerator';
import { AccountInvestigationReport } from '../types/investigation';

export function useInvestigation(graph: Graph, initialAccountId?: string) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    initialAccountId || (graph.getNodeCount() > 0 ? graph.getNodeIds()[0] : '')
  );

  const report: AccountInvestigationReport | null = useMemo(() => {
    if (!selectedAccountId || !graph.hasNode(selectedAccountId)) {
      const nodes = graph.getNodeIds();
      if (nodes.length > 0) {
        return generateAccountInvestigationReport(graph, nodes[0]);
      }
      return null;
    }
    try {
      return generateAccountInvestigationReport(graph, selectedAccountId);
    } catch {
      return null;
    }
  }, [graph, selectedAccountId]);

  const selectAccount = useCallback((id: string) => {
    setSelectedAccountId(id);
  }, []);

  return {
    selectedAccountId,
    selectAccount,
    report,
  };
}
