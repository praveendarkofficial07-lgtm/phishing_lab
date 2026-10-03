import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { SampleCase, FullAnalysisResponse, AttachmentMetadata } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { RiskMeter } from '../components/RiskMeter';
import {
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileCode,
  FileText,
  Paperclip,
  Plus,
  Trash2,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FolderPlus
} from 'lucide-react';

export const NewInvestigationPage: React.FC = () => {
  const navigate = useNavigate();
  const [samples, setSamples] = useState<SampleCase[]>([]);
  const [loadingSamples, setLoadingSamples] = useState<boolean>(false);

  // Form state
  const [title, setTitle] = useState<string>('');
  const [analystName, setAnalystName] = useState<string>(
    localStorage.getItem('soc_analyst_name') || 'Senior SOC Analyst'
  );
  const [priority, setPriority] = useState<string>('High');
  const [description, setDescription] = useState<string>('');

  const [sender, setSender] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [emailDate, setEmailDate] = useState<string>('');
  const [replyTo, setReplyTo] = useState<string>('');

  const [bodyFormat, setBodyFormat] = useState<'plain' | 'html'>('plain');
  const [bodyPlain, setBodyPlain] = useState<string>('');
  const [bodyHtml, setBodyHtml] = useState<string>('');

  const [showHeaders, setShowHeaders] = useState<boolean>(false);
  const [rawHeaders, setRawHeaders] = useState<string>('');

  const [manualUrls, setManualUrls] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState<string>('');

  const [attachments, setAttachments] = useState<AttachmentMetadata[]>([]);
  const [newAttFilename, setNewAttFilename] = useState<string>('');
  const [newAttSha256, setNewAttSha256] = useState<string>('');
  const [newAttMime, setNewAttMime] = useState<string>('application/octet-stream');

  // Preview / Analysis state
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<FullAnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadSamples = async () => {
      try {
        setLoadingSamples(true);
        const data = await api.getSampleCases();
        setSamples(data);
      } catch (err) {
        console.error('Failed to load sample cases', err);
      } finally {
        setLoadingSamples(false);
      }
    };
    loadSamples();
  }, []);

  const handleSelectSample = (s: SampleCase) => {
    setTitle(s.title);
    setAnalystName(s.analyst_name || 'Senior SOC Analyst');
    setPriority(s.priority || 'High');
    setDescription(`Synthetic demonstration case: ${s.category}`);
    setSender(s.sender || '');
    setRecipient(s.recipient || '');
    setSubject(s.subject || '');
    setEmailDate(s.email_date || '');
    setReplyTo(s.reply_to || '');
    setBodyPlain(s.body_plain || '');
    setRawHeaders(s.raw_headers || '');
    setShowHeaders(Boolean(s.raw_headers));
    setManualUrls(s.manual_urls || []);
    setAttachments(s.attachments || []);
    setAnalysisResult(null);
  };

  const handleAddUrl = () => {
    if (newUrlInput.trim()) {
      setManualUrls([...manualUrls, newUrlInput.trim()]);
      setNewUrlInput('');
    }
  };

  const handleRemoveUrl = (idx: number) => {
    setManualUrls(manualUrls.filter((_, i) => i !== idx));
  };

  const handleAddAttachment = () => {
    if (newAttFilename.trim()) {
      const ext = newAttFilename.includes('.') ? newAttFilename.split('.').pop() || '' : '';
      const att: AttachmentMetadata = {
        filename: newAttFilename.trim(),
        extension: ext,
        sha256: newAttSha256.trim(),
        mime_type: newAttMime.trim(),
        is_executable_or_script: ['exe', 'scr', 'bat', 'cmd', 'vbs', 'js', 'ps1'].includes(ext.toLowerCase()),
        risk_level: 'LOW',
        findings: []
      };
      setAttachments([...attachments, att]);
      setNewAttFilename('');
      setNewAttSha256('');
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const runAnalysisPreview = async () => {
    setErrorMsg(null);
    if (!bodyPlain && !bodyHtml && !subject) {
      setErrorMsg('Please enter an email body or subject to analyze.');
      return;
    }

    try {
      setAnalyzing(true);
      const res = await api.analyzeCase({
        sender,
        recipient,
        subject,
        reply_to: replyTo,
        body_plain: bodyPlain,
        body_html: bodyHtml,
        raw_headers: rawHeaders,
        manual_urls: manualUrls,
        attachments
      });
      setAnalysisResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis preview failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!title.trim()) {
      setErrorMsg('Case Title is mandatory.');
      return;
    }

    try {
      setSaving(true);
      const createdCase = await api.createInvestigation({
        title,
        analyst_name: analystName,
        priority,
        description,
        sender,
        recipient,
        subject,
        email_date: emailDate,
        reply_to: replyTo,
        body_plain: bodyPlain,
        body_html: bodyHtml,
        raw_headers: rawHeaders,
        manual_urls: manualUrls,
        attachments
      });

      // Redirect immediately to the newly created dossier
      navigate(`/investigations/${createdCase.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to persist investigation case.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-sky-400" />
            <span>New Phishing Investigation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ingest suspicious email indicators, RFC headers, and artifacts for automated AI & rule-based triage
          </p>
        </div>

        {/* Quick sample selector */}
        {samples.length > 0 && (
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 ml-1.5" />
            <span className="text-[11px] font-medium text-slate-300">Load Synthetic Demo:</span>
            <select
              onChange={(e) => {
                const s = samples.find(item => item.id === e.target.value);
                if (s) handleSelectSample(s);
              }}
              defaultValue=""
              className="bg-slate-950 border border-slate-700/80 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="" disabled>-- Select Demonstration Case --</option>
              {samples.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.category})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveInvestigation} className="space-y-6">
        {/* Section 1: Case Information */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
            <FolderPlus className="w-4 h-4" />
            <span>1. Investigation Case Metadata</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Case Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Suspicious Microsoft 365 Password Expiration Alert"
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Analyst Name
              </label>
              <input
                type="text"
                value={analystName}
                onChange={(e) => setAnalystName(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Investigation Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Case Description / Context
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of source, reporting user, or business context"
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Email Details */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
            <FileText className="w-4 h-4" />
            <span>2. Email Envelope & Content</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Sender (From)
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. IT Support <support@login-microsoft365-verify.com>"
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Reply-To Address
              </label>
              <input
                type="text"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                placeholder="e.g. loot-receiver@attacker-domain.xyz"
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Recipient (To)
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. employee@target-enterprise.com"
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. URGENT: Your password expires in 2 hours"
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Email Body with Plain / HTML toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-slate-300">
                Email Message Body
              </label>
              <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setBodyFormat('plain')}
                  className={`px-2.5 py-1 text-[11px] rounded font-medium ${
                    bodyFormat === 'plain'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Plain Text
                </button>
                <button
                  type="button"
                  onClick={() => setBodyFormat('html')}
                  className={`px-2.5 py-1 text-[11px] rounded font-medium ${
                    bodyFormat === 'html'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Raw HTML Content
                </button>
              </div>
            </div>

            {bodyFormat === 'plain' ? (
              <textarea
                rows={7}
                value={bodyPlain}
                onChange={(e) => setBodyPlain(e.target.value)}
                placeholder="Paste the full plain-text message content here. URLs and threat language will be extracted automatically..."
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg p-3 text-xs text-slate-100 font-mono leading-relaxed placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            ) : (
              <textarea
                rows={7}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                placeholder="Paste raw HTML body markup here (e.g. <a href='...'>Click here</a>)..."
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg p-3 text-xs text-slate-100 font-mono leading-relaxed placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            )}
          </div>

          {/* Expandable RFC Email Headers */}
          <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
            <button
              type="button"
              onClick={() => setShowHeaders(!showHeaders)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-sky-400" />
                <span>RFC 5322 Raw Email Headers</span>
                {rawHeaders && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    Headers Provided
                  </span>
                )}
              </div>
              {showHeaders ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showHeaders && (
              <div className="p-4 border-t border-slate-800 bg-[#070b14]">
                <textarea
                  rows={6}
                  value={rawHeaders}
                  onChange={(e) => setRawHeaders(e.target.value)}
                  placeholder="Paste RFC 5322 email headers here (Received, Authentication-Results, SPF, DKIM, Message-ID, Return-Path)..."
                  className="w-full bg-[#0a0f1c] border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Manual URLs & Attachments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manual URLs */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Additional Target URLs</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              URLs in the body are extracted automatically. You can also specify manual URLs:
            </p>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newUrlInput}
                onChange={(e) => setNewUrlInput(e.target.value)}
                placeholder="http://suspicious-portal.com/login"
                className="flex-1 bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium"
              >
                Add URL
              </button>
            </div>

            {manualUrls.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pt-2">
                {manualUrls.map((u, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-xs font-mono">
                    <span className="truncate max-w-xs text-slate-300">{u}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUrl(idx)}
                      className="text-slate-500 hover:text-rose-400 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attachment Metadata */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Paperclip className="w-4 h-4" />
              <span>Attachment Metadata (Safe Ingestion)</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Record suspicious file metadata (no execution or binary storage performed):
            </p>

            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAttFilename}
                  onChange={(e) => setNewAttFilename(e.target.value)}
                  placeholder="e.g. invoice_update.pdf.exe"
                  className="flex-1 bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium"
                >
                  Add File
                </button>
              </div>

              <input
                type="text"
                value={newAttSha256}
                onChange={(e) => setNewAttSha256(e.target.value)}
                placeholder="Optional SHA-256 hash (64 hex characters)"
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pt-2">
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-xs">
                    <div>
                      <span className="font-mono text-slate-200 font-medium">{att.filename}</span>
                      {att.extension && (
                        <span className="ml-2 text-[10px] uppercase font-bold text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded">
                          .{att.extension}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-slate-500 hover:text-rose-400 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={runAnalysisPreview}
            disabled={analyzing}
            className="flex items-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition-colors border border-slate-700"
          >
            <Cpu className={`w-4 h-4 text-sky-400 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Running Local Analysis Pipeline...' : 'Run Preview Analysis'}</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-sky-950/50 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Registering Case in DB...' : 'Save & Create Investigation Case'}</span>
          </button>
        </div>
      </form>

      {/* Analysis Preview Output Card if run */}
      {analysisResult && (
        <div className="bg-[#111827] border border-sky-500/30 rounded-xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest block">
                ANALYSIS ENGINE PREVIEW
              </span>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                Composite Risk Assessment Result
              </h2>
            </div>
            <RiskBadge level={analysisResult.risk_level} score={analysisResult.risk_score} size="lg" />
          </div>

          {/* Meter & ML verdict */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <RiskMeter
              score={analysisResult.risk_score}
              level={analysisResult.risk_level}
              mlScore={analysisResult.risk_breakdown.ml_weight}
              rulesScore={analysisResult.risk_breakdown.rules_weight}
            />

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Machine Learning Text Verdict</span>
                <span className="text-xs font-mono font-bold text-purple-400">
                  {analysisResult.ml_prediction.verdict}
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold font-mono text-white">
                  {(analysisResult.ml_prediction.phishing_probability * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400">Phishing Confidence</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Trained on local academic phishing dataset using scikit-learn TF-IDF N-grams and Logistic Regression.
              </p>
            </div>
          </div>

          {/* Explainable AI "Why this was flagged" */}
          <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              {analysisResult.explainability.title}
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {analysisResult.explainability.evidence_points.map((pt, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
