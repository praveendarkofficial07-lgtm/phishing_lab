import React from 'react';
import { RiskLevel } from '../types';
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface Props {
  level: RiskLevel | string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<Props> = ({ level, score, size = 'md' }) => {
  const normalized = (level || 'LOW').toUpperCase();

  const config = {
    CRITICAL: {
      bg: 'bg-rose-950/70 border-rose-600/60 text-rose-300',
      icon: <AlertOctagon className="w-3.5 h-3.5 mr-1.5 text-rose-400" />,
      dot: 'bg-rose-500'
    },
    HIGH: {
      bg: 'bg-orange-950/70 border-orange-600/60 text-orange-300',
      icon: <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-orange-400" />,
      dot: 'bg-orange-500'
    },
    MEDIUM: {
      bg: 'bg-amber-950/70 border-amber-600/60 text-amber-300',
      icon: <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400" />,
      dot: 'bg-amber-500'
    },
    LOW: {
      bg: 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300',
      icon: <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />,
      dot: 'bg-emerald-500'
    },
  }[normalized] || {
    bg: 'bg-slate-800 border-slate-700 text-slate-300',
    icon: <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-slate-400" />,
    dot: 'bg-slate-400'
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-md border font-semibold tracking-wide ${config.bg} ${sizeClasses}`}>
      {config.icon}
      <span>{normalized}</span>
      {score !== undefined && (
        <span className="ml-1.5 opacity-80 font-mono text-[11px]">({score})</span>
      )}
    </span>
  );
};
