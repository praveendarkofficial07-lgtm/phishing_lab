export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CaseStatus = 'Open' | 'Investigating' | 'Contained' | 'Resolved' | 'False Positive';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type IOCType = 'URL' | 'Domain' | 'IP' | 'Email' | 'Hash' | 'File';

export interface ContentIndicator {
  indicator: string;
  evidence: string;
  severity: string;
  explanation: string;
  score_contribution: number;
}

export interface URLAnalysisResult {
  url: string;
  scheme: string;
  domain: string;
  subdomain: string;
  port?: string;
  path: string;
  query: string;
  fragment: string;
  is_ip_address: boolean;
  is_https: boolean;
  suspicious_tld: boolean;
  is_punycode: boolean;
  has_url_encoding: boolean;
  excessive_length: boolean;
  suspicious_keywords: string[];
  credential_related_path: boolean;
  redirect_like_params: boolean;
  has_at_symbol: boolean;
  risk_score: number;
  risk_level: RiskLevel;
  risk_indicators: string[];
  matched_brand?: string;
}

export interface HeaderAnalysisResult {
  from_header?: string;
  to_header?: string;
  reply_to?: string;
  return_path?: string;
  message_id?: string;
  date?: string;
  originating_ip?: string;
  received_hops_count: number;
  received_chain: string[];
  spf: string;
  dkim: string;
  dmarc: string;
  auth_summary: string;
  inconsistencies: string[];
  risk_score: number;
  risk_level: RiskLevel;
  findings: string[];
}

export interface ExtractedIOC {
  id?: number;
  investigation_id?: number;
  ioc_type: IOCType;
  value: string;
  risk_level: RiskLevel;
  context: string;
  first_seen?: string;
  last_seen?: string;
  case_id?: string;
  case_title?: string;
}

export interface AttachmentMetadata {
  filename: string;
  extension: string;
  sha256: string;
  mime_type: string;
  size_bytes?: number;
  is_executable_or_script: boolean;
  risk_level: RiskLevel;
  findings: string[];
}

export interface MLPredictionResult {
  phishing_probability: number;
  legitimate_probability: number;
  verdict: string;
  model_version: string;
  feature_importances: { feature: string; impact: number; phishing_correlated: boolean }[];
}

export interface RiskBreakdownFactor {
  category: string;
  factor: string;
  weight: number;
  description: string;
}

export interface RiskAssessment {
  total_score: number;
  risk_level: RiskLevel;
  factors: RiskBreakdownFactor[];
  ml_weight: number;
  rules_weight: number;
}

export interface ExplainabilityInsight {
  title: string;
  evidence_points: string[];
  verdict_explanation: string;
  recommended_mitigation: string[];
}

export interface FullAnalysisResponse {
  risk_score: number;
  risk_level: RiskLevel;
  ml_prediction: MLPredictionResult;
  content_indicators: ContentIndicator[];
  url_analysis: URLAnalysisResult[];
  header_analysis: HeaderAnalysisResult;
  extracted_iocs: ExtractedIOC[];
  attachments: AttachmentMetadata[];
  risk_breakdown: RiskAssessment;
  explainability: ExplainabilityInsight;
  recommended_actions: string[];
  analysis_summary: string;
}

export interface AnalystNote {
  id: number;
  investigation_id: number;
  author: string;
  note: string;
  created_at: string;
}

export interface TimelineEvent {
  id: number;
  investigation_id: number;
  event_type: string;
  description: string;
  timestamp: string;
}

export interface EvidenceItem {
  id: number;
  investigation_id: number;
  item_type: string;
  name: string;
  value: string;
  description: string;
  sha256: string;
  created_at: string;
}

export interface Investigation {
  id: number;
  case_id: string;
  title: string;
  analyst_name: string;
  description: string;
  priority: PriorityLevel;
  status: CaseStatus;
  sender: string;
  recipient: string;
  subject: string;
  email_date: string;
  reply_to: string;
  body_plain: string;
  body_html: string;
  raw_headers: string;
  risk_score: number;
  risk_level: RiskLevel;
  ml_probability: number;
  ml_verdict: string;
  analysis_summary: string;
  explainability: string[];
  indicators: ContentIndicator[];
  url_analysis: URLAnalysisResult[];
  header_analysis: HeaderAnalysisResult;
  attachment_info: AttachmentMetadata[];
  recommended_actions: string[];
  created_at: string;
  updated_at: string;
  iocs: ExtractedIOC[];
  notes: AnalystNote[];
  timeline: TimelineEvent[];
  evidence: EvidenceItem[];
}

export interface InvestigationListItem {
  id: number;
  case_id: string;
  title: string;
  analyst_name: string;
  priority: PriorityLevel;
  status: CaseStatus;
  sender: string;
  subject: string;
  risk_score: number;
  risk_level: RiskLevel;
  created_at: string;
  ioc_count: number;
}

export interface DashboardStats {
  total_investigations: number;
  critical_cases: number;
  high_risk_cases: number;
  medium_risk_cases: number;
  low_risk_cases: number;
  suspicious_urls_detected: number;
  iocs_extracted: number;
  recent_investigations: InvestigationListItem[];
  risk_distribution: { name: string; count: number; color: string }[];
  activity_timeline: { date: string; investigations: number }[];
}

export interface SampleCase {
  id: string;
  title: string;
  case_id_tag: string;
  category: string;
  analyst_name: string;
  priority: PriorityLevel;
  sender: string;
  recipient: string;
  subject: string;
  email_date: string;
  reply_to: string;
  body_plain: string;
  raw_headers: string;
  manual_urls: string[];
  attachments: any[];
}
