import React from 'react';
import { CaseStatus } from '../types';

interface Props {
  status: CaseStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    'Open': {
      bg: 'bg-blue-950/60 border-blue-600/40 text-blue-300',
      text: 'Open',
      dot: 'bg-blue-400'
    },
    'Investigating': {
      bg: 'bg-amber-950/60 border-amber-600/40 text-amber-300',
      text: 'Investigating',
      dot: 'bg-amber-400 animate-pulse'
    },
    'Contained': {
      bg: 'bg-purple-950/60 border-purple-600/40 text-purple-300',
      text: 'Contained',
      dot: 'bg-purple-400'
    },
    'Resolved': {
      bg: 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300',
      text: 'Resolved',
      dot: 'bg-emerald-400'
    },
    'False Positive': {
      bg: 'bg-slate-800 border-slate-700 text-slate-300',
      text: 'False Positive',
      dot: 'bg-slate-400'
    }
  };

  const item = config[status] || {
    bg: 'bg-slate-800 border-slate-700 text-slate-300',
    text: status,
    dot: 'bg-slate-400'
  };

  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${item.bg} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.dot}`}></span>
      {item.text}
    </span>
  );
};
