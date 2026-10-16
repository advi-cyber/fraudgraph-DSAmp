import React, { memo } from 'react';
import { Handle, Position, Node, NodeProps } from '@xyflow/react';
import { NodeData } from '../../types/graph';
import { ShieldAlert, Building2, User, Store, Skull } from 'lucide-react';
import { formatCompactINR } from '../../utils/currency';

export type AccountNodeType = Node<NodeData & { isHighlighted?: boolean; isCurrent?: boolean }, 'accountNode'>;

export const AccountNode = memo(({ data, selected }: NodeProps<AccountNodeType>) => {
  const isHighRisk = data.riskScore >= 60 || data.riskLevel === 'CRITICAL' || data.riskLevel === 'HIGH';
  const isHighlighted = data.isHighlighted;
  const isCurrent = data.isCurrent;

  const getTypeIcon = () => {
    switch (data.accountType) {
      case 'SHELL_COMPANY':
        return <Skull className="w-3.5 h-3.5 text-rose-500" />;
      case 'MULE_CANDIDATE':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />;
      case 'BUSINESS':
        return <Building2 className="w-3.5 h-3.5 text-cyan-500" />;
      case 'MERCHANT':
        return <Store className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <User className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div
      className={`relative px-3 py-2.5 rounded-lg border text-xs min-w-[170px] transition-all duration-200 select-none ${
        isCurrent
          ? 'bg-amber-950 border-amber-400 ring-2 ring-amber-400/60 shadow-md'
          : isHighlighted
          ? 'bg-cyan-950 border-cyan-400 ring-2 ring-cyan-400/50 shadow-md'
          : isHighRisk
          ? 'bg-white border-rose-400 hover:border-rose-500 shadow-xs'
          : 'bg-white border-slate-700 hover:border-slate-500 shadow-xs'
      } ${selected ? 'ring-2 ring-blue-600 shadow-md scale-[1.02]' : ''}`}
    >
      {/* Prominent Floating Root Badge */}
      {isCurrent && (
        <div className="absolute -top-2.5 left-2.5 z-10 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider uppercase bg-amber-500 text-slate-950 shadow-xs border border-amber-300">
          INVESTIGATED ROOT
        </div>
      )}

      {/* Target Handles (Left and Top for flexible edge routing) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-cyan-500 !border-white"
      />

      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-2 !h-2 !bg-cyan-500 !border-white"
      />

      <div className="flex items-center justify-between gap-1 mb-1.5 pb-1 border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-mono font-semibold tracking-tight text-slate-100">
          {getTypeIcon()}
          <span>{data.label}</span>
        </div>
        <span
          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium border ${
            isHighRisk
              ? 'bg-rose-950 text-rose-400 border-rose-800'
              : 'bg-slate-100 text-slate-400 border-slate-700'
          }`}
        >
          {data.riskScore > 0 ? `Risk ${data.riskScore}` : 'Verified'}
        </span>
      </div>

      <div className="text-[11px] text-slate-400 truncate max-w-[155px] mb-1.5 font-sans" title={data.accountHolder}>
        {data.accountHolder || data.id}
      </div>

      <div className="grid grid-cols-2 gap-1 text-[10px] bg-slate-50 p-1.5 rounded border border-slate-800 font-mono">
        <div>
          <span className="text-slate-500">In:</span>{' '}
          <span className="text-emerald-500 font-semibold">{formatCompactINR(data.totalInAmount)}</span>
          <span className="text-slate-400 ml-1">({data.inDegree})</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500">Out:</span>{' '}
          <span className="text-amber-500 font-semibold">{formatCompactINR(data.totalOutAmount)}</span>
          <span className="text-slate-400 ml-1">({data.outDegree})</span>
        </div>
      </div>

      {/* Source Handles (Right and Bottom) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-amber-500 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-2 !h-2 !bg-amber-500 !border-white"
      />
    </div>
  );
});

AccountNode.displayName = 'AccountNode';

