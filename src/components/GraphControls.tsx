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
    <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-white border border-slate-700 rounded-xl shadow-md select-none">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer border border-slate-700"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer border border-slate-700"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={onFitView}
          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer border border-slate-700"
          title="Fit View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={onResetLayout}
          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer border border-slate-700"
          title="Center Network"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {onResetHighlights && (
          <button
            onClick={onResetHighlights}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-300 hover:text-slate-100 text-xs font-mono font-medium transition-colors cursor-pointer border border-slate-700"
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
              ? 'bg-rose-950 text-rose-400 border border-rose-800'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-300 border border-slate-700'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Isolate Cycles ({cycleCount})</span>
        </button>
      )}

      {/* Color Legend */}
      <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-slate-400 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>Frontier</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span>Cycle</span>
        </div>
      </div>
    </div>
  );
};
