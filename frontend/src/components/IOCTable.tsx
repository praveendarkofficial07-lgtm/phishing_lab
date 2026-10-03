import React, { useState } from 'react';
import { ExtractedIOC, IOCType } from '../types';
import { RiskBadge } from './RiskBadge';
import { Copy, Check, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  iocs: ExtractedIOC[];
  showCaseLink?: boolean;
}

export const IOCTable: React.FC<Props> = ({ iocs, showCaseLink = false }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedValue(val);
    setTimeout(() => {
      setCopiedValue(null);
    }, 2000);
  };

  const filtered = iocs.filter((item) => {
    const matchesType = filterType === 'ALL' || item.ioc_type.toUpperCase() === filterType.toUpperCase();
    const matchesSearch =
      !search ||
      item.value.toLowerCase().includes(search.toLowerCase()) ||
      item.context.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const types = ['ALL', 'URL', 'DOMAIN', 'IP', 'EMAIL', 'HASH', 'FILE'];

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-[#0d1322]">
        <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search IOCs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase font-medium transition-colors ${
                filterType === t
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0b101c] text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Indicator Value</th>
              <th className="py-3 px-4">Risk</th>
              {showCaseLink && <th className="py-3 px-4">Case ID</th>}
              <th className="py-3 px-4">Context</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-slate-300 font-mono">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={showCaseLink ? 6 : 5} className="py-8 text-center text-slate-500 font-sans">
                  No Indicators of Compromise match current criteria.
                </td>
              </tr>
            ) : (
              filtered.map((ioc, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-sky-400 border border-slate-700">
                      {ioc.ioc_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-md truncate font-mono text-slate-200">
                    <span title={ioc.value}>{ioc.value}</span>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <RiskBadge level={ioc.risk_level} size="sm" />
                  </td>
                  {showCaseLink && (
                    <td className="py-3 px-4 font-sans">
                      {ioc.investigation_id ? (
                        <Link
                          to={`/investigations/${ioc.investigation_id}`}
                          className="text-sky-400 hover:underline font-mono"
                        >
                          {ioc.case_id || `ID #${ioc.investigation_id}`}
                        </Link>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </td>
                  )}
                  <td className="py-3 px-4 text-slate-400 font-sans max-w-xs truncate text-[11px]">
                    <span title={ioc.context}>{ioc.context || 'General Indicator'}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleCopy(ioc.value)}
                      title="Copy to clipboard"
                      className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      {copiedValue === ioc.value ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
