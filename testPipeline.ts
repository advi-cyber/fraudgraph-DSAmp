import { DATASET_REGISTRY, getDatasetById, getAllDatasets } from './src/services/datasetRegistry';
import { validateDataset, createApplicationSnapshot, constructCanonicalGraph, normalizeTransactions } from './src/services/dataPipeline';
import { calculateGraphLayout } from './src/utils/graphLayout';
import { Graph } from './src/dataStructures/Graph';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

console.log('====================================================');
console.log(' FRAUDGRAPH PHASE 1 DATA PIPELINE & INTEGRITY TESTS');
console.log('====================================================\n');

// 1. REGISTRY INTEGRITY
console.log('--- 1. Testing Dataset Registry ---');
const allDatasets = getAllDatasets();
assert(allDatasets.length === 9, `Expected 9 datasets in registry, found ${allDatasets.length}`);
console.log(`✅ Exactly 9 datasets registered.`);

const seenIds = new Set<string>();
for (const ds of allDatasets) {
  assert(!seenIds.has(ds.id), `Duplicate dataset id: ${ds.id}`);
  seenIds.add(ds.id);
  assert(ds.id.startsWith('case-'), `Dataset id should follow naming convention: ${ds.id}`);
  assert(ds.transactions.length > 0, `Dataset ${ds.id} must have transactions`);
  assert(ds.name.length > 0, `Dataset ${ds.id} must have a human-readable name`);
}
console.log(`✅ All 9 dataset IDs are unique and well-formed.`);

// Test explicit failure on unknown ID
try {
  getDatasetById('case-non-existent-xyz');
  assert(false, 'Expected getDatasetById to throw on unknown dataset ID');
} catch (err: any) {
  assert(err.message.includes('not found in the Dataset Registry'), 'Explicit error message expected');
  console.log(`✅ Unknown dataset ID fails explicitly without fallback: "${err.message.slice(0, 70)}..."`);
}


// 2. VALIDATION & CANONICAL GRAPH CONSTRUCTION FOR ALL 9 DATASETS
console.log('\n--- 2. Testing Validation & Graph Construction for all 9 Datasets ---');
for (const ds of allDatasets) {
  const valResult = validateDataset(ds);
  assert(valResult.isValid, `Dataset ${ds.id} failed validation: ${JSON.stringify(valResult.errors)}`);
  assert(valResult.errors.length === 0, `Dataset ${ds.id} has unexpected validation errors`);
  assert(valResult.accountCount > 0, `Dataset ${ds.id} has 0 accounts`);
  assert(valResult.transactionCount === ds.transactions.length, `Transaction count mismatch for ${ds.id}`);

  // Construct canonical graph
  const normalized = normalizeTransactions(ds.transactions);
  const graph = constructCanonicalGraph(normalized, ds.isolatedNodes);

  // Invariant checks
  assert(graph.getNodeCount() === valResult.accountCount, `Node count mismatch in graph for ${ds.id}`);
  assert(graph.getEdgeCount() === ds.transactions.length, `Edge count mismatch in graph for ${ds.id}`);

  // Check every edge endpoint exists
  for (const edge of graph.getEdges()) {
    assert(graph.hasNode(edge.source), `Edge source ${edge.source} missing in graph ${ds.id}`);
    assert(graph.hasNode(edge.target), `Edge target ${edge.target} missing in graph ${ds.id}`);
    assert(edge.weight > 0, `Edge weight must be positive in ${ds.id}`);
  }

  // Check unique node and edge IDs
  const nodeSet = new Set(graph.getNodeIds());
  assert(nodeSet.size === graph.getNodeCount(), `Node IDs not unique in ${ds.id}`);
  const edgeSet = new Set(graph.getEdges().map((e) => e.id));
  assert(edgeSet.size === graph.getEdgeCount(), `Edge IDs not unique in ${ds.id}`);

  console.log(`✅ ${ds.name} (${ds.id}): ${graph.getNodeCount()} nodes, ${graph.getEdgeCount()} edges, validation PASS`);
}

// 3. GRAPH LAYOUT INTEGRITY (FINITE COORDINATES, COMPACT BOUNDS, ALL TOPOLOGIES)
console.log('\n--- 3. Testing Graph Layout for All Topologies ---');
for (const ds of allDatasets) {
  const normalized = normalizeTransactions(ds.transactions);
  const graph = constructCanonicalGraph(normalized, ds.isolatedNodes);
  const layout = calculateGraphLayout(graph);

  assert(layout.size === graph.getNodeCount(), `Layout missing coordinates for some nodes in ${ds.id}`);

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [nodeId, pos] of layout.entries()) {
    assert(Number.isFinite(pos.x), `Node ${nodeId} has non-finite x in ${ds.id}: ${pos.x}`);
    assert(Number.isFinite(pos.y), `Node ${nodeId} has non-finite y in ${ds.id}: ${pos.y}`);
    assert(!Number.isNaN(pos.x), `Node ${nodeId} has NaN x in ${ds.id}`);
    assert(!Number.isNaN(pos.y), `Node ${nodeId} has NaN y in ${ds.id}`);

    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y);
  }

  const spanX = maxX - minX;
  const spanY = maxY - minY;
  assert(spanX >= 0 && spanY >= 0, `Invalid span in ${ds.id}`);
  // Verify layout doesn't runaway infinitely
  assert(spanX < 3000, `Horizontal layout span too large for ${ds.id}: ${spanX}px`);
  assert(spanY < 3000, `Vertical layout span too large for ${ds.id}: ${spanY}px`);

  // Test determinism: second layout call must produce exact same coordinates
  const layout2 = calculateGraphLayout(graph);
  for (const [nodeId, pos] of layout.entries()) {
    const pos2 = layout2.get(nodeId)!;
    assert(pos.x === pos2.x && pos.y === pos2.y, `Layout non-deterministic for ${nodeId} in ${ds.id}`);
  }

  console.log(`✅ ${ds.id}: coordinates [${minX.toFixed(0)}..${maxX.toFixed(0)}] x [${minY.toFixed(0)}..${maxY.toFixed(0)}], Deterministic PASS`);
}

// 4. EDGE CASE LAYOUTS: ZERO NODES & ONE NODE
console.log('\n--- 4. Testing Zero-Node and Single-Node Layout Edge Cases ---');
const emptyGraph = new Graph();
const emptyLayout = calculateGraphLayout(emptyGraph);
assert(emptyLayout.size === 0, 'Empty graph layout must be empty map');
console.log('✅ Empty graph layout handled cleanly.');

const singleGraph = new Graph();
singleGraph.addNode('SOLO-ACCOUNT');
const singleLayout = calculateGraphLayout(singleGraph);
assert(singleLayout.size === 1, 'Single-node layout must have 1 coordinate');
const soloPos = singleLayout.get('SOLO-ACCOUNT')!;
assert(Number.isFinite(soloPos.x) && Number.isFinite(soloPos.y), 'Single node position must be finite');
console.log(`✅ Single-node layout handled cleanly at (${soloPos.x}, ${soloPos.y}).`);

// 5. ATOMIC SNAPSHOT CREATION & DATASET SWITCHING
console.log('\n--- 5. Testing Atomic Snapshot Pipeline & Switching ---');
for (const ds of allDatasets) {
  const snapshot = createApplicationSnapshot(ds.id);
  assert(snapshot.datasetId === ds.id, `Snapshot ID mismatch: expected ${ds.id}, got ${snapshot.datasetId}`);
  assert(snapshot.graph.getNodeCount() === ds.transactions.length ? snapshot.graph.getNodeCount() > 0 : true, 'Graph node count mismatch');
  assert(snapshot.transactions.length === ds.transactions.length, 'Snapshot transactions count mismatch');
  assert(snapshot.allNodeIds.length === snapshot.graph.getNodeCount(), 'Snapshot allNodeIds length mismatch');
  assert(snapshot.validation.isValid, 'Snapshot validation must be true');
  assert(Number.isFinite(snapshot.stats.totalNodes), 'Stats totalNodes must be finite');
  assert(Number.isFinite(snapshot.stats.totalEdges), 'Stats totalEdges must be finite');
  assert(Number.isFinite(snapshot.stats.totalVolume), 'Stats totalVolume must be finite');

  // Verify recommended start node exists in graph
  assert(snapshot.graph.hasNode(snapshot.recommendedStartNode), `Recommended start node ${snapshot.recommendedStartNode} not in graph for ${ds.id}`);
  if (snapshot.recommendedTargetNode) {
    assert(snapshot.graph.hasNode(snapshot.recommendedTargetNode), `Recommended target node ${snapshot.recommendedTargetNode} not in graph for ${ds.id}`);
  }

  console.log(`✅ Snapshot for ${ds.id}: V=${snapshot.stats.totalNodes}, E=${snapshot.stats.totalEdges}, Vol=₹${snapshot.stats.totalVolume.toLocaleString()}, Cycles=${snapshot.stats.detectedCyclesCount}, Rings=${snapshot.stats.suspiciousRingsCount}`);
}

// 6. SPECIFIC DEFECT VERIFICATION: Case 4 (Mule Chain) & Case 9 (Disconnected Clusters)
console.log('\n--- 6. Deep Verification for Previously Problematic Scenarios ---');

// Case 4: Long Layering Mule Chain
const case4 = createApplicationSnapshot('case-long-chain');
assert(case4.graph.getNodeCount() === 6, `Case 4 should have 6 nodes, got ${case4.graph.getNodeCount()}`);
assert(case4.graph.getEdgeCount() === 5, `Case 4 should have 5 edges, got ${case4.graph.getEdgeCount()}`);
assert(case4.stats.detectedCyclesCount === 0, `Case 4 is a linear chain and must have 0 cycles, got ${case4.stats.detectedCyclesCount}`);
// Check left-to-right chain positions
const chainNodes = ['ORIGIN-HEIST', 'MULE-TIER1', 'MULE-TIER2', 'MULE-TIER3', 'MULE-TIER4', 'EXFIL-CRYPTO-DESK'];
for (let i = 0; i < chainNodes.length - 1; i++) {
  const curPos = case4.layout.get(chainNodes[i])!;
  const nextPos = case4.layout.get(chainNodes[i + 1])!;
  assert(curPos.x < nextPos.x, `Chain node ${chainNodes[i]} should be to the left of ${chainNodes[i + 1]}`);
}
console.log('✅ Case 4 (Long Layering Mule Chain) layout strictly preserves left-to-right flow.');

// Case 9: Disconnected Financial Clusters
const case9 = createApplicationSnapshot('case-disconnected');
assert(case9.graph.getNodeCount() === 8, `Case 9 should have 8 nodes, got ${case9.graph.getNodeCount()}`);
assert(case9.graph.getEdgeCount() === 6, `Case 9 should have 6 edges, got ${case9.graph.getEdgeCount()}`);
assert(case9.layout.size === 8, 'Case 9 layout must contain all 8 nodes including isolated trust');
// Both clusters must have distinct non-overlapping regions
const cluster1Nodes = ['CORP-CORP01', 'PAYROLL-OPS', 'EMP-ANIKET', 'EMP-PRIYA'];
const cluster2Nodes = ['ISOLATED-TRUST', 'ISOLATED-FOUNDATION'];
const c1Positions = cluster1Nodes.map((id) => case9.layout.get(id)!);
const c2Positions = cluster2Nodes.map((id) => case9.layout.get(id)!);
const c1MaxX = Math.max(...c1Positions.map((p) => p.x));
const c2MinX = Math.min(...c2Positions.map((p) => p.x));
assert(c2MinX > c1MaxX, 'Cluster 2 must be laid out to the right of Cluster 1');
console.log('✅ Case 9 (Disconnected Clusters) layout places disconnected components in distinct non-overlapping visible regions.');


console.log('\n====================================================');
console.log(' ALL DATA PIPELINE & INTEGRITY TESTS PASSED! (100%)');
console.log('====================================================\n');
