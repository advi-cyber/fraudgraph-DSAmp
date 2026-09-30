# FRAUDGRAPH: Graph-Based Fraud Detection & Transaction Investigation System

> **Academic Data Structures & Algorithms (DSA) Micro-Project**  
> **Course Outcomes Integrated:** CO3 (Data Structures & Graph Representations), CO4 (Graph Algorithm Analysis), CO5 (Computational Solution Development)  
> **Industry Focus:** Banking, Financial Crime Compliance (AML), Cybersecurity, Regulatory Intelligence

---

## 1. Project Title & Overview
**FRAUDGRAPH** is a specialized computational platform that models financial transaction ledgers as directed weighted multigraphs. The system identifies, isolates, and audits potentially suspicious transaction typologies—such as circular fund routing (round-tripping), multi-hop layering chains (mule accounts), and collusion rings—using manually implemented, deterministic graph algorithms with zero reliance on opaque machine learning models or third-party graph algorithm libraries.

> **Important Regulatory & Academic Disclaimers:**  
> Graph anomalies provide **topological risk indicators** and **graph evidence** for compliance investigation. Graph patterns do **not** constitute automated legal proof of criminality. Terminology used across the platform conforms to international banking compliance standards: *"Potentially Suspicious"*, *"Risk Indicator"*, *"Suspicious Pattern"*, *"Graph Evidence"*, and *"Investigation Result"*.

---

## 2. Problem Statement
Modern financial crime syndicates exploit traditional relational banking databases by fragmenting illicit capital across complex, multi-tiered transaction networks. Relational SQL queries (`JOIN` operations) suffer from exponential performance degradation ($O(N^k)$) when attempting to trace funds across 4 or more hops. Furthermore, traditional tabular ledgers obscure structural anomalies such as closed circular loops and strongly connected collusion rings. There is a critical computational need for an explicit graph-theoretic model that can detect topological anomalies in near real-time with deterministic polynomial-time complexity.

---

## 3. Motivation
In contemporary Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) operations:
1. **Layering Obfuscation:** Perpetrators route funds through daisy-chained mule accounts to sever audit trails.
2. **Wash Trading & Round-Tripping:** Capital is circulated through offshore shell companies and returned to the originator to fabricate legitimate commercial turnover.
3. **Smurfing:** Large capital sums are decomposed into multiple sub-threshold transactions (fan-out) and reconstituted downstream (fan-in).

Graph data structures and classical graph algorithms provide the exact mathematical abstractions required to detect these patterns deterministically.

---

## 4. Project Objectives
- **Representation (CO3):** Construct a custom directed weighted graph using an adjacency list structure capable of dynamic vertex and edge mutation.
- **Algorithmic Rigor (CO4):** Manually implement BFS, DFS, 3-State Cycle Detection, Dijkstra’s Shortest Path, and Tarjan’s Strongly Connected Components (SCC) with step-by-step state logging.
- **Forensic Visualization & Application (CO5):** Provide an interactive cybersecurity investigation dashboard featuring step-by-step algorithm animation, chronological timeline replay, what-if transaction simulation, and printable audit dossiers.

---

## 5. Industry Focus
- **Commercial & Retail Banking:** Rapid fraud ring detection and transaction risk scoring.
- **Financial Intelligence Units (FIUs):** Automated Suspicious Activity Report (SAR) generation.
- **Cybersecurity & Threat Intelligence:** Asset tracing in ransomware and financial theft incidents.

---

## 6. Integrated Course Outcomes (CO Mapping)

| Course Outcome | Academic Definition | FRAUDGRAPH Concrete Implementation |
| :--- | :--- | :--- |
| **CO3** | Application of advanced data structures and graph representations | - Custom directed adjacency list graph (`Graph.ts`)<br>- Dynamic vertices and directed weighted edges (`GraphNode.ts`, `GraphEdge.ts`)<br>- Custom FIFO Queue (`Queue.ts`) with $O(1)$ amortized operations<br>- Custom LIFO Stack (`Stack.ts`) for recursion tracking<br>- Custom Min-Binary Heap (`PriorityQueue.ts`) with bubble-up/sink-down |
| **CO4** | Application and empirical complexity analysis of graph algorithms | - Manual BFS ($O(V+E)$) for blast radius and level-order hop traversal<br>- Manual DFS ($O(V+E)$) for deep mule chain depth discovery<br>- 3-State Color DFS ($O(V+E)$) for back-edge circular loop proofs<br>- Manual Dijkstra ($O((V+E)\log V)$) for minimum-friction pathfinding<br>- Tarjan’s Low-Link DFS ($O(V+E)$) for strongly connected component decomposition |
| **CO5** | Design and development of a practical, explainable computational solution | - Chronological Timeline Replay with dynamic cycle emergence detection<br>- Sandbox What-If Simulator with in-memory graph cloning and diff alerts<br>- Explainable 0–100 Topological Risk Scoring Engine (Zero ML)<br>- Printable Forensic Audit Dossier (`InvestigationReport.tsx`) |

---

## 7. Technology Stack
- **Language & Runtime:** TypeScript (Strict Mode), Node.js (v24+)
- **Build System & Dev Server:** Vite 8
- **UI Architecture:** React 19, Vanilla CSS Design System (Custom Dark Navy / Banking Theme)
- **Graph Canvas Rendering:** React Flow (`@xyflow/react`)
- **Iconography:** Lucide React
- **Test Runner:** Custom TypeScript Automated Verification Suite (`verifyDSA.ts`)

---

## 8. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRAUDGRAPH PLATFORM                       │
└─────────────────────────────────────────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │   User Interaction   │        │ Fictional Datasets   │
    │  - Quick Analysis    │        │  - Normal Commerce   │
    │  - Timeline Slider   │        │  - Simple Cycle      │
    │  - What-If Form      │        │  - Multi-Ring Scheme │
    └──────────────────────┘        │  - Mule Chains       │
               │                    └──────────────────────┘
               ▼                               │
    ┌──────────────────────────────────────────┴───────────┐
    │          Adjacency List Graph Engine (CO3)           │
    │          Map<NodeId, Node>, Map<NodeId, Edge[]>      │
    └──────────────────────────────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │ Custom Primitives    │        │ Manual DSA Core (CO4)│
    │  - FIFO Queue        │───────►│  - BFS Traversal     │
    │  - LIFO Stack        │───────►│  - DFS Traversal     │
    │  - Min-Heap PQ       │───────►│  - 3-State Cycle     │
    └──────────────────────┘        │  - Dijkstra Path     │
                                    │  - Tarjan SCC        │
                                    └──────────────────────┘
                                               │
                                               ▼
                                    ┌──────────────────────┐
                                    │ AlgorithmStep[] Log  │
                                    │  - Current Node      │
                                    │  - Queue/Stack State │
                                    │  - Visited Set       │
                                    │  - Narrative Proof   │
                                    └──────────────────────┘
                                               │
               ┌───────────────────────────────┴──────────────────────┐
               ▼                                                      ▼
    ┌──────────────────────┐                               ┌──────────────────────┐
    │ Animation Hook       │                               │ Forensic Services    │
    │  - Step Queue        │                               │  - Risk Analyzer     │
    │  - Play / Pause      │                               │  - Ring Correlator   │
    │  - Speed Controller  │                               │  - Audit Generator   │
    └──────────────────────┘                               └──────────────────────┘
               │                                                      │
               └───────────────────────┬──────────────────────────────┘
                                       ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                   React Flow Canvas & UI (CO5)                  │
    │  - Custom AccountNode (In/Out Degree, Volume Badges)            │
    │  - Custom TransactionEdge (Amounts, Timestamps, Cycle Glow)      │
    │  - Real-Time Algorithm Execution Console & Printable Reports    │
    └─────────────────────────────────────────────────────────────────┘
```

---

## 9. Graph Representation
The financial network is modeled as a Directed Weighted Multigraph $G = (V, E)$:
- **Vertices ($V$):** Bank Accounts / Corporate Entities / Mule Candidates.
  - Node Metadata: `id`, `accountHolder`, `accountType` (`PERSONAL`, `BUSINESS`, `MERCHANT`, `SHELL_COMPANY`, `MULE_CANDIDATE`), `inDegree`, `outDegree`, `totalInAmount`, `totalOutAmount`.
- **Directed Edges ($E$):** Wire Transfers, RTGS, P2P Transactions.
  - Direction: Outbound from Sender account to Receiver account.
  - Edge Weight ($w$): Transaction monetary amount in Indian Rupees (₹ INR).
  - Edge Metadata: `transactionId`, `timestamp`, `description`, `channelType`, `status`.

---

## 10. Manual Algorithm Specifications

### 10.1 Breadth-First Search (BFS)
- **File:** [`src/algorithms/bfs.ts`](file:///c:/Users/LENOVO/Desktop/DSA%20mp/src/algorithms/bfs.ts)
- **Data Structure Used:** Custom FIFO `Queue<string>` (`src/dataStructures/Queue.ts`)
- **Execution Mechanism:** Starting at a specified root account, enqueues neighbor accounts level-by-level. Tracks layer depth ($L_0, L_1, \dots$).
- **Banking Use Case:** Immediate blast-radius mapping, tracing smurfing fan-out distributions, identifying all accounts reachable within $k$ hops.
- **Complexity:** Time $O(V + E)$, Space $O(V)$.

### 10.2 Depth-First Search (DFS)
- **File:** [`src/algorithms/dfs.ts`](file:///c:/Users/LENOVO/Desktop/DSA%20mp/src/algorithms/dfs.ts)
- **Data Structure Used:** Explicit Call Stack / `Stack<string>` (`src/dataStructures/Stack.ts`)
- **Execution Mechanism:** Descends along the deepest available outbound edge until reaching a terminal node or previously explored path, then explicitly backtracks.
- **Banking Use Case:** Uncovering narrow, linear layering funnels where illicit funds hop through successive intermediary accounts to an exfiltration exit point.
- **Complexity:** Time $O(V + E)$, Space $O(V)$.

### 10.3 Directed Cycle Detection (3-State DFS)
- **File:** [`src/algorithms/cycleDetection.ts`](file:///c:/Users/LENOVO/Desktop/DSA%20mp/src/algorithms/cycleDetection.ts)
- **State Coloring Scheme:**
  - `0 (UNVISITED)`: Account has not yet been explored.
  - `1 (VISITING)`: Account is currently active in the DFS recursion stack (ancestor).
  - `2 (PROCESSED)`: Account and all downstream branches are fully explored.
- **Cycle Proof:** When traversing edge $u \to v$, if $\text{state}[v] == 1$, edge $(u, v)$ is proven to be a **back-edge** to an active ancestor. The exact cycle path $v \to \dots \to u \to v$ is extracted, constituent transactions are indexed, and total circular volume is calculated.
- **Banking Use Case:** Identifying round-tripping, fictitious billing loops, and self-dealing schemes.
- **Complexity:** Time $O(V + E)$, Space $O(V)$.

### 10.4 Dijkstra’s Shortest Path Algorithm
- **File:** [`src/algorithms/dijkstra.ts`](file:///c:/Users/LENOVO/Desktop/DSA%20mp/src/algorithms/dijkstra.ts)
- **Data Structure Used:** Custom Min-Binary Heap `PriorityQueue<string>` (`src/dataStructures/PriorityQueue.ts`)
- **Execution Mechanism:** Greedily extracts the account with the lowest cumulative transaction cost/friction. Performs edge relaxation:
  $$\text{if } \text{dist}[u] + w(u, v) < \text{dist}[v] \implies \text{dist}[v] \leftarrow \text{dist}[u] + w(u, v)$$
- **Banking Use Case:** Identifying the minimum transaction path connecting a suspected criminal origin to a beneficiary account across complex intermediary networks.
- **Complexity:** Time $O((V + E) \log V)$, Space $O(V)$.

### 10.5 Strongly Connected Components (Tarjan’s Algorithm)
- **File:** [`src/algorithms/stronglyConnectedComponents.ts`](file:///c:/Users/LENOVO/Desktop/DSA%20mp/src/algorithms/stronglyConnectedComponents.ts)
- **Data Structure Used:** Depth-First Search with `Stack<string>`, discovery time array `disc[]`, and lowest reachable link array `low[]`.
- **Execution Mechanism:** Assigns discovery numbers. Updates low-link values from subtrees and back-edges to stack elements. When $\text{low}[u] == \text{disc}[u]$, account $u$ is the root of an SCC; pops all component accounts from the stack.
- **Banking Use Case:** Isolating organized money laundering rings where every account in the syndicate can mutually transfer funds to every other account.
- **Complexity:** Time $O(V + E)$, Space $O(V)$.

---

## 11. Novelty Features

### 11.1 Chronological Transaction Timeline Replay
- Orders all transactions chronologically.
- A playback slider permits investigators to move forward and backward through time.
- The graph dynamically constructs edge-by-edge.
- Evaluates topology at each time step and generates instant alerts when a cycle first closes:
  > *"POTENTIAL CYCLE EMERGED AFTER TRANSACTION TX2004! Edge: ACC-DELTA → ACC-ALPHA (₹182,500)"*

### 11.2 What-If Transaction Simulator
- Enables compliance officers to model hypothetical transactions in a cloned sandbox graph without altering the baseline ledger.
- Runs instant before/after comparative analysis (Cycle delta, SCC delta, risk score delta).
- Offers one-click `[Apply Transaction to Real Graph]` or `[Discard Simulation]`.

### 11.3 Explainable Topological Risk Engine
- Absolutely zero black-box machine learning.
- Deterministic 0–100 score calculated via additive graph-theoretic factors:
  - Circular Fund Routing: $+20$ to $+30$ pts
  - Strongly Connected Ring Member: $+20$ to $+25$ pts
  - Layering Chain Depth ($\ge 4$ hops): $+15$ pts
  - Transaction Volume Concentration: $+5$ to $+15$ pts
  - Rapid Pass-Through (Mule Funnel In/Out Balance): $+8$ to $+15$ pts

---

## 12. Complexity Analysis Summary

| Algorithm | Primary Data Structure | Time Complexity | Auxiliary Space | Graph Invariant / Proof |
| :--- | :--- | :--- | :--- | :--- |
| **BFS** | Custom FIFO Queue | $O(V + E)$ | $O(V)$ | Explores shortest unweighted hop frontier |
| **DFS** | Custom LIFO Stack | $O(V + E)$ | $O(V)$ | Traverses maximum path depth before backtracking |
| **Cycle Detection** | 3-State Color Map | $O(V + E)$ | $O(V)$ | Back-edge to node in `VISITING` (1) state |
| **Dijkstra** | Min-Heap Priority Queue | $O((V + E) \log V)$ | $O(V)$ | Triangle inequality relaxation invariant |
| **Tarjan SCC** | Low-Link Stack | $O(V + E)$ | $O(V)$ | Root vertex identified when $\text{low}[u] == \text{disc}[u]$ |

---

## 13. Deterministic Datasets

FRAUDGRAPH provides 5 built-in deterministic demo datasets selectable from the top navbar:
1. **Dataset 1: Normal Commerce Network:** Legitimate corporate payroll distributions and merchant payments. Strict Directed Acyclic Graph (DAG) with 0 cycles and 0 suspicious rings.
2. **Dataset 2: Simple 4-Node Circular Ring:** Circular laundering loop (`ACC-ALPHA → ACC-BETA → ACC-GAMMA → ACC-DELTA → ACC-ALPHA`).
3. **Dataset 3: Multiple Interconnected Rings:** Two separate laundering rings linked by an inter-syndicate bridging edge.
4. **Dataset 4: Long Layering Mule Chain:** Multi-hop linear pass-through chain (`ORIGIN-HEIST → MULE-1 → MULE-2 → MULE-3 → MULE-4 → EXFIL`).
5. **Dataset 5: Complex Enterprise Network:** 28 accounts and 60+ transactions combining legitimate business operations, merchant hubs, 2 collusion rings, and an exfiltration channel.

---

## 14. Installation & Running Instructions

### Prerequisites
- Node.js (v18.0.0 or higher, tested on Node v24)
- npm (v9.0.0 or higher)

### Setup Steps
```bash
# 1. Clone or navigate to the project directory
cd "DSA mp"

# 2. Install dependencies
npm install

# 3. Run the automated DSA algorithm verification test suite
npm test

# 4. Start the development server
npm run dev
```
Open your browser and navigate to `http://localhost:5173/`.

### Production Build
```bash
npm run build
npm run preview
```

---

## 15. Limitations & Future Enhancements

### Limitations
- **Memory Bound:** The adjacency list is stored in client memory; graphs exceeding 50,000 vertices should integrate Web Workers or indexed off-thread buffers.
- **Elementary Cycles:** Enumeration focuses on elementary cycles to avoid exponential runtime on dense cyclic subgraphs.
- **Non-Negative Weights:** Dijkstra requires non-negative edge amounts (transaction values are non-negative).

### Future Enhancements
- **Dynamic Bipartite Matching:** Identifying synthetic identity clusters using Hopcroft-Karp.
- **Maximum Flow / Min-Cut:** Modeling syndicate bottleneck accounts via Edmonds-Karp.
- **Temporal Graph Windows:** Sliding window time-decaying edge weights.
