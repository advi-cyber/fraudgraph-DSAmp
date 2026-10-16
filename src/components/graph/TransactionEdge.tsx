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

    const strokeColor = isCycle ? '#dc2626' : isHighlighted ? '#2563eb' : '#94a3b8';
    const strokeWidth = isCycle ? 2.5 : isHighlighted ? 2.5 : 1.4;

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
              title={`Tx: ${data.transactionId} | Amount: ₹${data.amount.toLocaleString('en-IN')}`}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border shadow-xs transition-all select-none cursor-pointer ${
                isCycle
                  ? 'bg-rose-950 text-rose-400 border-rose-800 font-bold'
                  : isHighlighted
                  ? 'bg-cyan-950 text-cyan-400 border-cyan-800 font-bold'
                  : 'bg-white text-slate-200 border-slate-700 hover:border-slate-500'
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
