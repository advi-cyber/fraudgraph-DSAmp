# FraudGraph — Explainable Transaction Fraud Investigation System

> **Academic Data Structures & Algorithms (DSA) Microproject**  
> **Course Outcomes Addressed:**  
> - **CO3:** Advanced Data Structures & Custom Graph Representations (Adjacency List, Custom FIFO Queue, LIFO Stack, Min-Binary Heap)  
> - **CO4:** Design, Invariant Analysis, and Complexity Evaluation of Graph Algorithms (BFS, DFS, 3-State Cycle Detection, Dijkstra's Shortest Path, Tarjan's Strongly Connected Components)  
> - **CO5:** Development of Explainable, Interactive Computational Cybersecurity Applications (Zero-ML Rule-Based Risk Engine, Chronological Timeline Replay, What-If Simulation Sandbox, CSV Audit Ingestion & Export)  
>
> **Domain Focus:** Banking Compliance, Anti-Money Laundering (AML), Counter-Terrorist Financing (CTF), Financial Intelligence Units (FIU).

---

## 1. Project Title & Overview

**FraudGraph** is an interactive, explainable, and academically rigorous financial crime investigation platform designed for college Data Structures and Algorithms evaluation and financial cyber-intelligence demonstration. 

It models transaction ledgers as directed weighted multigraphs where:
- **Vertices ($V$):** Represent bank accounts, corporate entities, merchant payment gateways, and suspected money mules.
- **Directed Edges ($E$):** Represent individual financial transfers carrying monetary amounts (edge weights), timestamps, channel types, and transaction identifiers.

Unlike opaque machine learning systems or black-box third-party graph libraries, **FraudGraph implements 100% of its data structures and graph algorithms manually in strict TypeScript**. Every algorithmic traversal, cycle detection, shortest-path calculation, and strongly connected component decomposition generates an inspectable, step-by-step state log. This delivers full computational transparency, deterministic risk scoring, and auditable proof trails for regulatory compliance.

### Regulatory & Academic Disclaimer
> **Important Compliance Clarification:**  
> Graph anomalies (such as directed cycles, strongly connected components, or rapid fan-in/fan-out flows) provide **topological risk indicators** and **investigative leads** to prioritize compliance workloads. They do **not** constitute automated legal proof of criminal intent. In banking compliance, legitimate commercial transactions (e.g., supplier refunds, escrow settlements, circular vendor netting) can structurally resemble laundering patterns. FraudGraph strictly uses standardized AML terminology: *"Potentially Suspicious"*, *"Graph Evidence"*, *"Risk Indicator"*, and *"Investigation Result"*.

---

## 2. Problem Statement & Motivation

### The Problem
Modern money laundering and financial fraud syndicates exploit traditional relational database architectures (RDBMS). Traditional core-banking databases store transaction ledgers in tabular SQL formats (`accounts` and `transactions` tables). 

When compliance officers attempt to identify multi-hop laundering chains or circular routing schemes using SQL `JOIN` operations:
1. **Exponential Query Degradation:** Each hop requires a self-join (`JOIN transactions t2 ON t1.receiver = t2.sender`). Tracing a 5-hop mule chain yields an $O(N^k)$ computational complexity that freezes transactional databases.
2. **Invisibility of Closed Topologies:** Tabular ledgers completely obscure closed circular cycles ($A \to B \to C \to D \to A$) and mutual collusion networks (strongly connected components).
3. **Black-Box AI Liabilities:** While modern institutions experiment with Deep Learning and Graph Neural Networks (GNNs), financial regulators (such as RBI, FinCEN, FATF, and the European Banking Authority) mandate explainability. An investigator cannot submit a SAR (Suspicious Activity Report) or freeze assets solely on an uninterpretable probability weight.

### Real-World AML Money Laundering Typologies
Financial crime typically progresses through three recognized stages:
1. **Placement:** Introducing illicit cash into the legitimate financial system via structured micro-deposits (smurfing / rapid fan-in).
2. **Layering:** Rapidly moving funds through daisy-chained mule accounts and shell corporations to sever the audit trail and disguise the original source (multi-hop linear chains, fan-out dispersion, and circular round-tripping).
3. **Integration:** Re-injecting cleansed capital into the economy through seemingly legitimate commercial entities or fictitious invoicing loops.

### The Graph-Theoretic Solution
By modeling bank accounts as vertices and transactions as directed edges, financial networks can be queried using classical graph algorithms in polynomial time:
- Breadth-First Search reveals **immediate blast radii** and **minimum-hop intermediary routes** in $O(V + E)$ time.
- Depth-First Search uncovers **deep layering funnels** in $O(V + E)$ time.
- 3-State Graph Coloring proves **directed cycles and wash-trading loops** in $O(V + E)$ time.
- Dijkstra’s Algorithm pinpoints the **minimum-friction or lowest-cost fund transfer corridor** in $O((V + E) \log V)$ time.
- Tarjan’s Algorithm isolates **tightly-knit collusion rings** in a single $O(V + E)$ pass.

---

## 3. Project Objectives & Scope

- **Representation (CO3):** Build an in-memory, directed weighted multigraph utilizing a custom Adjacency List. Avoid third-party graph engines (such as Neo4j or NetworkX) to demonstrate pure data-structure construction from first principles.
- **Algorithmic Rigor (CO4):** Implement every algorithm from scratch:
  - Custom FIFO Queue for BFS.
  - Custom LIFO Stack for DFS and low-link tracking.
  - Custom Min-Binary Heap (`PriorityQueue`) with bubble-up and sink-down operations for Dijkstra.
  - 3-State recursive DFS for cycle detection.
  - Tarjan’s low-link algorithm for SCC decomposition.
- **Explainable Risk Scoring (CO5):** Develop a deterministic 0–100 risk scoring engine based on transparent, regulatory-aligned topological heuristics (cycles, SCCs, high-value transfers, fan-in, fan-out, mule pass-through, and chain depth).
- **Interactive Cybersecurity Dashboard (CO5):** Create a clean, distraction-free visual interface featuring:
  - Interactive `@xyflow/react` node-edge canvas with dynamic visual badges and cycle-glow highlights.
  - Dual-mode shortest path analysis (Unweighted BFS Minimum Hops vs. Weighted Dijkstra Minimum Cost).
  - Step-by-step Algorithm Execution Console with real-time stack/queue inspection.
  - Chronological Timeline Replay with dynamic cycle emergence alerts.
  - Sandbox "What-If" Transaction Simulator with graph cloning and diff analysis.
  - Complete CSV Data Ingestion and Multi-Format CSV Forensic Report Export.

---

## 4. Technology Stack

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Language** | TypeScript 5.x (Strict Mode) | Strong type-safety for complex graph interfaces, compile-time invariant enforcement, and zero `any` shortcuts. |
| **Frontend Framework** | React 19 + Vite 8 | Fast component rendering, reactive state management, sub-second HMR development, and optimized tree-shaking. |
| **Canvas Visualization** | React Flow (`@xyflow/react` v12) | High-performance interactive DOM/SVG canvas with customizable nodes, edges, panning, zooming, and node repositioning. |
| **Design System** | Vanilla CSS (Light Neutral Theme) | Custom executive banking cybersecurity palette: light canvas (`#f8fafc`, `#ffffff`), dark navy typography (`#0f172a`), subtle slate borders (`#e2e8f0`), and restrained status colors (emerald, amber, red). No heavy purple gradients. |
| **Iconography** | Lucide React | Lightweight, crisp vector icons for cybersecurity and financial operations. |
| **Verification Suite** | Custom Node.js/TSX Test Suite (`verifyDSA.ts`) | Comprehensive automated test harness running 9 independent test suites verifying all custom data structures, graph traversals, and risk computations. |
| **External Dependencies** | Zero Graph Libraries | **100% custom algorithmic implementations.** No D3-graph, no Graphology, no Cytoscape, no NetworkX, and no ML/AI APIs. Works completely offline. |

---

## 5. System Architecture & Directory Structure

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      FRAUDGRAPH DASHBOARD INTERFACE                    │
│   (Executive Light Palette, Account Detail Panels, Live Data Tables)    │
└────────────────────────────────────────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌───────────────────────────────┐         ┌───────────────────────────────┐
│     DATA INGESTION LAYER      │         │   WHAT-IF & TIMELINE SANDBOX  │
│ - 7 Deterministic Scenarios   │         │ - In-Memory Graph Cloning     │
│ - CSV File Parser & Validator │         │ - Chronological Edge Playback │
│ - Synthetic CSV Generator     │         │ - Dynamic Cycle Emergence     │
└───────────────────────────────┘         └───────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 CUSTOM GRAPH ENGINE (CO3 ADJACENCY LIST)               │
│         Map<string, GraphNode>   &   Map<string, GraphEdge[]>          │
│                   Dynamic Vertex & Edge Mutators                       │
└────────────────────────────────────────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌───────────────────────────────┐         ┌───────────────────────────────┐
│     MANUAL PRIMITIVES (CO3)   │         │    MANUAL ALGORITHMS (CO4)    │
│ - Queue<T> (FIFO)             │────────►│ - BFS Traversal & Min Hops    │
│ - Stack<T> (LIFO)             │────────►│ - DFS Deep Chain Traversal    │
│ - PriorityQueue<T> (Min-Heap) │────────►│ - 3-State Cycle Detection     │
└───────────────────────────────┘         │ - Dijkstra Minimum Cost       │
                                          │ - Tarjan Strongly Connected   │
                                          └───────────────────────────────┘
                                                           │
                                                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│              EXPLAINABLE RISK & FORENSIC ENGINE (CO5)                  │
│ - 7 Additive Heuristic Rules (Centralized RISK_CONFIG)                 │
│ - Step-by-Step Execution Logger (AlgorithmStep[])                      │
│ - Forensic Audit Report Generator & CSV Exporter                       │
└────────────────────────────────────────────────────────────────────────┘
```

### Complete Project Directory Tree

```
FraudGraph/
├── package.json                    # Project dependencies, build & test scripts
├── tsconfig.json                   # Strict TypeScript compiler options
├── vite.config.ts                  # Vite build and dev-server configuration
├── verifyDSA.ts                    # 9-suite automated verification test script
├── README.md                       # Comprehensive university microproject documentation
├── public/                         # Static assets and icons
└── src/
    ├── main.tsx                    # Application bootstrap entry point
    ├── App.tsx                     # Main navigation layout and route state
    ├── index.css                   # Executive light neutral design system tokens
    ├── App.css                     # Global view containers
    │
    ├── algorithms/                 # Core Graph Algorithm Implementations (CO4)
    │   ├── bfs.ts                  # BFS exploration & unweighted min-hop shortest path
    │   ├── dfs.ts                  # DFS deep chain exploration with path depth tracking
    │   ├── cycleDetection.ts       # 3-State directed cycle detection & path recovery
    │   ├── dijkstra.ts             # Dijkstra's shortest path via manual Min-Heap PQ
    │   └── stronglyConnectedComponents.ts # Tarjan's low-link SCC algorithm
    │
    ├── dataStructures/             # Custom Fundamental Data Structures (CO3)
    │   ├── Graph.ts                # Adjacency list directed weighted graph
    │   ├── GraphNode.ts            # Vertex definition with degree & volume counters
    │   ├── GraphEdge.ts            # Directed weighted transaction edge interface
    │   ├── Queue.ts                # Custom FIFO queue with O(1) amortized operations
    │   ├── Stack.ts                # Custom LIFO stack with invariant validation
    │   └── PriorityQueue.ts        # Custom binary min-heap with bubble-up & sink-down
    │
    ├── config/                     # Centralized Rule & Risk Configurations
    │   └── riskRules.ts            # Heuristic weights, thresholds, and severity criteria
    │
    ├── services/                   # Business Logic & Forensic Computations
    │   ├── riskAnalyzer.ts         # Deterministic 0-100 risk scoring engine
    │   ├── fraudAnalyzer.ts        # Suspicious ring correlation & summary metrics
    │   ├── graphBuilder.ts         # Graph instantiation from transaction records
    │   ├── reportGenerator.ts      # Printable audit dossier generator
    │   └── csvExport.ts            # Multi-format CSV export (summary, account, path)
    │
    ├── utils/                      # Helper Utilities & Mathematical Formatters
    │   ├── csvParser.ts            # CSV ingestion validator & synthetic generator
    │   ├── complexity.ts           # Theoretical complexity documentation tables
    │   ├── currency.ts             # INR (₹) monetary formatting
    │   ├── date.ts                 # ISO timestamp formatting & time deltas
    │   └── graphLayout.ts          # Algorithmic layout coordinates for React Flow
    │
    ├── types/                      # TypeScript Domain Models & Interfaces
    │   ├── account.ts              # Account entity models and account types
    │   ├── transaction.ts          # Transaction models and payment channel types
    │   ├── algorithm.ts            # Traversal steps, shortest path, and cycle types
    │   └── risk.ts                 # Risk breakdown, factors, and audit reports
    │
    ├── data/                       # Built-in Test Scenarios
    │   └── sampleCases.ts          # 7 curated test datasets including disconnected clusters
    │
    ├── components/                 # Reusable UI & Visualization Components
    │   ├── Navbar.tsx              # Top navigation bar with scenario switcher & CSV actions
    │   ├── Sidebar.tsx             # Collapsible navigation drawer
    │   ├── GraphVisualizer.tsx     # React Flow canvas wrapper with node/edge selection
    │   ├── GraphControls.tsx       # Canvas controls (zoom, fit view, reset highlights)
    │   ├── DashboardStats.tsx      # Top 6 executive KPI metric cards
    │   ├── AccountDetailPanel.tsx  # Detailed slide-out audit panel for nodes & edges
    │   ├── AlgorithmControls.tsx   # Algorithm launcher (BFS, DFS, Dijkstra, Cycles, SCC)
    │   ├── AlgorithmConsole.tsx    # Live step-by-step queue/stack inspection console
    │   ├── PathAnalysisCard.tsx    # Shortest path results (BFS hops vs Dijkstra cost)
    │   ├── CycleCard.tsx           # Cycle detection findings and circular volume
    │   ├── FraudRingCard.tsx       # Collusion ring summary card
    │   ├── RiskIndicator.tsx       # Visual risk meter badge with severity colors
    │   ├── TransactionTable.tsx    # Searchable, filterable live transaction ledger
    │   ├── TransactionForm.tsx     # Manual single-transaction injector
    │   ├── CSVUploadModal.tsx      # Drag-and-drop CSV modal with error validation
    │   ├── Timeline.tsx            # Interactive playback slider for chronological replay
    │   ├── InvestigationReport.tsx # Full-screen printable audit dossier
    │   └── graph/                  # Custom React Flow Node & Edge Renderers
    │       ├── AccountNode.tsx     # Custom bank node with degree and risk rings
    │       └── TransactionEdge.tsx # Custom directed edge with amount badge & cycle glow
    │
    └── pages/                      # Application Page Views
        ├── Dashboard.tsx           # Primary executive investigation command center
        ├── NetworkAnalysis.tsx     # Full-canvas topological explorer
        ├── FraudInvestigation.tsx  # Dedicated cycle & collusion ring investigation view
        ├── AccountInvestigation.tsx# Single-account deep-dive dossier view
        ├── TimelineAnalysis.tsx    # Chronological transaction playback page
        ├── Simulator.tsx           # Sandbox "What-If" transaction impact simulator
        ├── AlgorithmComparison.tsx # Empirical benchmark and complexity comparison
        ├── Transactions.tsx        # Complete tabular transaction ledger
        └── Reports.tsx             # Audit report generator and export center
```

---

## 6. Graph Representation: Adjacency List

FraudGraph represents the financial transaction network as a Directed Weighted Multigraph $G = (V, E)$ using an **Adjacency List** stored in memory via TypeScript native `Map` collections:

```typescript
export class Graph {
  private nodes: Map<string, GraphNode>;
  private adjacencyList: Map<string, GraphEdge[]>;
  private reverseAdjacencyList: Map<string, GraphEdge[]>;
  ...
}
```

### Why Adjacency List over Adjacency Matrix?

In financial transaction networks, an Adjacency List is vastly superior to an Adjacency Matrix for four critical computational reasons:

| Parameter | Adjacency List (Used by FraudGraph) | Adjacency Matrix |
| :--- | :--- | :--- |
| **Space Complexity** | $\mathcal{O}(V + E)$ | $\mathcal{O}(V^2)$ |
| **Sparse Graph Efficiency** | Highly optimal. Banking networks are extremely sparse; each account transacts with only a tiny fraction of total accounts ($E \ll V^2$). | Catastrophically wasteful. A graph with $100,000$ accounts would require a matrix with $10^{10}$ cells ($>40\text{ GB}$ of RAM), 99.99% of which would be zeroes. |
| **Neighbor Iteration** | $\mathcal{O}(\text{deg}(u))$ — Iterates only over actual outbound transactions. | $\mathcal{O}(V)$ — Must scan an entire row of $V$ entries to find non-zero edges, even if the node has only 1 outbound edge. |
| **Multigraph Support** | Trivially handles multiple transactions between the same pair of accounts by storing multiple `GraphEdge` objects in the edge array. | Inflexible. Storing multiple parallel transactions between identical nodes requires 3D matrices or linked list entries per cell. |
| **Dynamic Vertex Mutation** | Adding a new account is an $\mathcal{O}(1)$ amortized `Map.set()` operation. | Adding a vertex requires resizing an entire $V \times V$ 2D matrix ($\mathcal{O}(V^2)$ copy overhead). |

### Vertex Metadata (`GraphNode`)
Each vertex encapsulates full entity context:
- `id`: Unique alphanumeric account identifier (e.g., `ACC-ALPHA`, `MULE-01`).
- `accountHolder`: Human-readable entity or owner name.
- `accountType`: Classification (`PERSONAL`, `BUSINESS`, `MERCHANT`, `SHELL_COMPANY`, `MULE_CANDIDATE`).
- `inDegree`: Count of distinct inbound incoming transaction edges.
- `outDegree`: Count of distinct outbound outgoing transaction edges.
- `totalInAmount`: Cumulative incoming volume (in ₹ INR).
- `totalOutAmount`: Cumulative outgoing volume (in ₹ INR).

### Directed Edge Metadata (`GraphEdge`)
Each directed edge represents an explicit financial movement:
- `id`: Unique transaction identifier (e.g., `TX-1001`).
- `source`: Originating sender account ID.
- `target`: Beneficiary receiver account ID.
- `amount`: Monetary value transferred in Indian Rupees (₹ INR), serving as edge weight $w(u, v)$.
- `timestamp`: ISO-8601 timestamp representing the exact chronological moment of execution.
- `channelType`: Channel of execution (`WIRE`, `RTGS`, `NEFT`, `P2P`, `INTERNAL_LEDGER`).
- `description`: Narrative ledger description or invoice reference.

---

## 7. Algorithmic Explanations & Invariants

FraudGraph includes five fundamental graph algorithms implemented from scratch without external libraries.

### 7.1 Breadth-First Search (BFS)
- **Source File:** `src/algorithms/bfs.ts`
- **Data Structure:** Custom FIFO `Queue<string>` (`src/dataStructures/Queue.ts`)
- **Traversal Mechanics:**
  1. Enqueue source account and mark as visited in a `Set<string>`.
  2. While the queue is not empty, dequeue vertex $u$, log its state, and inspect each outgoing edge $(u, v)$.
  3. If neighbor $v$ has not been visited, mark $v$ as visited, set parent pointer $\text{parent}[v] \leftarrow u$, record hop level $\text{level}[v] \leftarrow \text{level}[u] + 1$, and enqueue $v$.
- **Shortest Path Invariant (`runBFSShortestPath`):**
  - Because BFS explores vertices in strictly increasing order of their distance from the source in an unweighted graph, the first time the target vertex is reached, the path recovered via parent pointers is **mathematically guaranteed to have the minimum number of hops (edges)**.
  - **Edge Case Handling:**
    - Identical Source and Target: Returns immediate success with $0$ hops and single-element path.
    - Disconnected Components: If the queue exhausts without reaching the target, the algorithm terminates cleanly with `isReachable: false`, `hopCount: Infinity`, and empty path.
- **Banking Use Case:** Immediate blast-radius mapping, identifying all accounts within $k$ hops of a compromised origin, and finding the route requiring the fewest intermediary money mules.
- **Complexity:** Time $\mathcal{O}(V + E)$, Space $\mathcal{O}(V)$.

### 7.2 Depth-First Search (DFS)
- **Source File:** `src/algorithms/dfs.ts`
- **Data Structure:** Custom LIFO `Stack<string>` (`src/dataStructures/Stack.ts`) and recursion call stack
- **Traversal Mechanics:**
  1. Starting at a source vertex, recursively descends along outgoing edges, marking nodes in a visited set.
  2. Tracks current path depth and backtracks immediately when a branch reaches a dead-end (terminal sink account) or a previously visited node.
  3. Every push, visit, and pop action produces an `AlgorithmStep` containing current stack snapshots and explanations.
- **Banking Use Case:** Tracing long, narrow layering funnels where illicit funds hop through successive intermediary accounts to reach an offshore or cash-out exit point.
- **Complexity:** Time $\mathcal{O}(V + E)$, Space $\mathcal{O}(V)$.

### 7.3 Directed Cycle Detection (3-State Graph Coloring)
- **Source File:** `src/algorithms/cycleDetection.ts`
- **Theoretical Basis:** 3-State Color DFS (White / Gray / Black)
  - `State 0 (UNVISITED / White)`: Node has not yet been explored.
  - `State 1 (VISITING / Gray)`: Node is currently on the active recursion stack (an ancestor in the current DFS path).
  - `State 2 (PROCESSED / Black)`: Node and all of its downstream reachable subtrees have been fully explored.
- **Cycle Proof:**
  - For each unvisited node, a recursive DFS is launched.
  - When traversing an outbound edge $(u, v)$:
    - If $\text{state}[v] == 1$, edge $(u, v)$ is proven to be a **back-edge** to an active ancestor on the recursion stack.
    - **A directed cycle is formally proven.**
    - The exact cycle is reconstructed by back-tracking through the recursion stack from $u$ back to $v$.
    - The circular transaction sequence is indexed, and total circular volume is calculated.
- **Why Simple Boolean Visited is Insufficient:**
  - In a directed graph, encountering a previously visited node does *not* imply a cycle. For example, in a diamond graph ($A \to B \to D$ and $A \to C \to D$), node $D$ is visited twice from distinct paths (cross-edge), but the graph is an acyclic DAG. Only a back-edge to a node currently in `State 1 (VISITING)` constitutes a directed cycle.
- **Banking Use Case:** Detecting round-tripping, fictitious billing loops, wash-trading schemes, and circular tax frauds (VAT carousel fraud).
- **Complexity:** Time $\mathcal{O}(V + E)$, Space $\mathcal{O}(V)$.

### 7.4 Dijkstra’s Shortest Path Algorithm
- **Source File:** `src/algorithms/dijkstra.ts`
- **Data Structure:** Custom Min-Binary Heap `PriorityQueue<string>` (`src/dataStructures/PriorityQueue.ts`)
- **Execution Mechanics:**
  1. Initialize $\text{dist}[\text{source}] = 0$ and $\text{dist}[v] = \infty$ for all $v \neq \text{source}$.
  2. Insert $(\text{source}, 0)$ into the min-heap.
  3. While the priority queue is not empty, extract vertex $u$ with minimum tentative distance $\text{dist}[u]$.
  4. For each outgoing edge $(u, v)$ with weight $w(u, v) = \text{amount}$:
     $$\text{if } \text{dist}[u] + w(u, v) < \text{dist}[v] \implies \text{dist}[v] \leftarrow \text{dist}[u] + w(u, v), \quad \text{parent}[v] \leftarrow u$$
     Insert or decrease-key $(v, \text{dist}[v])$ in the min-heap.
  5. If target is extracted or priority queue is exhausted, terminate.
- **Contrast with BFS Shortest Path:**
  - **BFS Shortest Path:** Finds the route with the **fewest intermediary accounts (minimum hops)**, ignoring monetary transaction sizes.
  - **Dijkstra Shortest Path:** Finds the route with the **lowest cumulative transaction volume (minimum financial friction)**.
- **Banking Use Case:** Tracking the lowest-friction conduit used by money launderers to transfer funds between two entities while evading large-currency reporting thresholds.
- **Complexity:** Time $\mathcal{O}((V + E) \log V)$, Space $\mathcal{O}(V)$.

### 7.5 Tarjan’s Strongly Connected Components (SCC)
- **Source File:** `src/algorithms/stronglyConnectedComponents.ts`
- **Data Structure:** Custom LIFO `Stack<string>`, integer discovery array $\text{disc}[]$, and lowest reachable link array $\text{low}[]$.
- **Execution Mechanics:**
  1. Maintain a global discovery timer. For each unvisited vertex $u$, assign $\text{disc}[u] = \text{low}[u] = ++\text{timer}$, and push $u$ onto the stack.
  2. For each outbound neighbor $v$ of $u$:
     - If $v$ is not yet visited, recursively visit $v$, then update $\text{low}[u] \leftarrow \min(\text{low}[u], \text{low}[v])$.
     - If $v$ is already on the stack, it is a back-edge to an active component; update $\text{low}[u] \leftarrow \min(\text{low}[u], \text{disc}[v])$.
  3. **Root Invariant:** If $\text{low}[u] == \text{disc}[u]$, vertex $u$ is the root of a strongly connected component. All vertices above $u$ on the stack are popped to form the complete SCC.
- **Why Tarjan over Kosaraju?**
  - **Kosaraju's Algorithm:** Requires two complete DFS passes and the computation of the graph transpose $G^T$ (reversing every directed edge).
  - **Tarjan's Algorithm:** Identifies all SCCs in a **single linear DFS pass** without graph inversion, minimizing memory allocations and cache misses.
- **Banking Use Case:** Isolating tightly knit collusion syndicates where every member in the ring can mutually transfer funds to every other member.
- **Complexity:** Time $\mathcal{O}(V + E)$, Space $\mathcal{O}(V)$.

---

## 8. Rule-Based Risk Scoring Methodology

To ensure compliance explainability and prevent uninterpretable black-box AI bias, FraudGraph utilizes a centralized, auditable risk scoring engine configured in `src/config/riskRules.ts` and evaluated in `src/services/riskAnalyzer.ts`.

### Scoring Formula
The overall Risk Score $R(u)$ for account $u$ is calculated deterministically as the sum of triggered rule weights, capped at 100:

$$R(u) = \min\left(100, \sum_{i=1}^{7} W_i \cdot \mathbb{I}(\text{Rule}_i(u))\right)$$

where $\mathbb{I}(\text{Rule}_i(u)) \in \{0, 1\}$ indicates whether account $u$ satisfies the specific topological condition, and $W_i$ is the rule weight.

### Risk Rules & Weights Specification

| Rule ID | Rule Name | Weight | Trigger Condition | Compliance Rationale |
| :--- | :--- | :---: | :--- | :--- |
| **RULE_CYCLE** | Circular Fund Routing | **+30 pts** | Account is a vertex in $\ge 1$ directed cycle detected via 3-state DFS. | Circular transactions have no rational commercial purpose and are classic indicators of round-tripping or tax evasion. |
| **RULE_SCC** | Collusion Ring Membership | **+20 pts** | Account belongs to an SCC with $\ge 3$ mutually connected vertices. | Indicates mutual reciprocity and syndicate collaboration across multiple accounts. |
| **RULE_HIGH_VAL** | High-Value Single Transfer | **+15 pts** | Any single inbound or outbound transfer $\ge ₹150,000$. | Crosses significant currency reporting thresholds, posing elevated financial exposure. |
| **RULE_FAN_OUT** | Rapid Fan-Out Dispersion | **+15 pts** | $\ge 3$ outbound transfers originating within a 60-minute window. | Classic "smurfing" or layering dispersion where large capital is fragmented into multiple streams. |
| **RULE_FAN_IN** | Rapid Fan-In Aggregation | **+15 pts** | $\ge 3$ inbound transfers received within a 60-minute window. | Aggregation of structured deposits from multiple sources into a single consolidation account. |
| **RULE_MULE_RATIO**| Rapid Mule Pass-Through | **+15 pts** | In/Out amount balance within 20% ($\| \text{In} - \text{Out} \| / \text{In} \le 0.20$) and both in/out activity within 120 minutes. | Mule accounts rarely hold capital; they rapidly forward deposits onward, keeping minimal residual balance. |
| **RULE_CHAIN** | Deep Layering Chain | **+10 pts** | Account participates in a linear directed transaction chain of $\ge 4$ hops. | Deep chains are engineered deliberately to lengthen audit trails and exhaust relational database queries. |

### Deterministic Risk Thresholds
- **CRITICAL ($80 - 100$ pts):** Multiple compounding indicators (e.g., cycle + SCC + rapid mule pass-through). Recommended Action: Immediate account restriction, compliance review, and SAR preparation.
- **HIGH ($60 - 79$ pts):** Serious structural anomaly (e.g., cycle + high-value transfer + fan-out). Recommended Action: Enhanced Due Diligence (EDD) and transaction monitoring.
- **MEDIUM ($30 - 59$ pts):** Moderate risk (e.g., circular transfer or mule pass-through alone). Recommended Action: Standard compliance inquiry and source-of-funds verification.
- **LOW ($0 - 29$ pts):** Normal commercial activity with no structural layering patterns. Recommended Action: Routine monitoring.

### Why Explainability is Mandatory in Financial Compliance
1. **Legal Defensibility:** Under international AML guidelines (FATF 40 Recommendations), regulatory authorities require institutions to articulate *why* an account was flagged. A black-box confidence score (e.g., `0.94 probability of fraud`) is legally inadmissible without supporting factual evidence.
2. **Actionable Evidence Dossiers:** FraudGraph produces an explicit breakdown listing every triggered rule, the exact transaction IDs involved, the monetary amounts, and the timestamp deltas.
3. **Audit Trails for Regulators:** Compliance officers can export a complete CSV and printable audit report detailing the mathematical justification for each risk score.

---

## 9. Time and Space Complexity Master Table

Let $V$ represent the total number of bank accounts (vertices) and $E$ represent the total number of financial transactions (directed edges).

| Component / Algorithm | Operation | Time Complexity (Worst-Case) | Auxiliary Space Complexity | Theoretical Invariant / Justification |
| :--- | :--- | :---: | :---: | :--- |
| **Graph Adjacency List** | Add Vertex | $\mathcal{O}(1)$ amortized | $\mathcal{O}(V)$ | Hash map insertion into `Map<string, GraphNode>`. |
| **Graph Adjacency List** | Add Directed Edge | $\mathcal{O}(1)$ amortized | $\mathcal{O}(E)$ | Appending `GraphEdge` to array in `adjacencyList.get(u)`. |
| **Custom Queue** | Enqueue / Dequeue | $\mathcal{O}(1)$ amortized | $\mathcal{O}(V)$ | Head-index pointer tracking avoiding array unshifts. |
| **Custom Stack** | Push / Pop | $\mathcal{O}(1)$ | $\mathcal{O}(V)$ | LIFO array index mutation. |
| **Custom PriorityQueue** | Push / Extract-Min | $\mathcal{O}(\log V)$ | $\mathcal{O}(V)$ | Complete binary tree heap with swim/sink rebalancing. |
| **BFS Exploration** | Full Traversal | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ | Each vertex is enqueued once; each outgoing edge is examined once. |
| **BFS Shortest Path** | Min-Hop Pathfinding | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ | Explores frontiers in strictly increasing hop order. |
| **DFS Exploration** | Chain Depth Traversal | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ | Explores longest branch before backtracking via LIFO stack. |
| **3-State Cycle Detection** | Cycle Identification | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ | Detects back-edges to nodes with `state == 1 (VISITING)`. |
| **Dijkstra Shortest Path** | Min-Cost Pathfinding | $\mathcal{O}((V + E) \log V)$ | $\mathcal{O}(V)$ | Triangle inequality relaxation with min-heap priority queue. |
| **Tarjan's SCC** | Collusion Ring Decomp. | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ | Single-pass DFS comparing low-link values to discovery times. |
| **Risk Scoring Engine** | Multi-Heuristic Analysis | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ | Evaluates linear topological metrics and degree aggregations. |

---

## 10. Installation, Run, and Testing Instructions

### Prerequisites
- **Node.js:** v18.0.0 or higher (tested on Node v20 and v24)
- **npm:** v9.0.0 or higher

### 1. Setup & Installation
```bash
# Clone or navigate into the project workspace
cd "c:\Users\LENOVO\Desktop\FraudGraph"

# Install all required dependencies
npm install
```

### 2. Run Automated Verification Test Suite
FraudGraph includes a comprehensive standalone test script (`verifyDSA.ts`) validating all custom data structures, graph traversals, and risk calculations.
```bash
npm test
```
**Expected Test Output:**
```text
====================================================
FRAUDGRAPH COMPREHENSIVE DSA VERIFICATION SUITE
====================================================

[1/9] Testing Manual Queue (FIFO)...
✓ Queue passed all assertions.

[2/9] Testing Manual Stack (LIFO)...
✓ Stack passed all assertions.

[3/9] Testing Manual Min-Heap Priority Queue...
✓ PriorityQueue passed all assertions.

[4/9] Testing Manual Adjacency List Graph...
✓ Graph data structure passed all assertions.

[5/9] Testing BFS & DFS Traversals...
✓ BFS traversed 21 accounts in 71 discrete steps.
✓ DFS reached depth 5 in 111 discrete steps.

[6/9] Testing 3-State Cycle Detection & Tarjan SCC...
✓ Cycle Detection: Found cycle ACC-ALPHA → ACC-BETA → ACC-GAMMA → ACC-DELTA → ACC-ALPHA (Volume: ₹735800).
✓ Tarjan SCC: Identified component [ACC-DELTA, ACC-GAMMA, ACC-BETA, ACC-ALPHA] with 4 accounts.
✓ Normal commerce graph confirmed 100% acyclic with 0 fraud rings.

[7/9] Testing Dijkstra Shortest Path & Investigation Engine...
✓ Dijkstra found path: ACC-ALPHA → ACC-BETA → ACC-GAMMA → ACC-DELTA with cost ₹553300.
✓ Fraud Ring Analyzer isolated 2 suspicious ring(s) in complex network.
✓ Investigation Report compiled for ACC-ALPHA: Risk Score 55/100 (MEDIUM).

[8/9] Testing BFS Minimum-Hop Shortest Path & Edge Cases...
✓ BFS Shortest Path handles standard routes, identical vertices (0 hops), and disconnected components.

[9/9] Testing CSV Parser Validation & Risk Configuration...
✓ CSV parser successfully validates data integrity and rejects malformed rows.
✓ Centralized risk configuration correctly caps scores and configures heuristics.

====================================================
ALL 9 FRAUDGRAPH DSA & SYSTEM TEST SUITES PASSED!
====================================================
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173/
```

### 4. Build for Production & Preview
```bash
npm run build
npm run preview
```

---

## 11. Walkthrough of Demonstration Scenarios

FraudGraph comes pre-configured with 7 distinct scenarios accessible from the scenario selector in the top navigation bar:

### Scenario 1: Normal Corporate Commerce Network
- **Topology:** Strict Directed Acyclic Graph (DAG) modeling supplier payments, utility disbursements, payroll, and merchant settlements.
- **DSA Results:**
  - Cycle Detection: **0 cycles found**.
  - Tarjan SCC: **0 collusion rings** (all SCCs are trivial singletons).
  - Risk Scores: All accounts evaluate to **LOW Risk ($< 30$)**.
- **Investigative Takeaway:** Proves the algorithm avoids false positives in legitimate commercial transaction environments.

### Scenario 2: 4-Node Circular Laundering Ring
- **Topology:** Closed circular loop: `ACC-ALPHA → ACC-BETA → ACC-GAMMA → ACC-DELTA → ACC-ALPHA`.
- **DSA Results:**
  - 3-State DFS: Detects back-edge `ACC-DELTA → ACC-ALPHA` and reconstructs the cycle. Total circular volume: ₹735,800.
  - Tarjan SCC: Identifies a 4-vertex component.
  - Risk Scores: Elevated to **MEDIUM / HIGH ($55 - 75$)** with explicit evidence: *Cycle Involvement (+30)* and *SCC Membership (+20)*.
- **Investigative Takeaway:** Demonstrates classic wash-trading and circular round-tripping detection.

### Scenario 3: Multiple Interconnected Collusion Rings
- **Topology:** Two separate laundering rings linked by an inter-syndicate bridge edge (`RING1-D → RING2-A`).
- **DSA Results:**
  - Cycle Detection: Discovers both individual circular cycles.
  - Tarjan SCC: Isolates the two distinct components, demonstrating that while Ring 1 can reach Ring 2, Ring 2 cannot reach Ring 1, correctly preserving component boundaries.
- **Investigative Takeaway:** Demonstrates structural ring correlation across syndicated criminal operations.

### Scenario 4: Long Layering Mule Chain
- **Topology:** 5-hop linear chain: `ORIGIN-HEIST → MULE-1 → MULE-2 → MULE-3 → MULE-4 → EXFIL`.
- **DSA Results:**
  - BFS & DFS: Explores complete depth across 5 hops.
  - Shortest Path: Both BFS and Dijkstra identify the exact 5-hop exfiltration path.
  - Risk Scores: `MULE-1` through `MULE-3` trigger *Deep Layering Chain (+10)* and *Rapid Mule Pass-Through (+15)*.
- **Investigative Takeaway:** Proves detection of mule accounts that keep near-zero balances and rapidly forward capital.

### Scenario 5: Rapid Fan-In Structuring (Smurfing Aggregation)
- **Topology:** Multiple distinct source accounts (`SMURF-01`, `SMURF-02`, `SMURF-03`, `SMURF-04`) deposit structured amounts into a single aggregator account (`AGGREGATOR-HQ`) within a short time window.
- **DSA Results:**
  - High in-degree with rapid timestamp clustering.
  - Risk Scores: `AGGREGATOR-HQ` triggers *Rapid Fan-In (+15)*.
- **Investigative Takeaway:** Highlights smurfing techniques used to evade single-transaction currency reporting thresholds.

### Scenario 6: Rapid Fan-Out Dispersion
- **Topology:** A primary source account (`DISPERSAL-SRC`) rapidly disperses large capital into multiple destination accounts (`BENEFICIARY-A`, `BENEFICIARY-B`, `BENEFICIARY-C`) within minutes.
- **DSA Results:**
  - High out-degree with short time intervals.
  - Risk Scores: `DISPERSAL-SRC` triggers *Rapid Fan-Out (+15)*.
- **Investigative Takeaway:** Identifies the dispersal phase of money laundering where funds are divided into micro-streams to sever audit trails.

### Scenario 7: Disconnected Suspicious Subgraph
- **Topology:** A large primary network alongside an isolated 2-node cluster (`ISOLATED-TRUST → ISOLATED-FOUNDATION`) with no connecting edges to the main component.
- **DSA Results:**
  - Shortest Path (Main to Isolated): BFS and Dijkstra cleanly report `isReachable: false`, `hopCount: Infinity`, and cost `Infinity`.
  - Tarjan SCC: Evaluates independent components correctly.
- **Investigative Takeaway:** Validates algorithmic robustness on disconnected components and graph edge cases.

---

## 12. Limitations & Future Enhancements

### Limitations
1. **Client-Side In-Memory Storage:** Graph vertices and edges reside entirely in browser JavaScript memory. Networks exceeding 50,000 accounts should integrate Web Workers or an indexed server-side graph engine to avoid browser thread locking.
2. **Elementary Cycle Enumeration:** To prevent exponential runtime ($\mathcal{O}((V + E) \cdot (C + 1))$) in dense cyclic graphs, cycle detection terminates after extracting primary elementary cycles.
3. **Non-Negative Edge Weights:** Dijkstra’s algorithm requires non-negative transaction values (which holds true for monetary transfers). If negative adjustments or reversals are introduced, the Bellman-Ford algorithm must be used.

### Future Enhancements
- **Dynamic Bipartite Matching:** Integrating the Hopcroft-Karp algorithm to identify synthetic identity theft where multiple accounts share identical tax IDs or phone numbers.
- **Maximum Flow / Minimum Cut:** Implementing Edmonds-Karp or Dinic’s algorithm to determine bottleneck accounts whose removal severs the laundering conduit.
- **Temporal Sliding Windows:** Computing time-decaying edge weights where older transactions exert diminishing influence on current risk scores.

---

## 13. Comprehensive College Viva / Presentation Preparation Guide

This section provides questions and rigorous, examiner-ready answers to prepare students for viva voce examinations and technical defense.

---

### Q1: Why represent bank accounts and transactions as a graph instead of standard relational SQL tables?
**Answer:**  
In a relational database, finding connections between accounts requires SQL `JOIN` operations. Tracing a transaction path across $k$ intermediary accounts requires $k$ self-joins:
```sql
SELECT * FROM transactions t1
JOIN transactions t2 ON t1.receiver = t2.sender
JOIN transactions t3 ON t2.receiver = t3.sender ...
```
This produces an exponential query complexity of $\mathcal{O}(N^k)$, where $N$ is the number of transactions. For $k \ge 4$, queries become computationally prohibitive. Furthermore, relational tables do not inherently model topology; detecting closed loops (cycles) or strongly connected clusters requires recursive common table expressions (CTEs) that are slow and complex. In a graph adjacency list, each node directly points to its neighbors. Traversing an edge takes $\mathcal{O}(1)$ time, reducing multi-hop traversal to linear $\mathcal{O}(V + E)$ complexity.

---

### Q2: Why did you choose an Adjacency List over an Adjacency Matrix?
**Answer:**  
Financial transaction networks are **sparse graphs**. In real banking systems, each account transacts with only a handful of other accounts; the average degree is negligible compared to total accounts ($\bar{d} \ll V$).
1. **Space:** An Adjacency Matrix requires $\mathcal{O}(V^2)$ memory. For $100,000$ accounts, a matrix requires $10^{10}$ cells ($>40\text{ GB}$ of RAM), 99.99% of which are zeroes. An Adjacency List requires $\mathcal{O}(V + E)$ memory, storing only actual transactions.
2. **Neighbor Iteration:** To find the outgoing transactions from account $u$, an Adjacency Matrix requires scanning all $V$ columns ($\mathcal{O}(V)$). An Adjacency List inspects only the actual outgoing edges of $u$ ($\mathcal{O}(\text{deg}(u))$).
3. **Multigraph Support:** Bank accounts often have multiple transactions between the same pair. An Adjacency List stores parallel edges naturally in an array; an Adjacency Matrix cannot store multiple edges without nested lists per cell.

---

### Q3: How does your 3-State Cycle Detection algorithm work, and why is a simple boolean `visited` flag insufficient for directed graphs?
**Answer:**  
In directed graphs, an account being reached twice does *not* necessarily mean a cycle exists. In a "diamond" topology ($A \to B \to D$ and $A \to C \to D$), account $D$ is visited twice through different paths (a cross-edge), but the graph is an acyclic DAG.

To detect true directed cycles, we use **3-State Graph Coloring**:
- `State 0 (UNVISITED)`: Node has not been encountered.
- `State 1 (VISITING)`: Node is currently on the active DFS recursion stack (an ancestor in the current branch).
- `State 2 (PROCESSED)`: Node and all of its outgoing branches have been fully explored.

A directed cycle is proven if and only if during DFS we encounter an edge $(u, v)$ where $\text{state}[v] == 1$. This proves that $v$ is an active ancestor on the recursion stack, meaning edge $(u, v)$ is a **back-edge** completing a closed directed loop.

---

### Q4: What is the computational difference between BFS and Dijkstra for shortest path analysis?
**Answer:**  
- **BFS Shortest Path:** Operates on **unweighted graphs** (where every edge has an equal weight of 1). It explores the graph layer-by-layer using a FIFO queue. The first time the destination vertex is reached, the recovered path is mathematically guaranteed to have the **minimum number of edges (hops)** in $\mathcal{O}(V + E)$ time.
- **Dijkstra’s Algorithm:** Operates on **weighted graphs** with non-negative edge weights (in our system, monetary transaction amounts). It uses a Min-Binary Heap (`PriorityQueue`) to greedily select the vertex with the lowest accumulated cost, performing edge relaxation:
  $$\text{dist}[v] = \min(\text{dist}[v], \text{dist}[u] + w(u, v))$$
  Dijkstra finds the path with the **lowest cumulative financial volume (minimum financial friction)** in $\mathcal{O}((V + E) \log V)$ time.

In our system, investigators can toggle between both: BFS reveals the path with the fewest intermediaries, while Dijkstra reveals the lowest-value transfer path.

---

### Q5: Why did you implement Tarjan’s algorithm for Strongly Connected Components instead of Kosaraju’s algorithm?
**Answer:**  
Both Tarjan’s and Kosaraju’s algorithms have an asymptotic time complexity of $\mathcal{O}(V + E)$. However:
- **Kosaraju’s Algorithm:** Requires **two complete DFS passes**: the first pass computes a finish-time order, then the algorithm transposes the entire graph $G^T$ (reversing every directed edge), and a second DFS pass is performed on $G^T$.
- **Tarjan’s Algorithm:** Requires only **a single DFS pass**. It maintains a DFS discovery number (`disc[u]`) and a low-link value (`low[u]`, representing the earliest reachable ancestor) along with a stack. When $\text{low}[u] == \text{disc}[u]$, vertex $u$ is immediately recognized as the root of an SCC, and the entire component is popped from the stack.

Tarjan’s algorithm avoids the overhead of inverting all graph edges into a transpose graph, making it significantly more memory-efficient and faster in practice.

---

### Q6: Can cycle detection prove financial fraud or money laundering in a court of law?
**Answer:**  
**No.** Graph cycle detection identifies a **topological anomaly**, not legal intent or criminal guilt. 

In legitimate commercial trade, directed cycles frequently occur for lawful business reasons:
- A customer pays a merchant, the merchant pays a distributor, and the distributor issues a supplier refund back to the customer.
- In supply-chain netting, corporate entities settle mutual balances through escrow or multilateral debt reconciliation.

Therefore, FraudGraph treats cycles as **risk indicators** to prioritize investigator workloads and trigger Enhanced Due Diligence (EDD). A compliance officer uses the cycle evidence alongside customer KYC records, tax filings, and invoices before making any formal regulatory determination or filing a Suspicious Activity Report (SAR).

---

### Q7: How does your system handle disconnected graphs or unreachable routes?
**Answer:**  
In both BFS and Dijkstra shortest path implementations:
1. All vertices initially have distances set to $\infty$ (`Infinity`) and parent pointers set to `null`.
2. If the source and target are in distinct, disconnected components, the traversal will exhaust all reachable nodes without ever reaching the target.
3. The algorithms explicitly check for this condition and return:
   - `isReachable: false`
   - `path: []`
   - `distance: Infinity`
   - `hopCount: Infinity`
4. The UI captures this state cleanly, alerting the investigator that no directed transaction conduit exists between the selected accounts.

---

### Q8: How would you scale this architecture to handle millions or billions of transactions?
**Answer:**  
While FraudGraph's client-side in-memory architecture is designed for responsive visualization and academic evaluation up to 50,000 edges, scaling to enterprise banking volumes (billions of transactions) would involve:
1. **Distributed Graph Processing:** Replacing the in-memory JavaScript `Map` with a distributed graph framework such as Apache Spark GraphX or Apache TinkerPop/JanusGraph.
2. **Graph Partitioning:** Using vertex-cut or edge-cut partitioning algorithms to distribute the graph across a cluster of nodes.
3. **Temporal Sliding Windows:** Tracing cycles only within localized sliding time windows (e.g., transactions occurring within 48 to 72 hours of each other), since launderers execute circular flows within tight temporal horizons.
4. **Graph Databases:** Employing specialized graph database engines (e.g., Neo4j, Amazon Neptune) with indexed adjacency lists for sub-second neighborhood lookups.

---

### Q9: Why use an explainable rule-based scoring engine instead of a machine learning classifier?
**Answer:**  
In financial compliance and regulatory law (FATF, AMLD5, Bank Secrecy Act):
1. **Right to Explanation:** Regulatory authorities mandate that financial institutions provide an auditable rationale when freezing customer assets or submitting a SAR.
2. **Black-Box Liabilities:** Deep learning models and Graph Neural Networks (GNNs) provide statistical probabilities without human-interpretable reasoning, introducing legal liability and potential discriminatory bias.
3. **Zero Cold-Start Dependency:** Supervised ML models require vast quantities of labeled historical fraud data (which banks cannot freely share due to privacy laws). Rule-based graph scoring works deterministically on day one without training data.
4. **Audit Trail:** FraudGraph provides an exact additive point breakdown for every risk score (e.g., `+30 Cycle`, `+15 High Value`, `+15 Fan-Out`), allowing investigators to verify the underlying transactions.

---

## 14. Academic Integrity & Project Summary

This project was built to demonstrate mastery of classical Data Structures & Algorithms, discrete mathematics, and professional software engineering principles:
- **Zero Third-Party Algorithmic Libraries:** All graph engines, FIFO queues, LIFO stacks, binary min-heaps, traversals, cycle detectors, and component analyzers were designed and coded by hand.
- **Strict Typing:** All data structures are fully typed with generic parameters in strict TypeScript.
- **Reproducible Verification:** The included 9-suite automated verification harness (`npm test`) provides independent confirmation that all algorithmic invariants hold true.

---

*FraudGraph — Explainable Transaction Fraud Investigation System*  
*Developed for College Data Structures & Algorithms (DSA) Microproject Evaluation.*
