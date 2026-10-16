import { GraphNode } from './GraphNode';
import { GraphEdge } from './GraphEdge';

export { GraphNode, GraphEdge };

/**
 * Manual implementation of a Directed Weighted Graph using an Adjacency List.
 * Provides complete support for bank transaction network analysis.
 * Space Complexity: O(V + E)
 */
export class Graph {
  private nodes: Map<string, GraphNode> = new Map();
  private adjacencyList: Map<string, GraphEdge[]> = new Map();
  private inAdjacencyList: Map<string, GraphEdge[]> = new Map();

  constructor() {}

  /**
   * Add a node to the graph if it doesn't already exist.
   * Time Complexity: O(1)
   */
  addNode(nodeOrId: GraphNode | string, metadata: Record<string, any> = {}): GraphNode {
    let node: GraphNode;
    if (typeof nodeOrId === 'string') {
      if (this.nodes.has(nodeOrId)) {
        const existing = this.nodes.get(nodeOrId)!;
        existing.metadata = { ...existing.metadata, ...metadata };
        return existing;
      }
      node = new GraphNode(nodeOrId, nodeOrId, metadata);
    } else {
      node = nodeOrId;
    }

    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, node);
      this.adjacencyList.set(node.id, []);
      this.inAdjacencyList.set(node.id, []);
    } else {
      const existing = this.nodes.get(node.id)!;
      existing.metadata = { ...existing.metadata, ...node.metadata };
    }

    return this.nodes.get(node.id)!;
  }

  /**
   * Remove a node and all incident edges.
   * Time Complexity: O(V + E)
   */
  removeNode(nodeId: string): boolean {
    if (!this.nodes.has(nodeId)) return false;

    // Remove outgoing edges from inAdjacencyList of other nodes
    const outgoing = this.adjacencyList.get(nodeId) || [];
    for (const edge of outgoing) {
      const targetInEdges = this.inAdjacencyList.get(edge.target);
      if (targetInEdges) {
        this.inAdjacencyList.set(
          edge.target,
          targetInEdges.filter((e) => e.id !== edge.id)
        );
      }
    }

    // Remove incoming edges from adjacencyList of source nodes
    const incoming = this.inAdjacencyList.get(nodeId) || [];
    for (const edge of incoming) {
      const sourceOutEdges = this.adjacencyList.get(edge.source);
      if (sourceOutEdges) {
        this.adjacencyList.set(
          edge.source,
          sourceOutEdges.filter((e) => e.id !== edge.id)
        );
      }
    }

    this.nodes.delete(nodeId);
    this.adjacencyList.delete(nodeId);
    this.inAdjacencyList.delete(nodeId);
    return true;
  }

  /**
   * Add a directed edge from source to target.
   * Automatically adds missing nodes.
   * Time Complexity: O(1)
   */
  addEdge(
    sourceOrEdge: string | GraphEdge | { source: string; target: string; weight: number; metadata?: Record<string, any>; id?: string },
    target?: string,
    weight?: number,
    metadata?: Record<string, any>,
    id?: string
  ): GraphEdge {
    let edge: GraphEdge;

    if (sourceOrEdge instanceof GraphEdge) {
      edge = sourceOrEdge;
    } else if (typeof sourceOrEdge === 'object' && 'source' in sourceOrEdge) {
      edge = new GraphEdge(
        sourceOrEdge.source,
        sourceOrEdge.target,
        sourceOrEdge.weight,
        sourceOrEdge.metadata || {},
        sourceOrEdge.id
      );
    } else {
      edge = new GraphEdge(
        sourceOrEdge as string,
        target!,
        weight ?? 1,
        metadata || {},
        id
      );
    }

    // Ensure nodes exist
    if (!this.nodes.has(edge.source)) {
      this.addNode(edge.source);
    }
    if (!this.nodes.has(edge.target)) {
      this.addNode(edge.target);
    }

    // Add to adjacency lists
    this.adjacencyList.get(edge.source)!.push(edge);
    this.inAdjacencyList.get(edge.target)!.push(edge);

    return edge;
  }

  /**
   * Remove an edge by ID.
   * Time Complexity: O(E_deg)
   */
  removeEdge(edgeId: string): boolean {
    let removed = false;

    for (const [source, edges] of this.adjacencyList.entries()) {
      const filtered = edges.filter((e) => {
        if (e.id === edgeId) {
          removed = true;
          // Also remove from inAdjacencyList
          const inList = this.inAdjacencyList.get(e.target);
          if (inList) {
            this.inAdjacencyList.set(
              e.target,
              inList.filter((ie) => ie.id !== edgeId)
            );
          }
          return false;
        }
        return true;
      });
      this.adjacencyList.set(source, filtered);
    }

    return removed;
  }

  hasNode(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }

  hasEdge(source: string, target: string): boolean {
    const edges = this.adjacencyList.get(source);
    if (!edges) return false;
    return edges.some((e) => e.target === target);
  }

  getNode(nodeId: string): GraphNode | undefined {
    return this.nodes.get(nodeId);
  }

  getNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  getNodeIds(): string[] {
    return Array.from(this.nodes.keys());
  }

  getEdges(): GraphEdge[] {
    const allEdges: GraphEdge[] = [];
    for (const edges of this.adjacencyList.values()) {
      allEdges.push(...edges);
    }
    return allEdges;
  }

  getEdge(edgeId: string): GraphEdge | undefined {
    for (const edges of this.adjacencyList.values()) {
      const match = edges.find((e) => e.id === edgeId);
      if (match) return match;
    }
    return undefined;
  }

  getOutgoingEdges(nodeId: string): GraphEdge[] {
    return this.adjacencyList.get(nodeId) || [];
  }

  getIncomingEdges(nodeId: string): GraphEdge[] {
    return this.inAdjacencyList.get(nodeId) || [];
  }

  getNeighbors(nodeId: string): string[] {
    const edges = this.adjacencyList.get(nodeId) || [];
    return edges.map((e) => e.target);
  }

  getInDegree(nodeId: string): number {
    return (this.inAdjacencyList.get(nodeId) || []).length;
  }

  getOutDegree(nodeId: string): number {
    return (this.adjacencyList.get(nodeId) || []).length;
  }

  getTotalInAmount(nodeId: string): number {
    const inEdges = this.inAdjacencyList.get(nodeId) || [];
    return inEdges.reduce((sum, e) => sum + e.weight, 0);
  }

  getTotalOutAmount(nodeId: string): number {
    const outEdges = this.adjacencyList.get(nodeId) || [];
    return outEdges.reduce((sum, e) => sum + e.weight, 0);
  }

  getNodeCount(): number {
    return this.nodes.size;
  }

  getEdgeCount(): number {
    let count = 0;
    for (const edges of this.adjacencyList.values()) {
      count += edges.length;
    }
    return count;
  }

  getTotalTransactionVolume(): number {
    let volume = 0;
    for (const edges of this.adjacencyList.values()) {
      for (const edge of edges) {
        volume += edge.weight;
      }
    }
    return volume;
  }

  getEdgeBetween(source: string, target: string): GraphEdge | undefined {
    const outEdges = this.adjacencyList.get(source) || [];
    return outEdges.find((e) => e.target === target);
  }

  /**
   * Deep clone the graph.
   */
  clone(): Graph {
    const newGraph = new Graph();
    for (const node of this.nodes.values()) {
      newGraph.addNode(node.clone());
    }
    for (const edge of this.getEdges()) {
      newGraph.addEdge(edge.clone());
    }
    return newGraph;
  }

  /**
   * Clear all nodes and edges.
   */
  clear(): void {
    this.nodes.clear();
    this.adjacencyList.clear();
    this.inAdjacencyList.clear();
  }
}
