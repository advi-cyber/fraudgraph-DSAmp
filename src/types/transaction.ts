export interface Transaction {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  timestamp: string;
  description?: string;
  type?: 'WIRE' | 'TRANSFER' | 'ATM' | 'MERCHANT' | 'PAYROLL' | 'INTERNAL';
  status?: 'COMPLETED' | 'FLAGGED' | 'INVESTIGATED';
}

export interface TransactionFilter {
  searchQuery: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  account?: string;
  flaggedOnly?: boolean;
}
