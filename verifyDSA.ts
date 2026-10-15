import { Queue } from './src/dataStructures/Queue';
import { Stack } from './src/dataStructures/Stack';
import { PriorityQueue } from './src/dataStructures/PriorityQueue';
import { Graph } from './src/dataStructures/Graph';
import { runBFS, runBFSShortestPath } from './src/algorithms/bfs';
import { runDFS } from './src/algorithms/dfs';
import { detectDirectedCycles } from './src/algorithms/cycleDetection';
import { runDijkstra } from './src/algorithms/dijkstra';
import { runTarjanSCC } from './src/algorithms/stronglyConnectedComponents';
import { buildGraphFromTransactions } from './src/services/graphBuilder';
import { sampleCases } from './src/data/sampleCases';
import { calculateAccountRisk } from './src/services/riskAnalyzer';
import { analyzeFraudRings } from './src/services/fraudAnalyzer';
import { generateAccountInvestigationReport } from './src/services/reportGenerator';
import { parseTransactionCSV, generateSampleCSVTemplate } from './src/utils/csvParser';
import { RISK_CONFIG } from './src/config/riskRules';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('====================================================');
console.log('FRAUDGRAPH COMPREHENSIVE DSA VERIFICATION SUITE');
console.log('====================================================');

// 1. Test Queue
console.log('\n[1/9] Testing Manual Queue (FIFO)...');
const q = new Queue<string>();
assert(q.isEmpty(), 'Queue should initially be empty');
q.enqueue('A');
q.enqueue('B');
q.enqueue('C');
assert(q.size() === 3, 'Queue size should be 3');
assert(q.peek() === 'A', 'Queue peek should be A');
assert(q.dequeue() === 'A', 'First dequeue should be A');
assert(q.dequeue() === 'B', 'Second dequeue should be B');
assert(q.dequeue() === 'C', 'Third dequeue should be C');
assert(q.isEmpty(), 'Queue should now be empty');
console.log('✓ Queue passed all assertions.');

// 2. Test Stack
console.log('\n[2/9] Testing Manual Stack (LIFO)...');
const s = new Stack<string>();
assert(s.isEmpty(), 'Stack should initially be empty');
s.push('X');
s.push('Y');
assert(s.peek() === 'Y', 'Stack peek should be Y');
assert(s.pop() === 'Y', 'Stack pop should be Y');
assert(s.pop() === 'X', 'Stack pop should be X');
assert(s.isEmpty(), 'Stack should now be empty');
console.log('✓ Stack passed all assertions.');

// 3. Test PriorityQueue (Min-Heap)
console.log('\n[3/9] Testing Manual Min-Heap Priority Queue...');
const pq = new PriorityQueue<string>();
pq.insert('NodeA', 50);
pq.insert('NodeB', 10);
pq.insert('NodeC', 30);
assert(pq.peek()?.item === 'NodeB', 'Min element should be NodeB (priority 10)');
assert(pq.extractMin()?.item === 'NodeB', 'Extracted min should be NodeB');
assert(pq.extractMin()?.item === 'NodeC', 'Next extracted min should be NodeC');
assert(pq.extractMin()?.item === 'NodeA', 'Last extracted min should be NodeA');
console.log('✓ PriorityQueue passed all assertions.');

// 4. Test Graph Data Structure
console.log('\n[4/9] Testing Manual Adjacency List Graph...');
const g = new Graph();
g.addNode('ACC-1', { accountHolder: 'Holder 1' });
g.addNode('ACC-2', { accountHolder: 'Holder 2' });
g.addEdge('ACC-1', 'ACC-2', 50000, { transactionId: 'TX1' });
assert(g.getNodeCount() === 2, 'Graph node count should be 2');
assert(g.getEdgeCount() === 1, 'Graph edge count should be 1');
assert(g.getOutDegree('ACC-1') === 1, 'ACC-1 out-degree should be 1');
assert(g.getInDegree('ACC-2') === 1, 'ACC-2 in-degree should be 1');
const cloned = g.clone();
assert(cloned.getNodeCount() === 2, 'Cloned graph node count should be 2');
console.log('✓ Graph data structure passed all assertions.');

// 5. Test BFS & DFS Traversal
console.log('\n[5/9] Testing BFS & DFS Traversals...');
const complexCase = sampleCases[4];
const complexGraph = buildGraphFromTransactions(complexCase.transactions);

const bfsRes = runBFS(complexGraph, 'CORP-CORP01');
assert(bfsRes.traversalOrder.length > 0, 'BFS should explore reachable nodes');
assert(bfsRes.steps.length > 0, 'BFS should yield discrete execution steps');
console.log(`✓ BFS traversed ${bfsRes.traversalOrder.length} accounts in ${bfsRes.steps.length} discrete steps.`);

const dfsRes = runDFS(complexGraph, 'CORP-CORP01');
assert(dfsRes.traversalOrder.length > 0, 'DFS should explore reachable nodes');
assert(dfsRes.maxDepth > 0, 'DFS max depth should be > 0');
console.log(`✓ DFS reached depth ${dfsRes.maxDepth} in ${dfsRes.steps.length} discrete steps.`);

// 6. Test Directed Cycle Detection (3-State DFS) & Tarjan SCC
console.log('\n[6/9] Testing 3-State Cycle Detection & Tarjan SCC...');
const cycleCase = sampleCases[1]; // Case 2: Simple cycle (A -> B -> C -> D -> A)
const cycleGraph = buildGraphFromTransactions(cycleCase.transactions);

const cycleRes = detectDirectedCycles(cycleGraph);
assert(cycleRes.hasCycle === true, 'Cycle graph must detect a directed cycle');
assert(cycleRes.cycles.length === 1, 'Simple cycle case should have exactly 1 cycle');
console.log(`✓ Cycle Detection: Found cycle ${cycleRes.cycles[0].pathDescription} (Volume: ₹${cycleRes.cycles[0].totalAmount}).`);

const sccRes = runTarjanSCC(cycleGraph);
const multiNodeSCC = sccRes.components.filter((c) => c.nodes.length >= 2);
assert(multiNodeSCC.length === 1, 'Tarjan SCC must identify 1 multi-node ring');
console.log(`✓ Tarjan SCC: Identified component [${multiNodeSCC[0].nodes.join(', ')}] with ${multiNodeSCC[0].nodes.length} accounts.`);

// Test Normal Case (No cycles)
const normalCase = sampleCases[0];
const normalGraph = buildGraphFromTransactions(normalCase.transactions);
const normalCycleRes = detectDirectedCycles(normalGraph);
assert(normalCycleRes.hasCycle === false, 'Normal case must have NO cycles');
const normalSCCRes = runTarjanSCC(normalGraph);
assert(
  normalSCCRes.components.filter((c) => c.nodes.length >= 2).length === 0,
  'Normal case must have NO multi-node SCCs'
);
console.log('✓ Normal commerce graph confirmed 100% acyclic with 0 fraud rings.');

// 7. Test Dijkstra Shortest Path & Investigation Report
console.log('\n[7/9] Testing Dijkstra Shortest Path & Investigation Engine...');
const dijkstraRes = runDijkstra(cycleGraph, 'ACC-ALPHA', 'ACC-DELTA');
assert(dijkstraRes.shortestPath.length === 4, 'Shortest path should have 4 nodes (ALPHA -> BETA -> GAMMA -> DELTA)');
console.log(`✓ Dijkstra found path: ${dijkstraRes.shortestPath.join(' → ')} with cost ₹${dijkstraRes.totalWeight}.`);

const rings = analyzeFraudRings(complexGraph);
console.log(`✓ Fraud Ring Analyzer isolated ${rings.length} suspicious ring(s) in complex network.`);

const report = generateAccountInvestigationReport(complexGraph, 'ACC-ALPHA');
assert(report.account.id === 'ACC-ALPHA', 'Report should be for ACC-ALPHA');
assert(report.metrics.cycleInvolvementCount > 0, 'ACC-ALPHA should have cycle involvement');
assert(report.riskBreakdown.score >= 50, 'ACC-ALPHA risk score should be elevated');
console.log(`✓ Investigation Report compiled for ${report.account.id}: Risk Score ${report.riskBreakdown.score}/100 (${report.riskBreakdown.level}).`);

// 8. Test BFS Minimum-Hop Shortest Path & Edge Cases
console.log('\n[8/9] Testing BFS Minimum-Hop Shortest Path & Edge Cases...');
// Identical source and target
const bfsSameNode = runBFSShortestPath(complexGraph, 'ACC-ALPHA', 'ACC-ALPHA');
assert(bfsSameNode.isReachable === true, 'Identical source/target should be reachable');
assert(bfsSameNode.hopCount === 0, 'Identical source/target should have 0 hops');
assert(bfsSameNode.shortestPath.length === 1, 'Path for identical node should contain 1 node');

// Reachable route
const bfsPath = runBFSShortestPath(cycleGraph, 'ACC-ALPHA', 'ACC-DELTA');
assert(bfsPath.isReachable === true, 'ALPHA to DELTA should be reachable in cycle graph');
assert(bfsPath.hopCount === 3, 'ALPHA to DELTA should be 3 hops');
assert(bfsPath.shortestPath.join('->') === 'ACC-ALPHA->ACC-BETA->ACC-GAMMA->ACC-DELTA', 'Route must match expected order');

// Disconnected route
const bfsDisconnected = runBFSShortestPath(complexGraph, 'CORP-CORP01', 'ISOLATED-FOUNDATION');
assert(bfsDisconnected.isReachable === false, 'Isolated node should not be reachable from corporate root');
assert(bfsDisconnected.shortestPath.length === 0, 'Disconnected route should yield empty path array');
assert(bfsDisconnected.hopCount === Infinity, 'Disconnected hop count should be Infinity');
console.log('✓ BFS Shortest Path handles standard routes, identical vertices (0 hops), and disconnected components.');

// 9. Test CSV Parser Validation & Explainable Risk Config
console.log('\n[9/9] Testing CSV Parser Validation & Risk Configuration...');
const sampleTemplate = generateSampleCSVTemplate();
const validParse = parseTransactionCSV(sampleTemplate);
assert(validParse.success === true, 'Sample CSV template must parse successfully');
assert(validParse.transactions.length === 6, 'Sample CSV should have 6 transaction records');
assert(validParse.errors.length === 0, 'Valid CSV should have 0 errors');

// Test invalid CSV handling
const invalidCSV = `sender,receiver,amount\nACC-A,ACC-B,-5000\nACC-C,,10000`;
const invalidParse = parseTransactionCSV(invalidCSV);
assert(invalidParse.success === false, 'Invalid CSV must fail validation');
assert(invalidParse.errors.length >= 2, 'Must report negative amount and missing receiver errors');

// Test Risk Config integrity
assert(RISK_CONFIG.maxScore === 100, 'Risk max score must be 100');
assert(RISK_CONFIG.rules.cycleInvolvement.weight === 30, 'Cycle rule weight must be 30');
assert(RISK_CONFIG.rules.highValueTransfer.weight === 15, 'High value rule weight must be 15');
console.log('✓ CSV parser successfully validates data integrity and rejects malformed rows.');
console.log('✓ Centralized risk configuration correctly caps scores and configures heuristics.');

console.log('\n====================================================');
console.log('ALL 9 FRAUDGRAPH DSA & SYSTEM TEST SUITES PASSED!');
console.log('====================================================\n');
