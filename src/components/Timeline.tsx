import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { Transaction } from '../types/transaction';
import { sortTransactionsByDate, formatTimestamp, formatShortDate } from '../utils/date';
import { buildGraphFromTransactions } from '../services/graphBuilder';
import { detectDirectedCycles } from '../algorithms/cycleDetection';
import { formatINR } from '../utils/currency';

interface TimelineProps {
  transactions: Transaction[];
  onTransactionsChange: (activeTransactions: Transaction[]) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ transactions, onTransactionsChange }) => {
  const sortedTxs = useMemo(() => sortTransactionsByDate(transactions), [transactions]);
  const [currentIndex, setCurrentIndex] = useState<number>(() => Math.max(0, sortedTxs.length - 1));
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playbackSpeed = 1000; // 1s per transaction

  const timerRef = useRef<number | null>(null);

  // Sync index if transactions length changes
  const prevLenRef = useRef(sortedTxs.length);
  useEffect(() => {
    if (sortedTxs.length !== prevLenRef.current) {
      prevLenRef.current = sortedTxs.length;
      setCurrentIndex(sortedTxs.length - 1);
    }
  }, [sortedTxs.length]);

  // Compute active transactions subset
  const activeSubset = useMemo(() => {
    return sortedTxs.slice(0, currentIndex + 1);
  }, [sortedTxs, currentIndex]);

  // Notify parent of slice update
  useEffect(() => {
    onTransactionsChange(activeSubset);
  }, [activeSubset, onTransactionsChange]);

  // Detect when the first cycle emerges across history
  const cycleEmergence = useMemo(() => {
    let firstCycleIndex = -1;
    let firstCycleTx: Transaction | null = null;
    let cycleDescription = '';

    for (let i = 1; i < sortedTxs.length; i++) {
      const slice = sortedTxs.slice(0, i + 1);
      const subGraph = buildGraphFromTransactions(slice);
      const res = detectDirectedCycles(subGraph);

      if (res.hasCycle) {
        firstCycleIndex = i;
        firstCycleTx = sortedTxs[i];
        cycleDescription = res.cycles[0].pathDescription;
        break;
      }
    }

    return {
      firstCycleIndex,
      firstCycleTx,
      cycleDescription,
      hasEmergence: firstCycleIndex !== -1,
      isCurrentlyEmerged: firstCycleIndex !== -1 && currentIndex >= firstCycleIndex,
    };
  }, [sortedTxs, currentIndex]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= sortedTxs.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playbackSpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, sortedTxs.length]);

  const handlePlayToggle = () => {
    if (currentIndex >= sortedTxs.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleJumpToEnd = () => {
    setIsPlaying(false);
    setCurrentIndex(sortedTxs.length - 1);
  };

  const currentTx = sortedTxs[currentIndex];

  return (
    <div className="bg-white border border-slate-800 rounded-xl p-5 shadow-xs select-none space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-100">
              Chronological Transaction Timeline Replay
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Step through historical transaction events to observe when topological cycles and rings first emerge.
            </p>
          </div>
        </div>

        {/* Stepper controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex <= 0}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30 cursor-pointer"
              title="Previous Transaction"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handlePlayToggle}
              className="p-1.5 rounded bg-amber-950 text-amber-400 border border-amber-800 hover:bg-amber-900/40 cursor-pointer"
              title={isPlaying ? 'Pause Replay' : 'Play Timeline'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(sortedTxs.length - 1, prev + 1))}
              disabled={currentIndex >= sortedTxs.length - 1}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30 cursor-pointer"
              title="Next Transaction"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 cursor-pointer ml-1"
              title="Reset to Beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleJumpToEnd}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-50 hover:bg-slate-100 text-slate-300 hover:text-slate-100 border border-slate-700 cursor-pointer"
          >
            Jump to Present
          </button>
        </div>
      </div>

      {/* Emergence Warning Banner */}
      {cycleEmergence.isCurrentlyEmerged && cycleEmergence.firstCycleTx && (
        <div className="p-3 rounded-lg bg-rose-950 border border-rose-500 text-rose-200 text-xs flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider block font-mono text-rose-400">
                POTENTIAL CYCLE EMERGED AFTER TRANSACTION {cycleEmergence.firstCycleTx.id}!
              </span>
              <span className="text-[11px] text-rose-300 font-mono">
                Edge: {cycleEmergence.firstCycleTx.sender} → {cycleEmergence.firstCycleTx.receiver} ({formatINR(cycleEmergence.firstCycleTx.amount)}) · Path: {cycleEmergence.cycleDescription}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-rose-900 border border-rose-700 font-bold shrink-0 text-white">
            T+{cycleEmergence.firstCycleIndex + 1} Event
          </span>
        </div>
      )}

      {/* Slider Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            Timeline Progress: <strong className="text-slate-100">{currentIndex + 1}</strong> / {sortedTxs.length} Transactions
          </span>
          {currentTx && (
            <span className="text-cyan-400 font-semibold">
              Current Time: {formatTimestamp(currentTx.timestamp)}
            </span>
          )}
        </div>

        <input
          type="range"
          min="0"
          max={sortedTxs.length - 1}
          value={currentIndex}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentIndex(Number(e.target.value));
          }}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />

        {/* Ticks representation */}
        <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
          <span>Start: {sortedTxs[0] ? formatShortDate(sortedTxs[0].timestamp) : 'N/A'}</span>
          {cycleEmergence.hasEmergence && (
            <span className="text-rose-500 font-bold">
              ● Cycle Emerged @ Tx #{cycleEmergence.firstCycleIndex + 1}
            </span>
          )}
          <span>End: {sortedTxs[sortedTxs.length - 1] ? formatShortDate(sortedTxs[sortedTxs.length - 1].timestamp) : 'N/A'}</span>
        </div>
      </div>

      {/* Current Transaction Detail Card */}
      {currentTx && (
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-700 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-white border border-slate-700 font-bold text-amber-500">
              {currentTx.id}
            </span>
            <div className="flex items-center gap-1.5 text-slate-100">
              <span className="font-semibold">{currentTx.sender}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">{currentTx.receiver}</span>
            </div>
            <span className="text-emerald-500 font-bold">{formatINR(currentTx.amount)}</span>
          </div>

          <div className="text-[11px] text-slate-400 truncate max-w-sm font-sans">
            "{currentTx.description || 'Electronic Settlement Transfer'}"
          </div>
        </div>
      )}
    </div>
  );
};
