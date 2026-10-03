import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldPlus,
  Inbox,
  SearchCode,
  Cpu,
  BookOpen,
  Settings,
  ShieldAlert,
  FileText
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Investigation', path: '/new', icon: ShieldPlus },
    { name: 'Investigations', path: '/investigations', icon: Inbox },
    { name: 'IOC Explorer', path: '/iocs', icon: SearchCode },
    { name: 'Analysis Engine', path: '/analysis', icon: Cpu },
    { name: 'Documentation', path: '/docs', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 space-x-3 bg-[#0a0f1c]">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide leading-tight">
              PHISH<span className="text-sky-400">LAB</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">SOC Defense Suite</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold shadow-sm shadow-sky-950/50'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer system status */}
      <div className="p-4 border-t border-slate-800/80 bg-[#090d17]">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-semibold text-slate-200">Local SOC Engine</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            100% Offline • TF-IDF + Logistic Regression ML • Zero Cloud APIs
          </p>
        </div>
      </div>
    </aside>
  );
};
