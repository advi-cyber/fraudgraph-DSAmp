import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Eye, ShieldAlert, Sparkles } from 'lucide-react';

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onResetLayout: () => void;
  onResetHighlights?: () => void;
  filterCyclesOnly?: boolean;
  onToggleFilterCycles?: () => void;
  cycleCount?: number;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetLayout,
  onResetHighlights,
  filterCyclesOnly = false,
  onToggleFilterCycles,
  cycleCount = 0,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-md select-none">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer border border-slate-700"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer border border-slate-700"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={onFitView}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer border border-slate-700"
          title="Fit View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={onResetLayout}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer border border-slate-700"
          title="Center Network"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {onResetHighlights && (
          <button
            onClick={onResetHighlights}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 text-xs font-mono font-medium transition-colors cursor-pointer border border-slate-700"
            title="Clear Traversal & Cycle Highlights"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Highlights</span>
          </button>
        )}
      </div>

      {/* Cycle Filter Toggle */}
      {onToggleFilterCycles && (
        <button
          onClick={onToggleFilterCycles}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            filterCyclesOnly
              ? 'bg-rose-900/80 text-rose-300 border border-rose-600'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Isolate Cycles ({cycleCount})</span>
        </button>
      )}

      {/* Color Legend */}
      <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-slate-400 px-2 py-1 bg-slate-950/60 rounded-lg border border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>Active Frontier</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span>Cyclic Edge</span>
        </div>
      </div>
    </div>
  );
};
