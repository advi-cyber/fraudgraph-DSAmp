import React, { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge, Edge } from '@xyflow/react';
import { EdgeData } from '../../types/graph';
import { formatCompactINR } from '../../utils/currency';

export type TransactionEdgeType = Edge<EdgeData & { isCycleEdge?: boolean; isHighlighted?: boolean }, 'transactionEdge'>;

export const TransactionEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
  }: EdgeProps<TransactionEdgeType>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetPosition,
      targetX,
      targetY,
    });

    const isCycle = data?.isCycleEdge;
    const isHighlighted = data?.isHighlighted;

    const strokeColor = isCycle ? '#ef4444' : isHighlighted ? '#06b6d4' : '#64748b';
    const strokeWidth = isCycle ? 2.5 : isHighlighted ? 2.5 : 1.2;

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            stroke: strokeColor,
            strokeWidth,
            strokeDasharray: isHighlighted ? '5 5' : undefined,
            transition: 'stroke 0.2s, stroke-width 0.2s',
          }}
        />
        {data && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border shadow-sm transition-all select-none ${
                isCycle
                  ? 'bg-rose-950/90 text-rose-300 border-rose-500/80 font-bold ring-1 ring-rose-500/50'
                  : isHighlighted
                  ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400 font-bold'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700/70 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="font-semibold">{formatCompactINR(data.amount)}</span>
                <span className="text-[8px] text-slate-400">({data.transactionId})</span>
              </div>
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }
);

TransactionEdge.displayName = 'TransactionEdge';
