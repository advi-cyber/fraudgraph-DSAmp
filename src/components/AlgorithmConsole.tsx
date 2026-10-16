import React from 'react';
import { Terminal, ListFilter, Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import { AlgorithmStep } from '../types/algorithm';
import { ALGORITHM_COMPLEXITIES } from '../utils/complexity';

interface AlgorithmConsoleProps {
  steps: AlgorithmStep[];
  currentStepIndex: number;
  currentStep: AlgorithmStep | null;
  isPlaying: boolean;
  playbackSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onJumpToStep: (index: number) => void;
  onSpeedChange: (speed: number) => void;
}

export const AlgorithmConsole: React.FC<AlgorithmConsoleProps> = ({
  steps,
  currentStepIndex,
  currentStep,
  isPlaying,
  playbackSpeed,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  onJumpToStep,
  onSpeedChange,
}) => {
  if (steps.length === 0) {
    return (
      <div className="bg-white border border-slate-800 rounded-xl p-5 shadow-xs select-none">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs font-mono font-semibold text-slate-400">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>ALGORITHM EXECUTION CONSOLE</span>
        </div>
        <div className="py-8 text-center text-xs font-mono text-slate-400">
          No algorithm currently active. Select an algorithm from the control panel to view live DSA step execution.
        </div>
      </div>
    );
  }

  const algoKey = currentStep?.algorithmName || 'BFS';
  const complexityInfo = ALGORITHM_COMPLEXITIES[algoKey];

  return (
    <div className="bg-white border border-slate-800 rounded-xl p-5 shadow-xs select-none space-y-4">
      {/* Console Header & Stepper Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 font-mono">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
            {algoKey} LIVE EXECUTION
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>

        {/* Playback Button Group */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-700 font-mono text-xs">
          <button
            onClick={onPrev}
            disabled={currentStepIndex <= 0}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-100 disabled:opacity-30 cursor-pointer"
            title="Previous Step"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {isPlaying ? (
            <button
              onClick={onPause}
              className="p-1.5 rounded bg-amber-950 text-amber-400 border border-amber-800 hover:bg-amber-900/40 cursor-pointer"
              title="Pause"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onPlay}
              disabled={currentStepIndex >= steps.length - 1}
              className="p-1.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 hover:bg-cyan-900/40 disabled:opacity-30 cursor-pointer"
              title="Play"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onNext}
            disabled={currentStepIndex >= steps.length - 1}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-100 disabled:opacity-30 cursor-pointer"
            title="Next Step"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onReset}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-100 cursor-pointer ml-1"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span>Speed:</span>
          <input
            type="range"
            min="200"
            max="1500"
            step="100"
            value={1700 - playbackSpeed}
            onChange={(e) => onSpeedChange(1700 - Number(e.target.value))}
            className="w-18 accent-cyan-400 cursor-pointer"
          />
          <span className="w-10 text-right font-bold text-slate-300">{((1800 - playbackSpeed) / 1000).toFixed(1)}x</span>
        </div>
      </div>

      {/* Real-time DSA State Snapshot */}
      {currentStep && (
        <div className="space-y-3 font-mono">
          {/* Current Action & Narrative */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800">
                ACTION: {currentStep.action}
              </span>
              {currentStep.currentNode && (
                <span className="text-[11px] text-slate-400">
                  Active Node:{' '}
                  <span className="text-amber-500 font-bold">[{currentStep.currentNode}]</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {currentStep.description}
            </p>
          </div>

          {/* Queue / Stack State Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Queue State (for BFS) */}
            {currentStep.queueState !== undefined && (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-700 min-h-[64px]">
                <span className="text-[10px] uppercase text-slate-400 block mb-1">
                  FIFO Queue [Front → Back] ({currentStep.queueState.length}):
                </span>
                <div className="flex flex-wrap items-center gap-1 min-h-[24px]">
                  {currentStep.queueState.length > 0 ? (
                    currentStep.queueState.map((node, i) => (
                      <span
                        key={i}
                        className={`px-1.5 py-0.5 rounded text-[11px] border ${
                          i === 0
                            ? 'bg-amber-950 text-amber-400 border-amber-800 font-bold'
                            : 'bg-white text-slate-200 border-slate-700'
                        }`}
                      >
                        {node}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-[11px]">Empty Queue</span>
                  )}
                </div>
              </div>
            )}

            {/* Stack State (for DFS / SCC) */}
            {currentStep.stackState !== undefined && (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-700 min-h-[64px]">
                <span className="text-[10px] uppercase text-slate-400 block mb-1">
                  LIFO Call Stack [Top → Bottom] ({currentStep.stackState.length}):
                </span>
                <div className="flex flex-wrap items-center gap-1 min-h-[24px]">
                  {currentStep.stackState.length > 0 ? (
                    currentStep.stackState.map((node, i) => (
                      <span
                        key={i}
                        className={`px-1.5 py-0.5 rounded text-[11px] border ${
                          i === 0
                            ? 'bg-cyan-950 text-cyan-400 border-cyan-800 font-bold'
                            : 'bg-white text-slate-200 border-slate-700'
                        }`}
                      >
                        {node}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-[11px]">Empty Stack</span>
                  )}
                </div>
              </div>
            )}

            {/* Visited Set */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-700 min-h-[64px]">
              <span className="text-[10px] uppercase text-slate-400 block mb-1">
                Visited Nodes Set ({currentStep.visitedNodes.length}):
              </span>
              <div className="flex flex-wrap items-center gap-1 max-h-16 overflow-y-auto">
                {currentStep.visitedNodes.length > 0 ? (
                  currentStep.visitedNodes.map((node, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-white text-slate-300 border border-slate-700"
                    >
                      {node}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-[11px]">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complexity & CO Academic Footer */}
      {complexityInfo && (
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div>
            <span>Time Complexity: </span>
            <span className="text-cyan-400 font-bold">{complexityInfo.timeComplexity}</span>
            <span className="mx-2 text-slate-300">·</span>
            <span>Space: </span>
            <span className="text-cyan-400 font-bold">{complexityInfo.spaceComplexity}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            Structures: {complexityInfo.dataStructuresUsed.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};
