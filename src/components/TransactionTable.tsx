import React, { useState, useMemo } from 'react';
import { Search, Trash2, Filter, ArrowUpDown, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Transaction } from '../types/transaction';
import { formatINR } from '../utils/currency';
import { formatTimestamp } from '../utils/date';

interface TransactionTableProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
  cycleEdgeIds?: string[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onDeleteTransaction,
  onOpenAddModal,
  cycleEdgeIds = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [minAmount, setMinAmount] = useState<string>('');
  const [flaggedOnly, setFlaggedOnly] = useState<boolean>(false);
  const [sortField, setSortField] = useState<'timestamp' | 'amount'>('timestamp');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search filter
        const matchSearch =
          searchTerm === '' ||
          tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase()));

        // Type filter
        const matchType = filterType === 'ALL' || tx.type === filterType;

        // Min amount
        const matchAmount = minAmount === '' || tx.amount >= parseFloat(minAmount);

        // Flagged only (part of cycle or status FLAGGED)
        const isPartCycle = cycleEdgeIds.includes(tx.id);
        const matchFlagged = !flaggedOnly || tx.status === 'FLAGGED' || isPartCycle;

        return matchSearch && matchType && matchAmount && matchFlagged;
      })
      .sort((a, b) => {
        if (sortField === 'amount') {
          return sortAsc ? a.amount - b.amount : b.amount - a.amount;
        } else {
          return sortAsc
            ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
      });
  }, [transactions, searchTerm, filterType, minAmount, flaggedOnly, sortField, sortAsc, cycleEdgeIds]);

  const toggleSort = (field: 'timestamp' | 'amount') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg select-none space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search by TxID, Sender, Receiver, or Description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none w-full font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Channels</option>
            <option value="TRANSFER">P2P Transfer</option>
            <option value="WIRE">Wire / RTGS</option>
            <option value="PAYROLL">Payroll</option>
            <option value="MERCHANT">Merchant</option>
            <option value="ATM">ATM Cash</option>
          </select>

          <input
            type="number"
            placeholder="Min ₹ Amount"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="w-28 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none placeholder:text-slate-600"
          />

          <button
            onClick={() => setFlaggedOnly(!flaggedOnly)}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              flaggedOnly
                ? 'bg-rose-950/80 text-rose-300 border-rose-600'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Flagged Only</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer shadow-md shadow-cyan-600/20"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider sticky top-0">
            <tr>
              <th className="py-2.5 px-4">Tx ID</th>
              <th className="py-2.5 px-4">Directed Edge (Sender → Receiver)</th>
              <th
                className="py-2.5 px-4 cursor-pointer hover:text-cyan-400"
                onClick={() => toggleSort('amount')}
              >
                <div className="flex items-center gap-1">
                  <span>Amount (Weight)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-2.5 px-4 cursor-pointer hover:text-cyan-400"
                onClick={() => toggleSort('timestamp')}
              >
                <div className="flex items-center gap-1">
                  <span>Timestamp</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-4">Channel / Status</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 text-slate-300">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => {
                const isCycle = cycleEdgeIds.includes(tx.id);
                const isFlagged = isCycle || tx.status === 'FLAGGED';

                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      isFlagged ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3 px-4 font-bold text-slate-200">
                      <div className="flex items-center gap-2">
                        {isFlagged ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        )}
                        <span>{tx.id}</span>
                      </div>
                    </td>

                    {/* Sender -> Receiver */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200 font-semibold">
                          {tx.sender}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200 font-semibold">
                          {tx.receiver}
                        </span>
                      </div>
                      {tx.description && (
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5 truncate max-w-xs">
                          {tx.description}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 font-bold text-slate-100">
                      <span className={isFlagged ? 'text-rose-400' : 'text-emerald-400'}>
                        {formatINR(tx.amount)}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {formatTimestamp(tx.timestamp)}
                    </td>

                    {/* Status & Channel */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {tx.type || 'TRANSFER'}
                        </span>
                        {isFlagged && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                            {isCycle ? 'CYCLE' : 'FLAGGED'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Delete action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1.5 rounded hover:bg-rose-950 hover:text-rose-400 text-slate-500 transition-colors cursor-pointer"
                        title="Delete Transaction & Remove Edge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                  No transactions match the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>
          Showing {filteredTransactions.length} of {transactions.length} total transaction edges
        </span>
        <span>Graph Adjacency List synced dynamically</span>
      </div>
    </div>
  );
};
