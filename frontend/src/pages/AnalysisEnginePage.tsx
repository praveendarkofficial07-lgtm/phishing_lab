import React, { useState } from 'react';
import { api } from '../services/api';
import {
  URLAnalysisResult,
  HeaderAnalysisResult,
  ExtractedIOC,
  FullAnalysisResponse
} from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { RiskMeter } from '../components/RiskMeter';
import { IOCTable } from '../components/IOCTable';
import {
  Cpu,
  Link2,
  FileCode,
  SearchCode,
  Mail,
  Play,
  CheckCircle,
  AlertTriangle,
  Layers,
  ShieldCheck
} from 'lucide-react';

export const AnalysisEnginePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'email' | 'url' | 'headers' | 'iocs'>('url');

  // URL state
  const [testUrl, setTestUrl] = useState<string>('http://login-microsoft365-verify.com/auth/verify?session=123');
  const [urlResult, setUrlResult] = useState<URLAnalysisResult | null>(null);
  const [urlLoading, setUrlLoading] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Headers state
  const [testHeaders, setTestHeaders] = useState<string>(
    'From: "Microsoft IT Support" <admin-support@login-microsoft365-verify.com>\n' +
    'Reply-To: <credential-harvesting@attacker-infrastructure.xyz>\n' +
    'To: <employee@target-enterprise.com>\n' +
    'Subject: Immediate action required\n' +
    'Date: Mon, 28 Sep 2026 09:14:22 +0000\n' +
    'Authentication-Results: spf=fail; dkim=fail; dmarc=fail\n' +
    'Received: from unverified-relay.net (185.193.88.42) by mx.target.com'
  );
  const [headersResult, setHeadersResult] = useState<HeaderAnalysisResult | null>(null);
  const [headersLoading, setHeadersLoading] = useState<boolean>(false);
  const [headersError, setHeadersError] = useState<string | null>(null);

  // IOC state
  const [testIocText, setTestIocText] = useState<string>(
    'Suspicious connections to http://chase-bank-account-protection.link/login from originating host 194.26.29.112.\n' +
    'Attacker inbox identified as loot@evil-attacker.xyz with payload SHA256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.'
  );
  const [extractedIocs, setExtractedIocs] = useState<ExtractedIOC[] | null>(null);
  const [iocLoading, setIocLoading] = useState<boolean>(false);

  // Quick email state
  const [quickEmailBody, setQuickEmailBody] = useState<string>(
    'URGENT: Your Microsoft 365 password will expire in 2 hours. Click here to verify: http://login-microsoft365-verify.com/auth'
  );
  const [quickEmailResult, setQuickEmailResult] = useState<FullAnalysisResponse | null>(null);
  const [quickEmailLoading, setQuickEmailLoading] = useState<boolean>(false);

  const handleAnalyzeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.trim()) return;
    try {
      setUrlLoading(true);
      setUrlError(null);
      const res = await api.analyzeURL(testUrl.trim());
      setUrlResult(res);
    } catch (err: any) {
      setUrlError(err.message || 'Failed to inspect URL.');
    } finally {
      setUrlLoading(false);
    }
  };

  const handleAnalyzeHeaders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testHeaders.trim()) return;
    try {
      setHeadersLoading(true);
      setHeadersError(null);
      const res = await api.analyzeHeaders(testHeaders.trim());
      setHeadersResult(res);
    } catch (err: any) {
      setHeadersError(err.message || 'Failed to inspect headers.');
    } finally {
      setHeadersLoading(false);
    }
  };

  const handleExtractIocs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testIocText.trim()) return;
    try {
      setIocLoading(true);
      const res = await api.extractIOCs(testIocText.trim());
      setExtractedIocs(res);
    } catch (err: any) {
      alert(`IOC extraction error: ${err.message}`);
    } finally {
      setIocLoading(false);
    }
  };

  const handleAnalyzeQuickEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEmailBody.trim()) return;
    try {
      setQuickEmailLoading(true);
      const res = await api.analyzeCase({
        subject: 'Interactive Analysis Test',
        body_plain: quickEmailBody.trim()
      });
      setQuickEmailResult(res);
    } catch (err: any) {
      alert(`Email analysis error: ${err.message}`);
    } finally {
      setQuickEmailLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="pb-3 border-b border-slate-800">
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-sky-400" />
          <span>Interactive Analysis Engine Workbench</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform standalone heuristic, lexical, and structural threat analysis on individual artifacts without creating a case
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('url')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'url'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>URL Threat Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'headers'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>RFC Header Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('iocs')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'iocs'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <SearchCode className="w-4 h-4" />
          <span>IOC Extractor</span>
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'email'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Fast Email Pipeline</span>
        </button>
      </div>

      {/* TAB 1: URL INSPECTOR */}
      {activeTab === 'url' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Inspect Suspicious URL or Host
            </h2>
            <form onSubmit={handleAnalyzeUrl} className="flex gap-2">
              <input
                type="text"
                required
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="Enter URL (e.g. http://login-microsoft365-verify.com/auth/verify)"
                className="flex-1 bg-[#090d16] border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={urlLoading}
                className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{urlLoading ? 'Inspecting...' : 'Analyze URL'}</span>
              </button>
            </form>
          </div>

          {urlError && (
            <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300">
              {urlError}
            </div>
          )}

          {urlResult && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-slate-400 block">EVALUATED HOST</span>
                  <span className="text-base font-bold font-mono text-white">{urlResult.domain}</span>
                </div>
                <RiskBadge level={urlResult.risk_level} score={urlResult.risk_score} size="lg" />
              </div>

              {/* Attributes grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">Protocol</span>
                  <span className={`font-bold mt-1 block ${urlResult.is_https ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {urlResult.scheme.toUpperCase()} {urlResult.is_https ? '(Encrypted)' : '(Cleartext HTTP)'}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">Brand Impersonation</span>
                  <span className={`font-bold mt-1 block ${urlResult.matched_brand ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {urlResult.matched_brand ? `Targeting ${urlResult.matched_brand}` : 'None Detected'}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">IP Host</span>
                  <span className={`font-bold mt-1 block ${urlResult.is_ip_address ? 'text-rose-400' : 'text-slate-300'}`}>
                    {urlResult.is_ip_address ? 'Numeric IP Host' : 'Standard Domain'}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">Punycode / Spoofing</span>
                  <span className={`font-bold mt-1 block ${urlResult.is_punycode ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {urlResult.is_punycode ? 'Punycode Active' : 'ASCII Normalized'}
                  </span>
                </div>
              </div>

              {/* Risk Findings */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Identified Threat Indicators:
                </span>
                {urlResult.risk_indicators.length > 0 ? (
                  <div className="space-y-1.5">
                    {urlResult.risk_indicators.map((ind, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-rose-300 bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-lg">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-900/50 p-2.5 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>No elevated risk indicators detected for this URL.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HEADER INSPECTOR */}
      {activeTab === 'headers' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Paste Raw RFC 5322 Headers
            </h2>
            <form onSubmit={handleAnalyzeHeaders} className="space-y-3">
              <textarea
                rows={7}
                required
                value={testHeaders}
                onChange={(e) => setTestHeaders(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed"
              />
              <button
                type="submit"
                disabled={headersLoading}
                className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{headersLoading ? 'Parsing...' : 'Analyze Headers'}</span>
              </button>
            </form>
          </div>

          {headersResult && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">
                  HEADER PARSING & AUTHENTICATION SUMMARY
                </span>
                <RiskBadge level={headersResult.risk_level} score={headersResult.risk_score} size="md" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">SPF</span>
                  <span className={`font-bold mt-1 block ${headersResult.spf === 'PASS' ? 'text-emerald-400' : (headersResult.spf === 'FAIL' ? 'text-rose-400' : 'text-slate-400')}`}>
                    {headersResult.spf}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">DKIM</span>
                  <span className={`font-bold mt-1 block ${headersResult.dkim === 'PASS' ? 'text-emerald-400' : (headersResult.dkim === 'FAIL' ? 'text-rose-400' : 'text-slate-400')}`}>
                    {headersResult.dkim}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">DMARC</span>
                  <span className={`font-bold mt-1 block ${headersResult.dmarc === 'PASS' ? 'text-emerald-400' : (headersResult.dmarc === 'FAIL' ? 'text-rose-400' : 'text-slate-400')}`}>
                    {headersResult.dmarc}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">Originating IP</span>
                  <span className="font-bold mt-1 block text-slate-200 truncate">
                    {headersResult.originating_ip || 'Not Found'}
                  </span>
                </div>
              </div>

              {headersResult.inconsistencies.length > 0 && (
                <div className="bg-rose-950/30 border border-rose-800/60 rounded-lg p-3 text-xs text-rose-300 space-y-1">
                  <span className="font-semibold block">Envelope Inconsistencies:</span>
                  {headersResult.inconsistencies.map((inc, i) => (
                    <div key={i}>• {inc}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RAW IOC EXTRACTOR */}
      {activeTab === 'iocs' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Paste Arbitrary Log, Message, or Text Corpus
            </h2>
            <form onSubmit={handleExtractIocs} className="space-y-3">
              <textarea
                rows={6}
                required
                value={testIocText}
                onChange={(e) => setTestIocText(e.target.value)}
                placeholder="Paste logs, network events, or raw text..."
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={iocLoading}
                className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <SearchCode className="w-3.5 h-3.5" />
                <span>{iocLoading ? 'Extracting...' : 'Extract All IOCs'}</span>
              </button>
            </form>
          </div>

          {extractedIocs && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Extracted Artifacts ({extractedIocs.length})
              </h3>
              <IOCTable iocs={extractedIocs} showCaseLink={false} />
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FAST EMAIL PIPELINE */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Quick Email Triage Sandbox
            </h2>
            <form onSubmit={handleAnalyzeQuickEmail} className="space-y-3">
              <textarea
                rows={5}
                required
                value={quickEmailBody}
                onChange={(e) => setQuickEmailBody(e.target.value)}
                placeholder="Paste raw email text here..."
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={quickEmailLoading}
                className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{quickEmailLoading ? 'Running Pipeline...' : 'Run Fast Triage'}</span>
              </button>
            </form>
          </div>

          {quickEmailResult && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">
                  PIPELINE VERDICT
                </span>
                <RiskBadge level={quickEmailResult.risk_level} score={quickEmailResult.risk_score} size="lg" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RiskMeter score={quickEmailResult.risk_score} level={quickEmailResult.risk_level} />
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                  <span className="font-semibold text-slate-300 block">ML Phishing Probability:</span>
                  <span className="text-2xl font-mono font-bold text-purple-400 block">
                    {(quickEmailResult.ml_prediction.phishing_probability * 100).toFixed(1)}%
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Top contributing text features: {quickEmailResult.ml_prediction.feature_importances.map(f => f.feature).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
