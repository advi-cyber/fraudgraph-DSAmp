import React, { useState } from 'react';
import { Graph } from '../dataStructures/Graph';
import { Transaction } from '../types/transaction';
import { GraphStats } from '../types/graph';
import { DashboardStats } from '../components/DashboardStats';
import { GraphVisualizer } from '../components/GraphVisualizer';
import { AlgorithmControls } from '../components/AlgorithmControls';
import { AlgorithmConsole } from '../components/AlgorithmConsole';
import { CycleCard } from '../components/CycleCard';
import { PathAnalysisCard } from '../components/PathAnalysisCard';
import { useAlgorithmAnimation } from '../hooks/useAlgorithmAnimation';
import { runBFS } from '../algorithms/bfs';
import { runDFS } from '../algorithms/dfs';
import { detectDirectedCycles } from '../algorithms/cycleDetection';
import { runDijkstra } from '../algorithms/dijkstra';
import { runTarjanSCC } from '../algorithms/stronglyConnectedComponents';
import { AlgorithmType, DetectedCycle, DijkstraResult } from '../types/algorithm';
import { PageTab } from '../components/Sidebar';

interface DashboardProps {
  graph: Graph;
  transactions: Transaction[];
  stats: GraphStats;
  allNodeIds: string[];
  onNavigateTab: (tab: PageTab) => void;
  onSelectAccountForInvestigation: (accountId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  graph,
  stats,
  allNodeIds,
  onNavigateTab,
  onSelectAccountForInvestigation,
}) => {
  const [activeAlgorithm, setActiveAlgorithm] = useState<AlgorithmType | null>(null);
  const [dijkstraResult, setDijkstraResult] = useState<DijkstraResult | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<DetectedCycle | null>(null);
  const [filterCyclesOnly, setFilterCyclesOnly] = useState(false);

  // Manual Animation Hook
  const animation = useAlgorithmAnimation();

  // Run BFS
  const handleRunBFS = (startNode: string) => {
    setActiveAlgorithm('BFS');
    setSelectedCycle(null);
    setDijkstraResult(null);
    const result = runBFS(graph, startNode);
    animation.loadSteps(result.steps);
  };

  // Run DFS
  const handleRunDFS = (startNode: string) => {
    setActiveAlgorithm('DFS');
    setSelectedCycle(null);
    setDijkstraResult(null);
    const result = runDFS(graph, startNode);
    animation.loadSteps(result.steps);
  };

  // Run Cycle Detection
  const handleRunCycles = () => {
    setActiveAlgorithm('CYCLE_DETECTION');
    setDijkstraResult(null);
    const result = detectDirectedCycles(graph);
    animation.loadSteps(result.steps);
    if (result.cycles.length > 0) {
      setSelectedCycle(result.cycles[0]);
    }
  };

  // Run Dijkstra
  const handleRunDijkstra = (source: string, target: string) => {
    setActiveAlgorithm('DIJKSTRA');
    setSelectedCycle(null);
    const result = runDijkstra(graph, source, target);
    setDijkstraResult(result);
    animation.loadSteps(result.steps);
  };

  // Run SCC
  const handleRunSCC = () => {
    setActiveAlgorithm('SCC');
    setSelectedCycle(null);
    setDijkstraResult(null);
    const result = runTarjanSCC(graph);
    animation.loadSteps(result.steps);
  };

  // Quick Account Analysis -> Navigate to Investigation page
  const handleAnalyzeAccount = (accountId: string) => {
    onSelectAccountForInvestigation(accountId);
    onNavigateTab('investigation');
  };

  // Highlight state derived from active animation step
  const highlightedNodes = animation.currentStep
    ? animation.currentStep.highlightedNodes
    : selectedCycle
    ? selectedCycle.nodes
    : dijkstraResult?.shortestPath || [];

  const highlightedEdges = animation.currentStep
    ? animation.currentStep.highlightedEdges
    : selectedCycle
    ? selectedCycle.edgeIds
    : dijkstraResult?.edgeIds || [];

  // All known cycle edges for visual styling
  const cycleEdges = detectDirectedCycles(graph).cycles.flatMap((c) => c.edgeIds);

  return (
    <div className="space-y-5">
      {/* Top Level Metric Cards */}
      <DashboardStats stats={stats} onNavigateTab={onNavigateTab} />

      {/* Main Workspace Grid: Network Graph (Left) + Quick Analysis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Canvas (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="h-[540px] w-full">
            <GraphVisualizer
              graph={graph}
              highlightedNodes={highlightedNodes}
              highlightedEdges={highlightedEdges}
              currentNode={animation.currentStep?.currentNode}
              cycleEdgeIds={cycleEdges}
              onSelectNode={handleAnalyzeAccount}
              filterCyclesOnly={filterCyclesOnly}
              onToggleFilterCycles={() => setFilterCyclesOnly(!filterCyclesOnly)}
            />
          </div>

          {/* Real DSA Algorithm Execution Console */}
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
        </div>

        {/* Right: Quick Analysis Sidebar & Result Cards (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <AlgorithmControls
            allNodeIds={allNodeIds}
            onRunBFS={handleRunBFS}
            onRunDFS={handleRunDFS}
            onRunCycles={handleRunCycles}
            onRunDijkstra={handleRunDijkstra}
            onRunSCC={handleRunSCC}
            onAnalyzeAccount={handleAnalyzeAccount}
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

          {/* Dijkstra Result Card if active */}
          {dijkstraResult && <PathAnalysisCard result={dijkstraResult} />}
        </div>
      </div>
    </div>
  );
};
