import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, ArrowRight, ShieldCheck, Cpu, Terminal, Key } from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [analystName, setAnalystName] = useState<string>('Alex Mercer');
  const [analystRole, setAnalystRole] = useState<string>('Tier 2 Security Analyst');

  const handleEnterLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (analystName.trim()) {
      localStorage.setItem('soc_analyst_name', analystName.trim());
      localStorage.setItem('soc_analyst_role', analystRole);
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Subtle background tech grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      {/* Decorative ambient glow */}
      <div className="absolute top-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Security badge and logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-4 shadow-xl shadow-sky-950/40">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase">
            Phish<span className="text-sky-400">Lab</span> AI
          </h1>
          <p className="text-xs font-mono text-sky-400 mt-1 uppercase tracking-widest">
            AI-Powered Phishing Investigation Laboratory
          </p>
          <p className="text-xs text-slate-400 mt-3 max-w-sm mx-auto leading-relaxed">
            Autonomous defensive security workbench for triaging suspicious communications, analyzing RFC headers, and extracting indicators of compromise.
          </p>
        </div>

        {/* Access Terminal Card */}
        <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-7 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-mono font-semibold text-slate-300">INVESTIGATOR ACCESS</span>
            </div>
            <span className="inline-flex items-center text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
              LOCAL AIR-GAPPED
            </span>
          </div>

          <form onSubmit={handleEnterLab} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Investigator / Analyst Name
              </label>
              <input
                type="text"
                required
                value={analystName}
                onChange={(e) => setAnalystName(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Investigation Role
              </label>
              <select
                value={analystRole}
                onChange={(e) => setAnalystRole(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="Tier 1 SOC Analyst">Tier 1 SOC Analyst (Triage)</option>
                <option value="Tier 2 Security Analyst">Tier 2 Security Analyst (Deep Inspection)</option>
                <option value="Incident Response Lead">Incident Response Lead</option>
                <option value="Threat Intelligence Hunter">Threat Intelligence Hunter</option>
                <option value="Academic Cybersecurity Researcher">Academic Cybersecurity Researcher</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-2.5 px-4 rounded-lg shadow-lg shadow-sky-950/50 transition-all duration-200"
              >
                <span>Enter Investigation Lab</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Operational features note */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Zero external keys required</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Embedded ML & NLP</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-600 mt-6 font-mono">
          College Cybersecurity Capstone Project • Defensive Engineering
        </p>
      </div>
    </div>
  );
};
