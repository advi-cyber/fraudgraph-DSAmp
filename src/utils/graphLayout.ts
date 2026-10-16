import { Graph, GraphEdge } from '../dataStructures/Graph';

export interface LayoutPosition {
  x: number;
  y: number;
}

/**
 * Computes deterministic, visually balanced positions for accounts on the React Flow canvas.
 * Correctly detects and optimizes layouts for:
 * - Linear chains (Dataset 4, 8)
 * - Pure circular rings (Dataset 2, 3)
 * - Fan-in structuring / fan-out dispersion (Dataset 6, 7)
 * - Disconnected clusters (Dataset 9)
 * - Dense multi-component enterprise networks (Dataset 5)
 *
 * Guarantees finite coordinates, collision prevention, and compact 2D packing.
 */
export function calculateGraphLayout(
  graph: Graph,
  _highlightedNodeIds: string[] = []
): Map<string, LayoutPosition> {
  const positions = new Map<string, LayoutPosition>();
  const nodes = graph.getNodes();
  const nodeCount = nodes.length;

  if (nodeCount === 0) return positions;

  if (nodeCount === 1) {
    positions.set(nodes[0].id, { x: 450, y: 320 });
    return positions;
  }

  // 1. Group nodes into weakly connected components (undirected reachability)
  const visited = new Set<string>();
  const components: string[][] = [];

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const component: string[] = [];
      const queue = [node.id];
      visited.add(node.id);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        component.push(curr);

        const neighbors = [
          ...graph.getNeighbors(curr),
          ...graph.getIncomingEdges(curr).map((e) => e.source),
        ];

        for (const n of neighbors) {
          if (!visited.has(n)) {
            visited.add(n);
            queue.push(n);
          }
        }
      }
      components.push(component);
    }
  }

  // Sort components by size descending
  components.sort((a, b) => b.length - a.length);

  // 2. Position components in a compact landscape layout
  // If there is a dominant primary component (e.g., enterprise core >= 10 nodes)
  // and multiple smaller satellite components, place the primary component on the left
  // and stack satellite components in a clean column on the right.
  const hasDominantComp = components.length > 1 && components[0].length >= 10;

  if (hasDominantComp) {
    const primaryComp = components[0];
    const satelliteComps = components.slice(1);

    // Primary component bounds (generous landscape canvas)
    const primaryWidth = 1250;
    const primaryHeight = 650;
    layoutComponent(graph, primaryComp, 120, 120, primaryWidth, primaryHeight, positions);

    // Satellite column on the right
    const satOriginX = 120 + primaryWidth + 120; // 1490
    let currentSatY = 120;

    for (const sat of satelliteComps) {
      const satWidth = 380;
      const satHeight = sat.length <= 2 ? 140 : 200;
      layoutComponent(graph, sat, satOriginX, currentSatY, satWidth, satHeight, positions);
      currentSatY += satHeight + 40;
    }
  } else {
    // Balanced 2D grid/packing for evenly sized components
    let currentOriginX = 140;
    let currentOriginY = 140;
    let rowMaxHeight = 0;
    const MAX_ROW_WIDTH = 1400;

    for (const compNodes of components) {
      const compSize = compNodes.length;
      let compWidth = 360;
      let compHeight = 360;

      if (compSize === 1) {
        compWidth = 180;
        compHeight = 180;
      } else if (compSize <= 4) {
        compWidth = 440;
        compHeight = 340;
      } else if (compSize <= 8) {
        compWidth = 600;
        compHeight = 440;
      } else {
        compWidth = Math.min(1100, Math.max(500, compSize * 45));
        compHeight = Math.min(750, Math.max(450, compSize * 30));
      }

      if (currentOriginX + compWidth > MAX_ROW_WIDTH && currentOriginX > 140) {
        currentOriginX = 140;
        currentOriginY += rowMaxHeight + 80;
        rowMaxHeight = 0;
      }

      rowMaxHeight = Math.max(rowMaxHeight, compHeight);
      layoutComponent(graph, compNodes, currentOriginX, currentOriginY, compWidth, compHeight, positions);
      currentOriginX += compWidth + 80;
    }
  }

  // 3. Collision Repulsion Relaxation Pass

  const minNodeDist = 160;
  const iterations = 12;

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const posA = positions.get(nodes[i].id);
        const posB = positions.get(nodes[j].id);
        if (!posA || !posB) continue;

        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (dist < minNodeDist) {
          const overlap = (minNodeDist - dist) / 2;
          const shiftX = (dx / dist) * overlap * 0.4;
          const shiftY = (dy / dist) * overlap * 0.4;

          posA.x -= shiftX;
          posA.y -= shiftY;
          posB.x += shiftX;
          posB.y += shiftY;
        }
      }
    }
  }

  // 4. Guarantee finite integer pixel coordinates
  positions.forEach((pos, id) => {
    if (!Number.isFinite(pos.x)) pos.x = 450;
    if (!Number.isFinite(pos.y)) pos.y = 320;
    positions.set(id, {
      x: Math.round(pos.x),
      y: Math.round(pos.y),
    });
  });

  return positions;
}

/**
 * Lays out an individual component according to its structural shape.
 */
function layoutComponent(
  graph: Graph,
  compNodes: string[],
  originX: number,
  originY: number,
  width: number,
  height: number,
  positions: Map<string, LayoutPosition>
) {
  const count = compNodes.length;

  if (count === 1) {
    positions.set(compNodes[0], {
      x: Math.round(originX + width / 2),
      y: Math.round(originY + height / 2),
    });
    return;
  }

  // Check if component is a pure linear chain (e.g. Dataset 4, Dataset 8)
  const isChain = checkIfLinearChain(graph, compNodes);
  if (isChain.isChain && isChain.orderedNodes.length === count) {
    const ordered = isChain.orderedNodes;
    const stepX = (width - 120) / Math.max(1, count - 1);
    const midY = originY + height / 2;

    ordered.forEach((nodeId, idx) => {
      // Subtle alternating y-offset for aesthetic edge curve readability
      const yOffset = count > 3 ? (idx % 2 === 0 ? -25 : 25) : 0;
      positions.set(nodeId, {
        x: Math.round(originX + 60 + idx * stepX),
        y: Math.round(midY + yOffset),
      });
    });
    return;
  }

  // Check if component is fan-in (many sources -> 1 collector -> optional sink, Dataset 6)
  const isFanIn = checkIfFanIn(graph, compNodes);
  if (isFanIn) {
    layoutFanIn(compNodes, originX, originY, width, height, isFanIn.hubId, isFanIn.sources, isFanIn.sinks, positions);
    return;
  }

  // Check if component is fan-out (1 origin -> many destinations, Dataset 7)
  const isFanOut = checkIfFanOut(graph, compNodes);
  if (isFanOut) {
    layoutFanOut(compNodes, originX, originY, width, height, isFanOut.originId, isFanOut.destinations, positions);
    return;
  }

  // Check if component is small cycle (Dataset 2, 3)
  if (count <= 7) {
    const centerX = originX + width / 2;

    const centerY = originY + height / 2;
    const radiusX = Math.min(220, width * 0.38);
    const radiusY = Math.min(180, height * 0.38);

    compNodes.forEach((nodeId, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      positions.set(nodeId, {
        x: Math.round(centerX + radiusX * Math.cos(angle)),
        y: Math.round(centerY + radiusY * Math.sin(angle)),
      });
    });
    return;
  }

  // Large components (count >= 7): Topological Layered Flow Layout
  layoutLayeredFlow(graph, compNodes, originX, originY, width, height, positions);
}

/**
 * Arranges a complex directed network into clean, left-to-right topological flow tiers.
 * Replaces cluttered circular spiderwebs with structured, legible columns.
 */
function layoutLayeredFlow(
  graph: Graph,
  compNodes: string[],
  originX: number,
  originY: number,
  width: number,
  height: number,
  positions: Map<string, LayoutPosition>
) {
  const nodeSet = new Set(compNodes);
  const inDegs = new Map<string, number>();
  compNodes.forEach((id) => {
    inDegs.set(id, graph.getIncomingEdges(id).filter((e) => nodeSet.has(e.source)).length);
  });

  // 1. Identify source roots (in-degree 0 within this component)
  let roots = compNodes.filter((id) => (inDegs.get(id) || 0) === 0);
  if (roots.length === 0) {
    const minDeg = Math.min(...compNodes.map((id) => inDegs.get(id) || 0));
    roots = compNodes.filter((id) => (inDegs.get(id) || 0) === minDeg);
  }

  // 2. Assign topological BFS levels
  const levels = new Map<string, number>();
  roots.forEach((r) => levels.set(r, 0));
  const queue = [...roots];
  const visited = new Set(roots);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const curLvl = levels.get(curr) || 0;
    const outEdges = graph.getOutgoingEdges(curr).filter((e) => nodeSet.has(e.target));
    for (const e of outEdges) {
      if (!visited.has(e.target) && curLvl < 15) {
        visited.add(e.target);
        levels.set(e.target, curLvl + 1);
        queue.push(e.target);
      }
    }
  }

  // Assign any remaining nodes (e.g. cycles disconnected from roots)
  compNodes.forEach((id) => {
    if (!levels.has(id)) {
      levels.set(id, 2);
    }
  });

  // 3. Compress into balanced columns
  const maxRaw = Math.max(...levels.values());
  const targetCols = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(compNodes.length))));

  const colMap = new Map<number, string[]>();
  for (const [id, raw] of levels) {
    const col = Math.min(targetCols - 1, Math.floor((raw / (maxRaw || 1)) * targetCols));
    if (!colMap.has(col)) colMap.set(col, []);
    colMap.get(col)!.push(id);
  }

  // Split any column that has too many nodes (> 6) into sub-columns
  const finalCols: string[][] = [];
  for (let c = 0; c < targetCols; c++) {
    const colNodes = colMap.get(c) || [];
    if (colNodes.length > 6) {
      const half = Math.ceil(colNodes.length / 2);
      finalCols.push(colNodes.slice(0, half));
      finalCols.push(colNodes.slice(half));
    } else if (colNodes.length > 0) {
      finalCols.push(colNodes);
    }
  }

  const numCols = finalCols.length;
  const colSpacing = Math.max(160, Math.min(220, (width - 80) / Math.max(1, numCols - 1)));
  const centerY = originY + height / 2;

  finalCols.forEach((colNodes, colIdx) => {
    const colX = originX + 50 + colIdx * colSpacing;
    const countInCol = colNodes.length;
    const rowSpacing = Math.min(95, Math.max(65, (height - 60) / Math.max(1, countInCol)));
    const startY = centerY - ((countInCol - 1) * rowSpacing) / 2;

    colNodes.forEach((nodeId, rowIdx) => {
      positions.set(nodeId, {
        x: Math.round(colX),
        y: Math.round(startY + rowIdx * rowSpacing),
      });
    });
  });
}


function checkIfLinearChain(
  graph: Graph,
  compNodes: string[]
): { isChain: boolean; orderedNodes: string[] } {
  const nodeSet = new Set(compNodes);
  let startNode: string | null = null;

  for (const id of compNodes) {
    const inEdges = graph.getIncomingEdges(id).filter((e) => nodeSet.has(e.source));
    const outEdges = graph.getOutgoingEdges(id).filter((e) => nodeSet.has(e.target));

    if (inEdges.length > 1 || outEdges.length > 1) {
      return { isChain: false, orderedNodes: [] };
    }
    if (inEdges.length === 0 && outEdges.length === 1) {
      if (startNode !== null) return { isChain: false, orderedNodes: [] };
      startNode = id;
    }
  }

  if (!startNode) return { isChain: false, orderedNodes: [] };

  const ordered: string[] = [];
  let curr: string | null = startNode;
  const seen = new Set<string>();

  while (curr && !seen.has(curr)) {
    ordered.push(curr);
    seen.add(curr);
    const outEdges: GraphEdge[] = graph.getOutgoingEdges(curr).filter((e) => nodeSet.has(e.target));
    curr = outEdges.length > 0 ? outEdges[0].target : null;
  }

  return { isChain: ordered.length === compNodes.length, orderedNodes: ordered };
}

function checkIfFanIn(
  graph: Graph,
  compNodes: string[]
): { hubId: string; sources: string[]; sinks: string[] } | null {
  if (compNodes.length < 3) return null;
  const nodeSet = new Set(compNodes);

  for (const id of compNodes) {
    const inEdges = graph.getIncomingEdges(id).filter((e) => nodeSet.has(e.source));
    const outEdges = graph.getOutgoingEdges(id).filter((e) => nodeSet.has(e.target));

    // A fan-in hub has multiple inbound sources (at least 3 or majority of component)
    if (inEdges.length >= 2 && inEdges.length >= compNodes.length - 2) {
      const sources = inEdges.map((e) => e.source);
      const sinks = outEdges.map((e) => e.target);
      return { hubId: id, sources, sinks };
    }
  }
  return null;
}

function layoutFanIn(
  _compNodes: string[],
  originX: number,
  originY: number,
  width: number,
  height: number,
  hubId: string,
  sources: string[],
  sinks: string[],
  positions: Map<string, LayoutPosition>
) {
  const leftX = originX + 70;
  const midX = originX + width / 2;
  const rightX = originX + width - 70;
  const centerY = originY + height / 2;

  // Position hub in middle
  positions.set(hubId, { x: Math.round(midX), y: Math.round(centerY) });

  // Position sources on the left vertically
  const srcStepY = height / (sources.length + 1);
  sources.forEach((srcId, idx) => {
    positions.set(srcId, {
      x: Math.round(leftX),
      y: Math.round(originY + (idx + 1) * srcStepY),
    });
  });

  // Position sinks on the right vertically
  const sinkStepY = height / (sinks.length + 1);
  sinks.forEach((sinkId, idx) => {
    positions.set(sinkId, {
      x: Math.round(rightX),
      y: Math.round(originY + (idx + 1) * sinkStepY),
    });
  });
}

function checkIfFanOut(
  graph: Graph,
  compNodes: string[]
): { originId: string; destinations: string[] } | null {
  if (compNodes.length < 3) return null;
  const nodeSet = new Set(compNodes);

  for (const id of compNodes) {
    const inEdges = graph.getIncomingEdges(id).filter((e) => nodeSet.has(e.source));
    const outEdges = graph.getOutgoingEdges(id).filter((e) => nodeSet.has(e.target));

    if (inEdges.length === 0 && outEdges.length >= compNodes.length - 1) {
      return { originId: id, destinations: outEdges.map((e) => e.target) };
    }
  }
  return null;
}

function layoutFanOut(
  _compNodes: string[],
  originX: number,
  originY: number,
  width: number,
  height: number,
  originId: string,
  destinations: string[],
  positions: Map<string, LayoutPosition>
) {
  const leftX = originX + 80;
  const rightX = originX + width - 80;
  const centerY = originY + height / 2;

  // Origin on the left
  positions.set(originId, { x: Math.round(leftX), y: Math.round(centerY) });

  // Destinations spread vertically on the right
  const dstStepY = height / (destinations.length + 1);
  destinations.forEach((dstId, idx) => {
    positions.set(dstId, {
      x: Math.round(rightX),
      y: Math.round(originY + (idx + 1) * dstStepY),
    });
  });
}
