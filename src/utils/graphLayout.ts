import { Graph } from '../dataStructures/Graph';
import { NodeData } from '../types/graph';

export interface LayoutPosition {
  x: number;
  y: number;
}

/**
 * Computes deterministic, visually balanced positions for accounts on the React Flow canvas.
 * Clusters connected nodes and provides clear spacing for visual investigation.
 */
export function calculateGraphLayout(
  graph: Graph,
  highlightedNodeIds: string[] = []
): Map<string, LayoutPosition> {
  const positions = new Map<string, LayoutPosition>();
  const nodes = graph.getNodes();
  const nodeCount = nodes.length;

  if (nodeCount === 0) return positions;

  // Find components / rings or use an intelligent circular-hierarchical layout
  // 1. Calculate degrees for hub identification
  const degrees = nodes.map((node) => ({
    id: node.id,
    inDegree: graph.getInDegree(node.id),
    outDegree: graph.getOutDegree(node.id),
    totalDegree: graph.getInDegree(node.id) + graph.getOutDegree(node.id),
  }));

  // Sort by degree descending so major hubs are central
  degrees.sort((a, b) => b.totalDegree - a.totalDegree);

  // If small graph, distribute in an ellipse/circle
  if (nodeCount <= 8) {
    const radius = 240;
    const centerX = 400;
    const centerY = 300;
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
      positions.set(node.id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    });
    return positions;
  }

  // Multi-tier orbital layout for larger graphs
  // Tier 1: Hubs (top 3-5 nodes) in the inner ring
  const hubCount = Math.min(5, Math.ceil(nodeCount * 0.2));
  const innerRadius = 160;
  const outerRadius = 380;
  const centerX = 500;
  const centerY = 360;

  degrees.slice(0, hubCount).forEach((item, i) => {
    const angle = (2 * Math.PI * i) / hubCount;
    positions.set(item.id, {
      x: centerX + innerRadius * Math.cos(angle),
      y: centerY + innerRadius * Math.sin(angle),
    });
  });

  // Tier 2: Outer perimeter nodes
  const outerItems = degrees.slice(hubCount);
  const outerCount = outerItems.length;

  outerItems.forEach((item, i) => {
    const angle = (2 * Math.PI * i) / outerCount;
    // Add minor radial jitter based on node ID hash for organic look
    const jitter = ((item.id.charCodeAt(0) * 17) % 50) - 25;
    const r = outerRadius + jitter;
    positions.set(item.id, {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    });
  });

  return positions;
}
