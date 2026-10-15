import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Graph } from '../dataStructures/Graph';
import { convertGraphToFlowElements } from '../services/graphBuilder';
import { AccountNode } from './graph/AccountNode';
import { TransactionEdge } from './graph/TransactionEdge';
import { GraphControls } from './GraphControls';

interface GraphVisualizerProps {
  graph: Graph;
  highlightedNodes?: string[];
  highlightedEdges?: string[];
  currentNode?: string;
  cycleEdgeIds?: string[];
  onSelectNode?: (nodeId: string) => void;
  onSelectEdge?: (edgeId: string) => void;
  onResetHighlights?: () => void;
  filterCyclesOnly?: boolean;
  onToggleFilterCycles?: () => void;
}

const nodeTypes = {
  accountNode: AccountNode,
};

const edgeTypes = {
  transactionEdge: TransactionEdge,
};

const GraphCanvas: React.FC<GraphVisualizerProps> = ({
  graph,
  highlightedNodes = [],
  highlightedEdges = [],
  currentNode,
  cycleEdgeIds = [],
  onSelectNode,
  onSelectEdge,
  onResetHighlights,
  filterCyclesOnly = false,
  onToggleFilterCycles,
}) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Convert graph to React Flow elements
  const { flowNodes, flowEdges } = useMemo(() => {
    const { flowNodes, flowEdges } = convertGraphToFlowElements(
      graph,
      highlightedNodes,
      highlightedEdges,
      cycleEdgeIds
    );

    // Decorate current node being processed
    const updatedNodes = flowNodes.map((n) => {
      const isCur = n.id === currentNode;
      return {
        ...n,
        data: {
          ...n.data,
          isCurrent: isCur,
        },
      };
    });

    let edges = flowEdges.map((e) => ({
      ...e,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: cycleEdgeIds.includes(e.id) ? '#dc2626' : highlightedEdges.includes(e.id) ? '#2563eb' : '#64748b',
        width: 14,
        height: 14,
      },
    }));

    if (filterCyclesOnly) {
      edges = edges.filter((e) => cycleEdgeIds.includes(e.id));
      const activeNodeIds = new Set(edges.flatMap((e) => [e.source, e.target]));
      const filteredNodes = updatedNodes.filter((n) => activeNodeIds.has(n.id));
      return { flowNodes: filteredNodes, flowEdges: edges };
    }

    return { flowNodes: updatedNodes, flowEdges: edges };
  }, [graph, highlightedNodes, highlightedEdges, currentNode, cycleEdgeIds, filterCyclesOnly]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onSelectNode) {
        onSelectNode(node.id);
      }
    },
    [onSelectNode]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (onSelectEdge) {
        onSelectEdge(edge.id);
      }
    },
    [onSelectEdge]
  );

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm select-none">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
        <div className="pointer-events-auto max-w-fit">
          <GraphControls
            onZoomIn={() => zoomIn({ duration: 300 })}
            onZoomOut={() => zoomOut({ duration: 300 })}
            onFitView={() => fitView({ padding: 0.2, duration: 400 })}
            onResetLayout={() => fitView({ padding: 0.1, duration: 400 })}
            onResetHighlights={onResetHighlights}
            filterCyclesOnly={filterCyclesOnly}
            onToggleFilterCycles={onToggleFilterCycles}
            cycleCount={cycleEdgeIds.length}
          />
        </div>
      </div>

      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        fitView
        minZoom={0.2}
        maxZoom={2.5}
        defaultEdgeOptions={{ animated: false }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="#cbd5e1"
        />
        <Controls
          showInteractive={false}
          className="!bg-white !border-slate-800 !text-slate-600 !fill-slate-600"
        />
      </ReactFlow>
    </div>
  );
};

export const GraphVisualizer: React.FC<GraphVisualizerProps> = (props) => {
  return (
    <ReactFlowProvider>
      <GraphCanvas {...props} />
    </ReactFlowProvider>
  );
};
