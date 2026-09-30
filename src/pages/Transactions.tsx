import React, { useState } from 'react';
import { Transaction } from '../types/transaction';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionForm } from '../components/TransactionForm';
import { ReceiptText, ArrowUpRight, ArrowDownLeft, ShieldAlert } from 'lucide-react';
import { formatINR } from '../utils/currency';

interface TransactionsPageProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'> & { id?: string }) => void;
  onDeleteTransaction: (id: string) => void;
  existingAccounts: string[];
  cycleEdgeIds?: string[];
}

export const Transactions: React.FC<TransactionsPageProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  existingAccounts,
  cycleEdgeIds = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const flaggedCount = transactions.filter(
    (t) => t.status === 'FLAGGED' || cycleEdgeIds.includes(t.id)
  ).length;

  return (
    <div className="space-y-5">
      {/* Top Banner & Quick Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono tracking-wide text-slate-100">
              TRANSACTION LEDGER & DIRECTED EDGE MANAGEMENT
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time transaction record. Adding or deleting a transaction modifies the directed weighted adjacency list dynamically.
          </p>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Total Volume:</span>
            <span className="text-emerald-400 font-bold text-sm">{formatINR(totalVolume)}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Flagged Edges:</span>
            <span className="text-rose-400 font-bold text-sm">{flaggedCount}</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 cursor-pointer"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Main Table */}
      <TransactionTable
        transactions={transactions}
        onDeleteTransaction={onDeleteTransaction}
        onOpenAddModal={() => setIsModalOpen(true)}
        cycleEdgeIds={cycleEdgeIds}
      />

      {/* Add Modal */}
      <TransactionForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onAddTransaction}
        existingAccounts={existingAccounts}
      />
    </div>
  );
};
