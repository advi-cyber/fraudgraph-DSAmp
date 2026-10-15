import React, { useState } from 'react';
import { Graph } from '../dataStructures/Graph';
import { Transaction } from '../types/transaction';
import { GraphStats } from '../types/graph';
import { DashboardStats } from '../components/DashboardStats';
import { GraphVisualizer } from '../components/GraphVisualizer';
import { AlgorithmControls } from '../components/AlgorithmControls';
import { AlgorithmConsole } from '../components/AlgorithmConsole';
import { AccountDetailPanel } from '../components/AccountDetailPanel';
import { TransactionTable } from '../components/TransactionTable';
import { CycleCard } from '../components/CycleCard';
import { PathAnalysisCard } from '../components/PathAnalysisCard';
import { useAlgorithmAnimation } from '../hooks/useAlgorithmAnimation';
import { runBFS, runBFSShortestPath } from '../algorithms/bfs';
import { runDFS } from '../algorithms/dfs';
import { detectDirectedCycles } from '../algorithms/cycleDetection';
import { runDijkstra } from '../algorithms/dijkstra';
import { runTarjanSCC } from '../algorithms/stronglyConnectedComponents';
import { AlgorithmType, DetectedCycle, DijkstraResult, BFSShortestPathResult } from '../types/algorithm';
import { PageTab } from '../components/Sidebar';
import { Terminal, ReceiptText, ShieldAlert } from 'lucide-react';

interface DashboardProps {
  graph: Graph;
  transactions: Transaction[];
  stats: GraphStats;
  allNodeIds: string[];
  onNavigateTab: (tab: PageTab) => void;
  onSelectAccountForInvestigation: (accountId: string) => void;
  onDeleteTransaction?: (id: string) => void;
  onOpenAddModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  graph,
  transactions,
  stats,
  allNodeIds,
  onNavigateTab,
  onSelectAccountForInvestigation,
  onDeleteTransaction,
  onOpenAddModal,
}) => {
  const [activeAlgorithm, setActiveAlgorithm] = useState<AlgorithmType | null>(null);
  const [dijkstraResult, setDijkstraResult] = useState<DijkstraResult | null>(null);
  const [bfsPathResult, setBfsPathResult] = useState<BFSShortestPathResult | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<DetectedCycle | null>(null);
  const [filterCyclesOnly, setFilterCyclesOnly] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(allNodeIds[0] || null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [bottomWorkspaceTab, setBottomWorkspaceTab] = useState<'CONSOLE' | 'LEDGER'>('CONSOLE');

  // Animation Hook
  const animation = useAlgorithmAnimation();

  // Run BFS
  const handleRunBFS = (startNode: string) => {
    setActiveAlgorithm('BFS');
    setSelectedCycle(null);
    setDijkstraResult(null);
    setBfsPathResult(null);
    setSelectedEdgeId(null);
    setBottomWorkspaceTab('CONSOLE');
    const result = runBFS(graph, startNode);
    animation.loadSteps(result.steps);
  };

  // Run DFS
  const handleRunDFS = (startNode: string) => {
    setActiveAlgorithm('DFS');
    setSelectedCycle(null);
    setDijkstraResult(null);
    setBfsPathResult(null);
    setSelectedEdgeId(null);
    setBottomWorkspaceTab('CONSOLE');
    const result = runDFS(graph, startNode);
    animation.loadSteps(result.steps);
  };

  // Run Cycle Detection
  const handleRunCycles = () => {
    setActiveAlgorithm('CYCLE_DETECTION');
    setDijkstraResult(null);
    setBfsPathResult(null);
    setSelectedEdgeId(null);
    setBottomWorkspaceTab('CONSOLE');
    const result = detectDirectedCycles(graph);
    animation.loadSteps(result.steps);
    if (result.cycles.length > 0) {
      setSelectedCycle(result.cycles[0]);
    }
  };

  // Run Dijkstra Weighted Shortest Path
  const handleRunDijkstra = (source: string, target: string) => {
    setActiveAlgorithm('DIJKSTRA');
    setSelectedCycle(null);
    setBfsPathResult(null);
    setSelectedEdgeId(null);
    setBottomWorkspaceTab('CONSOLE');
    const result = runDijkstra(graph, source, target);
    setDijkstraResult(result);
    animation.loadSteps(result.steps);
  };

  // Run Unweighted Minimum-Hop BFS Shortest Path
  const handleRunBFSShortestPath = (source: string, target: string) => {
    setActiveAlgorithm('BFS');
    setSelectedCycle(null);
    setDijkstraResult(null);
    setSelectedEdgeId(null);
    setBottomWorkspaceTab('CONSOLE');
    const result = runBFSShortestPath(graph, source, target);
    setBfsPathResult(result);
    animation.loadSteps(result.steps);
  };

  // Run SCC
  const handleRunSCC = () => {
    setActiveAlgorithm('SCC');
    setSelectedCycle(null);
    setDijkstraResult(null);
    setBfsPathResult(null);
    setSelectedEdgeId(null);
    setBottomWorkspaceTab('CONSOLE');
    const result = runTarjanSCC(graph);
    animation.loadSteps(result.steps);
  };

  // Node selection on canvas: inspect account details on dashboard
  const handleSelectNode = (accountId: string) => {
    setSelectedAccountId(accountId);
    setSelectedEdgeId(null);
  };

  // Edge selection on canvas: inspect transaction details
  const handleSelectEdge = (edgeId: string) => {
    setSelectedEdgeId(edgeId);
  };

  // Full investigation navigation
  const handleNavigateToFullAudit = (accountId: string) => {
    onSelectAccountForInvestigation(accountId);
    onNavigateTab('investigation');
  };

  // Reset highlights without altering underlying data
  const handleResetHighlights = () => {
    animation.reset();
    setSelectedCycle(null);
    setDijkstraResult(null);
    setBfsPathResult(null);
    setSelectedEdgeId(null);
    setActiveAlgorithm(null);
  };

  // Highlight state derived from animation or findings
  const highlightedNodes = animation.currentStep
    ? animation.currentStep.highlightedNodes
    : selectedCycle
    ? selectedCycle.nodes
    : bfsPathResult
    ? bfsPathResult.shortestPath
    : dijkstraResult?.shortestPath || [];

  const highlightedEdges = animation.currentStep
    ? animation.currentStep.highlightedEdges
    : selectedCycle
    ? selectedCycle.edgeIds
    : bfsPathResult
    ? bfsPathResult.edgeIds
    : dijkstraResult?.edgeIds || (selectedEdgeId ? [selectedEdgeId] : []);

  // Known cycle edges for persistent visual distinction
  const cycleEdges = detectDirectedCycles(graph).cycles.flatMap((c) => c.edgeIds);

  return (
    <div className="space-y-5 select-none font-sans">
      {/* Top Level Metric Cards */}
      <DashboardStats stats={stats} onNavigateTab={onNavigateTab} />

      {/* Main Workspace Grid: Network Graph (Left 8 Cols) + Investigation & Controls (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Transaction Canvas + Bottom Work Tab (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Transaction Network Graph */}
          <div className="h-[540px] w-full">
            <GraphVisualizer
              graph={graph}
              highlightedNodes={highlightedNodes}
              highlightedEdges={highlightedEdges}
              currentNode={animation.currentStep?.currentNode}
              cycleEdgeIds={cycleEdges}
              onSelectNode={handleSelectNode}
              onSelectEdge={handleSelectEdge}
              onResetHighlights={handleResetHighlights}
              filterCyclesOnly={filterCyclesOnly}
              onToggleFilterCycles={() => setFilterCyclesOnly(!filterCyclesOnly)}
            />
          </div>

          {/* Bottom Dual Tab: Algorithm Console vs Filtered Transaction Ledger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <button
                  onClick={() => setBottomWorkspaceTab('CONSOLE')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    bottomWorkspaceTab === 'CONSOLE'
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Algorithm Execution Console ({animation.steps.length} Steps)</span>
                </button>

                <button
                  onClick={() => setBottomWorkspaceTab('LEDGER')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    bottomWorkspaceTab === 'LEDGER'
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ReceiptText className="w-3.5 h-3.5" />
                  <span>Transaction Ledger & Filtering ({transactions.length} Records)</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-slate-500">
                DSA Graph Dynamic Synchronization Active
              </span>
            </div>

            {bottomWorkspaceTab === 'CONSOLE' ? (
              <AlgorithmConsole
                steps={animation.steps}
                currentStepIndex={animation.currentStepIndex}
                currentStep={animation.currentStep}
                isPlaying={animation.isPlaying}
                playbackSpeed={animation.playbackSpeed}
                onPlay={animation.play}
                onPause={animation.pause}
                onNext={animation.next}
                onPrev={animation.prev}
                onReset={animation.reset}
                onJumpToStep={animation.jumpToStep}
                onSpeedChange={animation.setPlaybackSpeed}
              />
            ) : (
              <TransactionTable
                transactions={transactions}
                onDeleteTransaction={onDeleteTransaction}
                onOpenAddModal={onOpenAddModal}
                cycleEdgeIds={cycleEdges}
                onSelectAccount={handleSelectNode}
              />
            )}
          </div>
        </div>

        {/* Right Column: Account Evidence Panel, Algorithm Lab Controls & Findings (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Account & Edge Investigation Panel */}
          <AccountDetailPanel
            graph={graph}
            selectedAccountId={selectedAccountId}
            selectedEdgeId={selectedEdgeId}
            onSelectAccount={handleSelectNode}
            onNavigateToFullInvestigation={handleNavigateToFullAudit}
          />

          {/* DSA Algorithm Laboratory Controls */}
          <AlgorithmControls
            allNodeIds={allNodeIds}
            onRunBFS={handleRunBFS}
            onRunDFS={handleRunDFS}
            onRunCycles={handleRunCycles}
            onRunDijkstra={handleRunDijkstra}
            onRunBFSShortestPath={handleRunBFSShortestPath}
            onRunSCC={handleRunSCC}
            onAnalyzeAccount={handleNavigateToFullAudit}
            onResetHighlights={handleResetHighlights}
            activeAlgorithm={activeAlgorithm}
          />

          {/* Cycle Anomaly Detail Card if active */}
          {selectedCycle && (
            <CycleCard
              cycle={selectedCycle}
              isSelected={true}
              onHighlightCycle={(c) => setSelectedCycle(c)}
            />
          )}

          {/* Shortest Path Result Card (Dijkstra or BFS) if active */}
          {(dijkstraResult || bfsPathResult) && (
            <PathAnalysisCard
              dijkstraResult={dijkstraResult}
              bfsPathResult={bfsPathResult}
            />
          )}
        </div>
      </div>
    </div>
  );
};
