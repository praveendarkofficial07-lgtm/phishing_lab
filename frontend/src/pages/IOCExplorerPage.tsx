import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ExtractedIOC } from '../types';
import { IOCTable } from '../components/IOCTable';
import { SearchCode, RefreshCw, Database, Layers } from 'lucide-react';

export const IOCExplorerPage: React.FC = () => {
  const [iocs, setIocs] = useState<ExtractedIOC[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIOCs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAllIOCs();
      setIocs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch IOC records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIOCs();
  }, []);

  const totalUrls = iocs.filter(i => i.ioc_type === 'URL').length;
  const totalDomains = iocs.filter(i => i.ioc_type === 'Domain').length;
  const totalIps = iocs.filter(i => i.ioc_type === 'IP').length;
  const totalEmails = iocs.filter(i => i.ioc_type === 'Email').length;
  const totalHashes = iocs.filter(i => i.ioc_type === 'Hash').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <SearchCode className="w-5 h-5 text-sky-400" />
            <span>Threat Intelligence IOC Explorer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global repository of Indicators of Compromise extracted across all active and historical investigations
          </p>
        </div>

        <button
          onClick={fetchIOCs}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Aggregate Counts Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">URLs</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">{totalUrls}</span>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">Domains</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">{totalDomains}</span>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">IP Addresses</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">{totalIps}</span>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">Email Addresses</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">{totalEmails}</span>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">File Hashes</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">{totalHashes}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Full Explorer Table */}
      <IOCTable iocs={iocs} showCaseLink={true} />
    </div>
  );
};
