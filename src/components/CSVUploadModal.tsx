import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, AlertTriangle, Download, X } from 'lucide-react';
import { parseTransactionCSV, generateSampleCSVTemplate, CSVParseResult } from '../utils/csvParser';
import { Transaction } from '../types/transaction';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Transaction[]) => void;
}

export const CSVUploadModal: React.FC<CSVUploadModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      const res = parseTransactionCSV(content);
      setParseResult(res);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text: string) => {
    setCsvText(text);
    if (text.trim().length > 0) {
      const res = parseTransactionCSV(text);
      setParseResult(res);
    } else {
      setParseResult(null);
    }
  };

  const handleLoadSample = () => {
    const sample = generateSampleCSVTemplate();
    setFileName('sample_financial_transactions.csv');
    setCsvText(sample);
    const res = parseTransactionCSV(sample);
    setParseResult(res);
  };

  const handleApply = () => {
    if (parseResult && parseResult.success && parseResult.transactions.length > 0) {
      onImport(parseResult.transactions);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Import Transactions from CSV
              </h3>
              <p className="text-xs text-slate-500">
                Supply transaction rows (sender, receiver, amount, timestamp) to build graph.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-slate-700 cursor-pointer transition-colors shadow-xs">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Choose CSV File</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {fileName && <span className="text-slate-700 truncate max-w-xs">{fileName}</span>}
            </div>

            <button
              onClick={handleLoadSample}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer transition-colors font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Load Synthetic Demo Template</span>
            </button>
          </div>

          {/* Paste CSV Content */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 block">
              Or Paste CSV Content Directly:
            </label>
            <textarea
              value={csvText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="id,sender,receiver,amount,timestamp,description,type&#10;TX101,ACC-ALPHA,ACC-BETA,150000,2026-09-01T10:00:00Z,Layering Step,WIRE"
              rows={8}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Validation Feedback */}
          {parseResult && (
            <div className="space-y-2">
              {parseResult.errors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-700">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>CSV Validation Failed ({parseResult.errors.length} error(s)):</span>
                  </div>
                  <ul className="list-disc list-inside text-rose-700/90 text-[11px] space-y-0.5">
                    {parseResult.errors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {parseResult.errors.length > 5 && (
                      <li>...and {parseResult.errors.length - 5} more error(s)</li>
                    )}
                  </ul>
                </div>
              )}

              {parseResult.warnings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Warnings ({parseResult.warnings.length}):</span>
                  </div>
                  <ul className="list-disc list-inside text-amber-800/90 text-[11px] space-y-0.5">
                    {parseResult.warnings.slice(0, 3).map((warn, idx) => (
                      <li key={idx}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {parseResult.success && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Successfully validated {parseResult.transactions.length} transactions across{' '}
                      {new Set(parseResult.transactions.flatMap((t) => [t.sender, t.receiver])).size}{' '}
                      unique accounts.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            CSV must include columns: <code className="text-slate-700">sender, receiver, amount</code>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!parseResult || !parseResult.success || parseResult.transactions.length === 0}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                parseResult && parseResult.success && parseResult.transactions.length > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import & Rebuild Graph</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
