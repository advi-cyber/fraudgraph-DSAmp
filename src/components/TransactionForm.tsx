import React, { useState } from 'react';
import { PlusCircle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Transaction } from '../types/transaction';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tx: Omit<Transaction, 'id'> & { id?: string }) => void;
  existingAccounts: string[];
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingAccounts,
}) => {
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<Transaction['type']>('TRANSFER');
  const [description, setDescription] = useState('');
  const [customId, setCustomId] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanSender = sender.trim().toUpperCase();
    const cleanReceiver = receiver.trim().toUpperCase();
    const numericAmount = parseFloat(amount);

    if (!cleanSender || !cleanReceiver) {
      setError('Both Sender and Receiver accounts are strictly required.');
      return;
    }

    if (cleanSender === cleanReceiver) {
      setError('Self-transfers to the exact same account are not permitted.');
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Transaction amount must be a positive number greater than zero.');
      return;
    }

    onSubmit({
      id: customId.trim() || undefined,
      sender: cleanSender,
      receiver: cleanReceiver,
      amount: numericAmount,
      timestamp: new Date().toISOString(),
      type: txType,
      description: description.trim() || 'Manual Graph Insertion',
      status: 'COMPLETED',
    });

    // Reset fields & close
    setSender('');
    setReceiver('');
    setAmount('');
    setDescription('');
    setCustomId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-100 font-mono tracking-wide">
              DISPATCH DIRECTED TRANSACTION
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 font-mono">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Sender Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300">
                Sender Account <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                list="existing-senders"
                placeholder="e.g. ACC-ALPHA"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                required
              />
              <datalist id="existing-senders">
                {existingAccounts.map((acc) => (
                  <option key={acc} value={acc} />
                ))}
              </datalist>
            </div>

            {/* Receiver Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300">
                Receiver Account <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                list="existing-receivers"
                placeholder="e.g. ACC-BETA"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                required
              />
              <datalist id="existing-receivers">
                {existingAccounts.map((acc) => (
                  <option key={acc} value={acc} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300">
                Amount (₹ INR) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="e.g. 185000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                required
              />
            </div>

            {/* Transaction Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300">
                Channel / Classification
              </label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="TRANSFER">P2P Electronic Transfer</option>
                <option value="WIRE">RTGS / International Wire</option>
                <option value="PAYROLL">Corporate Payroll</option>
                <option value="MERCHANT">Merchant Settlement</option>
                <option value="ATM">ATM Cash Withdrawal</option>
              </select>
            </div>
          </div>

          {/* Description & Optional Custom ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300">
              Purpose / Reference Note
            </label>
            <input
              type="text"
              placeholder="e.g. Technical Services Retainer Fee"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
            />
          </div>

          {/* Academic note */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 font-mono">
            Adding this transaction will auto-create missing nodes, insert a directed edge with weight = amount, and dynamically re-evaluate graph topological invariants.
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
            >
              Insert Directed Edge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
