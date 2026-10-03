import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  ShieldAlert,
  AlertOctagon,
  ShieldCheck,
  AlertTriangle,
  Link2,
  Database,
  Plus,
  ArrowRight,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Security Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry and triage metrics from local threat database
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStats}
            title="Refresh database metrics"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/new')}
            className="flex items-center space-x-2 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs shadow-md shadow-sky-950/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Investigation</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center justify-between">
          <span>Failed to connect to backend: {error}</span>
          <button onClick={fetchStats} className="underline hover:text-white">Retry</button>
        </div>
      )}

      {/* Primary SOC Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard
          title="Total Cases"
          value={stats?.total_investigations ?? 0}
          subtitle="Triaged emails"
          icon={FolderOpen}
          color="sky"
        />
        <StatCard
          title="Critical"
          value={stats?.critical_cases ?? 0}
          subtitle="Immediate action"
          icon={AlertOctagon}
          color="rose"
        />
        <StatCard
          title="High Risk"
          value={stats?.high_risk_cases ?? 0}
          subtitle="Verified threats"
          icon={ShieldAlert}
          color="rose"
        />
        <StatCard
          title="Medium Risk"
          value={stats?.medium_risk_cases ?? 0}
          subtitle="Suspicious"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Low Risk"
          value={stats?.low_risk_cases ?? 0}
          subtitle="Benign / Safe"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Malicious URLs"
          value={stats?.suspicious_urls_detected ?? 0}
          subtitle="Flagged hosts"
          icon={Link2}
          color="purple"
        />
        <StatCard
          title="Extracted IOCs"
          value={stats?.iocs_extracted ?? 0}
          subtitle="Database artifacts"
          icon={Database}
          color="sky"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Risk Classification Distribution
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Live Case Counts</span>
          </div>

          <div className="h-60 w-full">
            {stats && stats.risk_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.risk_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.risk_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No telemetry data available.
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Investigation Activity Timeline (Last 7 Days)
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Daily Ingestion Volume</span>
          </div>

          <div className="h-60 w-full">
            {stats && stats.activity_timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.activity_timeline} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="investigations"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0284c7' }}
                    activeDot={{ r: 6, fill: '#38bdf8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No recent activity logged.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Investigations Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0d1322]">
          <div>
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
              Recent Investigations
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Latest cases analyzed and stored in database</p>
          </div>
          <Link
            to="/investigations"
            className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1"
          >
            <span>View All Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0a0f1c] text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Subject / Title</th>
                <th className="py-3 px-4">Sender</th>
                <th className="py-3 px-4">Analyst</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {stats?.recent_investigations && stats.recent_investigations.length > 0 ? (
                stats.recent_investigations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">
                      <Link to={`/investigations/${item.id}`} className="hover:underline">
                        {item.case_id}
                      </Link>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-200">
                      <span title={item.title}>{item.title}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-400 font-mono text-[11px]">
                      <span title={item.sender}>{item.sender || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {item.analyst_name}
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge level={item.risk_level} score={item.risk_score} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/investigations/${item.id}`}
                        className="inline-flex items-center space-x-1 text-sky-400 hover:text-sky-300 font-semibold text-xs"
                      >
                        <span>Open Dossier</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No investigations stored in database yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
