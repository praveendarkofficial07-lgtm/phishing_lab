import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Terminal, UserCheck } from 'lucide-react';

interface NavbarProps {
  onToggleMobile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobile }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-[#0c1220]/90 backdrop-blur border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        {onToggleMobile && (
          <button
            onClick={onToggleMobile}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Terminal className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-mono font-medium text-slate-300">
            SYSTEM STATUS: <span className="text-emerald-400 font-semibold">DEFENSIVE OPERATIONAL</span>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Quick New Investigation button */}
        <button
          onClick={() => navigate('/new')}
          className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm shadow-sky-900/40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Investigation</span>
        </button>

        {/* Analyst Session Indicator */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-300 font-medium">SecAnalyst (Local)</span>
        </div>
      </div>
    </header>
  );
};
