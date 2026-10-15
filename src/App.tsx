import React, { useState } from 'react';
import { useGraph } from './hooks/useGraph';
import { Navbar } from './components/Navbar';
import { Sidebar, PageTab } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { NetworkAnalysis } from './pages/NetworkAnalysis';
import { FraudInvestigation } from './pages/FraudInvestigation';
import { AccountInvestigation } from './pages/AccountInvestigation';
import { TimelineAnalysis } from './pages/TimelineAnalysis';
import { Simulator } from './pages/Simulator';
import { AlgorithmComparison } from './pages/AlgorithmComparison';
import { Reports } from './pages/Reports';
import { TransactionForm } from './components/TransactionForm';
import { CSVUploadModal } from './components/CSVUploadModal';
import { detectDirectedCycles } from './algorithms/cycleDetection';

export function App() {
  const {
    graph,
    transactions,
    stats,
    activeDemoCaseId,
    allNodeIds,
    addTransaction,
    deleteTransaction,
    loadDemoCase,
    resetToDefault,
    importTransactions,
  } = useGraph();

  const [activeTab, setActiveTab] = useState<PageTab>('dashboard');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    allNodeIds[0] || 'CORP-CORP01'
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

  // Keep selected account valid
  React.useEffect(() => {
    if (allNodeIds.length > 0 && !allNodeIds.includes(selectedAccountId)) {
      setSelectedAccountId(allNodeIds[0]);
    }
  }, [allNodeIds, selectedAccountId]);

  const cycleResult = detectDirectedCycles(graph);
  const cycleEdges = cycleResult.cycles.flatMap((c) => c.edgeIds);

  const handleSelectAccountForInvestigation = (accountId: string) => {
    setSelectedAccountId(accountId);
    setActiveTab('investigation');
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar
        graph={graph}
        activeCaseId={activeDemoCaseId}
        onSelectCase={loadDemoCase}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenCSVModal={() => setIsCSVModalOpen(true)}
        onResetDefault={resetToDefault}
        nodeCount={stats.totalNodes}
        edgeCount={stats.totalEdges}
      />

      {/* Main Layout Area: Sidebar + Scrollable Viewport */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          detectedCyclesCount={stats.detectedCyclesCount}
          suspiciousRingsCount={stats.suspiciousRingsCount}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {activeTab === 'dashboard' && (
            <Dashboard
              graph={graph}
              transactions={transactions}
              stats={stats}
              allNodeIds={allNodeIds}
              onNavigateTab={setActiveTab}
              onSelectAccountForInvestigation={handleSelectAccountForInvestigation}
              onDeleteTransaction={deleteTransaction}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          )}

          {activeTab === 'transactions' && (
            <Transactions
              transactions={transactions}
              onAddTransaction={addTransaction}
              onDeleteTransaction={deleteTransaction}
              existingAccounts={allNodeIds}
              cycleEdgeIds={cycleEdges}
            />
          )}

          {activeTab === 'network' && (
            <NetworkAnalysis
              graph={graph}
              onInvestigateAccount={handleSelectAccountForInvestigation}
            />
          )}

          {activeTab === 'fraud-rings' && (
            <FraudInvestigation
              graph={graph}
              onInvestigateAccount={handleSelectAccountForInvestigation}
            />
          )}

          {activeTab === 'investigation' && (
            <AccountInvestigation
              graph={graph}
              allNodeIds={allNodeIds}
              selectedAccountId={selectedAccountId}
              onSelectAccount={setSelectedAccountId}
              onNavigateToReports={() => setActiveTab('reports')}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineAnalysis
              transactions={transactions}
              onInvestigateAccount={handleSelectAccountForInvestigation}
            />
          )}

          {activeTab === 'simulator' && (
            <Simulator
              graph={graph}
              allNodeIds={allNodeIds}
              onApplyTransaction={addTransaction}
            />
          )}

          {activeTab === 'comparison' && (
            <AlgorithmComparison
              graph={graph}
              allNodeIds={allNodeIds}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              graph={graph}
              allNodeIds={allNodeIds}
              initialAccountId={selectedAccountId}
            />
          )}
        </main>
      </div>

      {/* Global Transaction Insertion Modal */}
      <TransactionForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addTransaction}
        existingAccounts={allNodeIds}
      />

      {/* Custom CSV Upload Modal */}
      <CSVUploadModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        onImport={importTransactions}
      />
    </div>
  );
}

export default App;
