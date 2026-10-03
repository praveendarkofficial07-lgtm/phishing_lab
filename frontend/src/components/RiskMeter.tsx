import React from 'react';
import { RiskLevel } from '../types';

interface Props {
  score: number;
  level: RiskLevel | string;
  mlScore?: number;
  rulesScore?: number;
}

export const RiskMeter: React.FC<Props> = ({ score, level, mlScore, rulesScore }) => {
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));

  const getMeterColor = (val: number) => {
    if (val >= 75) return 'from-rose-600 to-red-500';
    if (val >= 50) return 'from-amber-500 to-orange-500';
    if (val >= 25) return 'from-yellow-400 to-amber-500';
    return 'from-emerald-500 to-teal-400';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-inner">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Investigation Composite Risk Score
        </span>
        <div className="flex items-baseline space-x-1.5">
          <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {clampedScore}
          </span>
          <span className="text-xs text-slate-500 font-mono">/ 100</span>
        </div>
      </div>

      {/* Segmented Gradient Track */}
      <div className="relative w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getMeterColor(clampedScore)} transition-all duration-700 ease-out`}
          style={{ width: `${clampedScore}%` }}
        ></div>
      </div>

      {/* Threshold markings */}
      <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2 px-1">
        <span>0 LOW</span>
        <span>25 MED</span>
        <span>50 HIGH</span>
        <span>75 CRIT</span>
        <span>100</span>
      </div>

      {/* Breakdown weights if provided */}
      {(mlScore !== undefined || rulesScore !== undefined) && (
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/50">
            <span className="text-slate-400 block text-[11px]">Rule-Based Heuristics</span>
            <span className="text-sky-400 font-mono font-semibold text-sm">
              +{rulesScore ?? 0} pts <span className="text-slate-500 text-[10px] font-normal">(max 75)</span>
            </span>
          </div>
          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/50">
            <span className="text-slate-400 block text-[11px]">ML Phishing Probability</span>
            <span className="text-purple-400 font-mono font-semibold text-sm">
              +{mlScore ?? 0} pts <span className="text-slate-500 text-[10px] font-normal">(max 25)</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
