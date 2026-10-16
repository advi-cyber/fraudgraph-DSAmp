import { Transaction } from './transaction';
import { Graph } from '../dataStructures/Graph';
import { GraphStats } from './graph';
import { LayoutPosition } from '../utils/graphLayout';

export type DatasetCategory =
  | 'NORMAL'
  | 'CYCLE'
  | 'RINGS'
  | 'CHAIN'
  | 'COMPLEX'
  | 'STRUCTURING'
  | 'DISPERSION'
  | 'PASS_THROUGH'
  | 'DISCONNECTED'
  | 'CUSTOM';

export interface DatasetMetadata {
  accountCount: number;
  transactionCount: number;
  totalVolume: number;
  hasCycles: boolean;
  expectedCycles: number;
  expectedSCCs: number;
}

export interface ValidationDiagnostic {
  type: 'ERROR' | 'WARNING';
  code: string;
  message: string;
  recordId?: string;
}

export interface DatasetValidationResult {
  isValid: boolean;
  errors: ValidationDiagnostic[];
  warnings: ValidationDiagnostic[];
  accountCount: number;
  transactionCount: number;
}

export interface DatasetDefinition {
  id: string;
  name: string;
  description: string;
  category: DatasetCategory;
  recommendedStartNode: string;
  recommendedTargetNode?: string;
  expectedCycles: number;
  expectedSCCs: number;
  transactions: Transaction[];
  isolatedNodes?: string[];
}

export interface ApplicationSnapshot {
  datasetId: string;
  datasetName: string;
  description: string;
  category: DatasetCategory;
  recommendedStartNode: string;
  recommendedTargetNode?: string;
  graph: Graph;
  transactions: Transaction[];
  allNodeIds: string[];
  stats: GraphStats;
  layout: Map<string, LayoutPosition>;
  validation: DatasetValidationResult;
  timestamp: string;
}
