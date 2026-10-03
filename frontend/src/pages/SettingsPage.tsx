import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Settings,
  Cpu,
  RefreshCw,
  Database,
  CheckCircle,
  AlertTriangle,
  Server,
  Code2,
  Sliders
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loadingModel, setLoadingModel] = useState<boolean>(true);
  const [retraining, setRetraining] = useState<boolean>(false);
  const [retrainSuccess, setRetrainSuccess] = useState<string | null>(null);

  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);

  const fetchModelInfo = async () => {
    try {
      setLoadingModel(true);
      const data = await api.getModelInfo();
      setModelInfo(data);
    } catch (err: any) {
      console.error('Failed to fetch model info', err);
    } finally {
      setLoadingModel(false);
    }
  };

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      setRetrainSuccess(null);
      const res = await api.retrainModel();
      setRetrainSuccess(`Model retrained successfully! 5-fold CV Accuracy: ${(res.metrics.accuracy * 100).toFixed(1)}%, F1: ${res.metrics.f1_score}`);
      await fetchModelInfo();
    } catch (err: any) {
      alert(`Retraining error: ${err.message}`);
    } finally {
      setRetraining(false);
    }
  };

  const handleSeedSamples = async () => {
    try {
      setSeeding(true);
      setSeedSuccess(null);
      const res = await api.resetSampleCases();
      setSeedSuccess(res.message || 'Sample cases initialized.');
    } catch (err: any) {
      alert(`Seed error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Settings className="w-5 h-5 text-sky-400" />
          <span>System Settings & Model Diagnostics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect local machine learning evaluation metrics, train model artifacts, and manage lab environment
        </p>
      </div>

      {/* Model Diagnostic Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Machine Learning Classifier Telemetry</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Genuine local model evaluation metrics calculated via scikit-learn 5-Fold Stratified K-Fold
            </p>
          </div>

          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Training On-Disk Dataset...' : 'Retrain ML Model'}</span>
          </button>
        </div>

        {retrainSuccess && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{retrainSuccess}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Accuracy (5-Fold CV)</span>
            <span className="text-lg font-bold text-emerald-400 mt-1 block">
              {modelInfo ? `${(modelInfo.accuracy * 100).toFixed(1)}%` : '...'}
            </span>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Precision (Phishing)</span>
            <span className="text-lg font-bold text-sky-400 mt-1 block">
              {modelInfo ? `${(modelInfo.precision * 100).toFixed(1)}%` : '...'}
            </span>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Recall (Phishing)</span>
            <span className="text-lg font-bold text-purple-400 mt-1 block">
              {modelInfo ? `${(modelInfo.recall * 100).toFixed(1)}%` : '...'}
            </span>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block font-sans">F1-Score</span>
            <span className="text-lg font-bold text-amber-400 mt-1 block">
              {modelInfo ? modelInfo.f1_score : '...'}
            </span>
          </div>
        </div>

        {/* Training Dataset Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Total Dataset Size</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">{modelInfo?.sample_count ?? 100} samples</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Phishing Samples</span>
            <span className="font-semibold text-rose-400 mt-0.5 block">{modelInfo?.phishing_samples ?? 50} examples</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Legitimate Samples</span>
            <span className="font-semibold text-emerald-400 mt-0.5 block">{modelInfo?.legitimate_samples ?? 50} examples</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Vocabulary Features</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">{modelInfo?.vocabulary_size ?? 2500} terms</span>
          </div>
        </div>
      </div>

      {/* Database Management Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <Database className="w-4 h-4 text-sky-400" />
          <span>Database & Demonstration Data Management</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Reset or re-seed the SQLite database with the standard 5 safe demonstration cases (Fake Microsoft 365, Banking Wire, DHL Parcel, Executive Spear Phishing, and Legitimate Baseline).
        </p>

        {seedSuccess && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{seedSuccess}</span>
          </div>
        )}

        <button
          onClick={handleSeedSamples}
          disabled={seeding}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
        >
          <Database className="w-3.5 h-3.5 text-sky-400" />
          <span>{seeding ? 'Seeding...' : 'Re-Seed Demonstration Cases'}</span>
        </button>
      </div>

      {/* Environment Diagnostics */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Environment & Architecture Diagnostics</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Backend Service</span>
            <div className="text-slate-200">FastAPI 0.110+ on Python 3.12 (Uvicorn ASGI)</div>
            <div className="text-emerald-400 text-[11px]">Local Host: http://localhost:8000</div>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Database Driver</span>
            <div className="text-slate-200">SQLite with SQLAlchemy 2.0 ORM</div>
            <div className="text-sky-400 text-[11px]">Storage: backend/phishing_lab.db</div>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Frontend Client</span>
            <div className="text-slate-200">React 19 + TypeScript + Vite + Tailwind CSS</div>
            <div className="text-purple-400 text-[11px]">Client Port: http://localhost:5173</div>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Security Posture</span>
            <div className="text-slate-200">Air-gapped mode (No third-party cloud AI dependencies)</div>
            <div className="text-amber-400 text-[11px]">Zero API Keys Required</div>
          </div>
        </div>
      </div>
    </div>
  );
};
