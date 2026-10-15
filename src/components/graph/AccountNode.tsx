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
        return <Skull className="w-3.5 h-3.5 text-rose-400" />;
      case 'MULE_CANDIDATE':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
      case 'BUSINESS':
        return <Building2 className="w-3.5 h-3.5 text-blue-400" />;
      case 'MERCHANT':
        return <Store className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-slate-300" />;
    }
  };

  return (
    <div
      className={`relative px-3 py-2.5 rounded-lg border text-xs min-w-[170px] shadow-lg transition-all duration-200 select-none ${
        isCurrent
          ? 'bg-amber-950/90 border-amber-400 ring-2 ring-amber-400/50 shadow-amber-500/20'
          : isHighlighted
          ? 'bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-400/50 shadow-cyan-500/20'
          : isHighRisk
          ? 'bg-rose-950/40 border-rose-600/70 hover:border-rose-400'
          : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-500'
      } ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backdropFilter: 'blur(8px)',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-cyan-400 !border-slate-900"
      />

      <div className="flex items-center justify-between gap-1 mb-1.5 pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 font-mono font-semibold tracking-tight text-slate-100">
          {getTypeIcon()}
          <span>{data.label}</span>
        </div>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
            isHighRisk
              ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {data.riskScore > 0 ? `Risk ${data.riskScore}` : 'Verified'}
        </span>
      </div>

      <div className="text-[11px] text-slate-400 truncate max-w-[155px] mb-1.5" title={data.accountHolder}>
        {data.accountHolder || data.id}
      </div>

      <div className="grid grid-cols-2 gap-1 text-[10px] bg-slate-950/60 p-1.5 rounded border border-slate-800/60 font-mono">
        <div>
          <span className="text-slate-500">In:</span>{' '}
          <span className="text-emerald-400 font-semibold">{formatCompactINR(data.totalInAmount)}</span>
          <span className="text-slate-600 ml-1">({data.inDegree})</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500">Out:</span>{' '}
          <span className="text-amber-400 font-semibold">{formatCompactINR(data.totalOutAmount)}</span>
          <span className="text-slate-600 ml-1">({data.outDegree})</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-amber-400 !border-slate-900"
      />
    </div>
  );
});

AccountNode.displayName = 'AccountNode';
