import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Investigation, CaseStatus } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { RiskMeter } from '../components/RiskMeter';
import { IOCTable } from '../components/IOCTable';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  ShieldAlert,
  ArrowLeft,
  Download,
  Calendar,
  User,
  Tag,
  Mail,
  FileText,
  Clock,
  MessageSquare,
  Paperclip,
  CheckCircle,
  AlertTriangle,
  Send,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers
} from 'lucide-react';

export const CaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Forms
  const [noteAuthor, setNoteAuthor] = useState<string>(
    localStorage.getItem('soc_analyst_name') || 'SOC Analyst'
  );
  const [newNote, setNewNote] = useState<string>('');
  const [submittingNote, setSubmittingNote] = useState<boolean>(false);

  const [evidenceName, setEvidenceName] = useState<string>('');
  const [evidenceType, setEvidenceType] = useState<string>('Log Snippet');
  const [evidenceValue, setEvidenceValue] = useState<string>('');
  const [submittingEvidence, setSubmittingEvidence] = useState<boolean>(false);

  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [downloadingReport, setDownloadingReport] = useState<boolean>(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const fetchDossier = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getInvestigation(id);
      setInvestigation(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve investigation dossier.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, [id]);

  const handleStatusChange = async (newStatus: CaseStatus) => {
    if (!id) return;
    try {
      setUpdatingStatus(true);
      await api.updateInvestigationStatus(id, newStatus);
      await fetchDossier();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNote.trim()) return;

    try {
      setSubmittingNote(true);
      await api.addNote(id, newNote.trim(), noteAuthor);
      setNewNote('');
      await fetchDossier();
    } catch (err: any) {
      alert(`Failed to add note: ${err.message}`);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !evidenceName.trim()) return;

    try {
      setSubmittingEvidence(true);
      await api.addEvidence(id, {
        name: evidenceName.trim(),
        item_type: evidenceType,
        value: evidenceValue.trim(),
        description: `Attached during investigation by ${noteAuthor}`
      });
      setEvidenceName('');
      setEvidenceValue('');
      await fetchDossier();
    } catch (err: any) {
      alert(`Failed to attach evidence: ${err.message}`);
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!investigation) return;
    try {
      setDownloadingReport(true);
      await api.downloadReport(investigation.id, investigation.case_id);
    } catch (err: any) {
      alert(`Report download error: ${err.message}`);
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleDeleteCase = async () => {
    if (!id) return;
    try {
      await api.deleteInvestigation(id);
      navigate('/investigations');
    } catch (err: any) {
      alert(`Failed to delete case: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-6 h-6 text-sky-400 animate-spin" />
        <span className="text-xs font-mono text-slate-400">Loading Investigation Dossier...</span>
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="p-6 bg-rose-950/40 border border-rose-800 rounded-xl space-y-3 text-xs text-rose-300">
        <p className="font-semibold">Investigation Error: {error || 'Dossier not found'}</p>
        <button
          onClick={() => navigate('/investigations')}
          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 hover:text-white"
        >
          Return to Investigations
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top action header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Link
            to="/investigations"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-extrabold font-mono text-sky-400">
                {investigation.case_id}
              </span>
              <RiskBadge level={investigation.risk_level} score={investigation.risk_score} size="sm" />
              <StatusBadge status={investigation.status} size="sm" />
            </div>
            <h1 className="text-base font-bold text-white mt-0.5 tracking-tight">
              {investigation.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Status Changer */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-[11px] text-slate-400">Status:</span>
            <select
              value={investigation.status}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
              className="bg-transparent text-xs text-sky-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="Contained">Contained</option>
              <option value="Resolved">Resolved</option>
              <option value="False Positive">False Positive</option>
            </select>
          </div>

          {/* Download PDF Report */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadingReport ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>

          {/* Delete case button */}
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            title="Delete Investigation"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Case Overview Metadata Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">Assigned Analyst</span>
          <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-200 mt-1">
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span>{investigation.analyst_name}</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">Investigation Priority</span>
          <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-200 mt-1">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>{investigation.priority} Priority</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">Registered Date</span>
          <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-200 mt-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-[11px]">{new Date(investigation.created_at).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">Extracted Artifacts</span>
          <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-200 mt-1">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>{investigation.iocs.length} IOCs Identified</span>
          </div>
        </div>
      </div>

      {/* Risk Assessment & ML Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <RiskMeter score={investigation.risk_score} level={investigation.risk_level} />
        </div>

        <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Local Machine Learning Text Classifier</span>
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 font-bold">
                {investigation.ml_verdict}
              </span>
            </div>

            <div className="flex items-baseline space-x-2 my-2">
              <span className="text-3xl font-extrabold font-mono text-white">
                {(investigation.ml_probability * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">Phishing Probability</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              The model evaluates n-gram textual correlations against known spear-phishing heuristics.
              The final risk score combines this probability with rule-based header and URL validations.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            Model: TF-IDF + Regularized Logistic Regression • 100% On-Premise
          </div>
        </div>
      </div>

      {/* Explainable AI ("Why this was flagged") */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Explainable AI: Why This Case Was Flagged</span>
        </h2>
        <p className="text-xs text-slate-400">
          Transparent explanation of contributing signals, indicators, and anomalies:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {Array.isArray(investigation.explainability) && investigation.explainability.length > 0 ? (
            investigation.explainability.map((item, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 flex items-start space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0"></span>
                <span className="leading-relaxed">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500">No high-risk reasoning anomalies detected.</div>
          )}
        </div>
      </div>

      {/* Email Evidence Dossier */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-[#0d1322] flex items-center justify-between">
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Mail className="w-4 h-4 text-sky-400" />
            <span>Email Evidence Artifacts</span>
          </h2>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 font-mono text-[11px]">
            <div><span className="text-slate-500">From: </span><span className="text-slate-200">{investigation.sender || 'N/A'}</span></div>
            <div><span className="text-slate-500">Reply-To: </span><span className="text-slate-200">{investigation.reply_to || 'N/A'}</span></div>
            <div><span className="text-slate-500">To: </span><span className="text-slate-200">{investigation.recipient || 'N/A'}</span></div>
            <div><span className="text-slate-500">Subject: </span><span className="text-slate-200 font-sans">{investigation.subject || 'N/A'}</span></div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Message Body Content
            </span>
            <div className="bg-[#090d16] border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {investigation.body_plain || 'No plain text body content recorded.'}
            </div>
          </div>

          {investigation.raw_headers && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Ingested RFC 5322 Raw Headers
              </span>
              <div className="bg-[#090d16] border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {investigation.raw_headers}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Header Analysis Results */}
      {investigation.header_analysis && Object.keys(investigation.header_analysis).length > 0 && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Email Header & Authentication Breakdown</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">SPF Validation</span>
              <span className={`text-xs font-bold font-mono mt-1 block ${
                investigation.header_analysis.spf === 'PASS' ? 'text-emerald-400' : (investigation.header_analysis.spf === 'FAIL' ? 'text-rose-400' : 'text-slate-400')
              }`}>
                {investigation.header_analysis.spf || 'NOT PROVIDED'}
              </span>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">DKIM Signature</span>
              <span className={`text-xs font-bold font-mono mt-1 block ${
                investigation.header_analysis.dkim === 'PASS' ? 'text-emerald-400' : (investigation.header_analysis.dkim === 'FAIL' ? 'text-rose-400' : 'text-slate-400')
              }`}>
                {investigation.header_analysis.dkim || 'NOT PROVIDED'}
              </span>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">DMARC Policy</span>
              <span className={`text-xs font-bold font-mono mt-1 block ${
                investigation.header_analysis.dmarc === 'PASS' ? 'text-emerald-400' : (investigation.header_analysis.dmarc === 'FAIL' ? 'text-rose-400' : 'text-slate-400')
              }`}>
                {investigation.header_analysis.dmarc || 'NOT PROVIDED'}
              </span>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Originating IP</span>
              <span className="text-xs font-mono font-bold text-slate-200 mt-1 block truncate">
                {investigation.header_analysis.originating_ip || 'Not Identified'}
              </span>
            </div>
          </div>

          {investigation.header_analysis.inconsistencies && investigation.header_analysis.inconsistencies.length > 0 && (
            <div className="bg-rose-950/30 border border-rose-800/60 rounded-lg p-3 text-xs text-rose-300 space-y-1">
              <span className="font-semibold block">Detected Header Inconsistencies:</span>
              {investigation.header_analysis.inconsistencies.map((inc: string, i: number) => (
                <div key={i} className="flex items-center space-x-2">
                  <span>•</span>
                  <span>{inc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Extracted IOCs Table */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
          <span>Extracted Indicators of Compromise (IOCs)</span>
          <span className="text-[11px] text-slate-500">({investigation.iocs.length} records)</span>
        </h2>
        <IOCTable iocs={investigation.iocs} showCaseLink={false} />
      </div>

      {/* Recommended Defensive Actions */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Recommended Defensive Countermeasures</span>
        </h2>

        <div className="space-y-2">
          {Array.isArray(investigation.recommended_actions) && investigation.recommended_actions.length > 0 ? (
            investigation.recommended_actions.map((act, i) => (
              <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-200 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span className="leading-relaxed">{act}</span>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500">Standard operational vigilance advised.</div>
          )}
        </div>
      </div>

      {/* Timeline & Notes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Investigation Chronological Timeline</span>
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {investigation.timeline && investigation.timeline.length > 0 ? (
              investigation.timeline.map((evt) => (
                <div key={evt.id} className="relative pl-5 pb-3 border-l border-slate-800 last:border-0">
                  <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-sky-500/20 border-2 border-sky-400"></div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                    <span className="font-semibold text-slate-200">{evt.event_type}</span>
                    <span className="font-mono">{new Date(evt.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500">No timeline events recorded.</div>
            )}
          </div>
        </div>

        {/* Analyst Notes */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>Analyst Notes & Findings</span>
            </h2>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {investigation.notes && investigation.notes.length > 0 ? (
                investigation.notes.map((n) => (
                  <div key={n.id} className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-sky-400">{n.author}</span>
                      <span className="font-mono">{new Date(n.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{n.note}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">No notes recorded yet.</div>
              )}
            </div>
          </div>

          {/* Add note input */}
          <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-800">
            <textarea
              rows={2}
              required
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Record investigator observation, triage action, or hypothesis..."
              className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={submittingNote}
              className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingNote ? 'Saving...' : 'Add Note to Dossier'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Investigation Dossier?"
        message={`Are you sure you want to permanently delete case ${investigation.case_id} ("${investigation.title}")? All associated IOCs, timeline events, and notes will be permanently removed.`}
        confirmText="Yes, Delete Case"
        isDestructive={true}
        onConfirm={handleDeleteCase}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
