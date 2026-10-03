import {
  DashboardStats,
  Investigation,
  InvestigationListItem,
  FullAnalysisResponse,
  URLAnalysisResult,
  HeaderAnalysisResult,
  ExtractedIOC,
  SampleCase,
  CaseStatus
} from '../types';

const API_BASE = 'http://localhost:8000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'Network request failed';
    try {
      const err = await res.json();
      errorDetail = err.detail || JSON.stringify(err);
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Dashboard & Metrics
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    return handleResponse<DashboardStats>(res);
  },

  // Investigations
  async getInvestigations(risk?: string, status?: string, search?: string): Promise<InvestigationListItem[]> {
    const params = new URLSearchParams();
    if (risk && risk !== 'ALL') params.append('risk', risk);
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/investigations?${params.toString()}`);
    return handleResponse<InvestigationListItem[]>(res);
  },

  async getInvestigation(id: number | string): Promise<Investigation> {
    const res = await fetch(`${API_BASE}/investigations/${id}`);
    return handleResponse<Investigation>(res);
  },

  async createInvestigation(data: any): Promise<Investigation> {
    const res = await fetch(`${API_BASE}/investigations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Investigation>(res);
  },

  async updateInvestigationStatus(id: number | string, status: CaseStatus): Promise<{ message: string; new_status: string }> {
    const res = await fetch(`${API_BASE}/investigations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse<{ message: string; new_status: string }>(res);
  },

  async deleteInvestigation(id: number | string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/investigations/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(res);
  },

  async addNote(id: number | string, note: string, author: string = 'Security Analyst'): Promise<any> {
    const res = await fetch(`${API_BASE}/investigations/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, note }),
    });
    return handleResponse(res);
  },

  async addTimelineEvent(id: number | string, event_type: string, description: string): Promise<any> {
    const res = await fetch(`${API_BASE}/investigations/${id}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type, description }),
    });
    return handleResponse(res);
  },

  async addEvidence(id: number | string, evidence: { name: string; item_type: string; value: string; description: string; sha256?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/investigations/${id}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evidence),
    });
    return handleResponse(res);
  },

  async downloadReport(id: number | string, caseId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/investigations/${id}/report`);
    if (!res.ok) {
      throw new Error('Failed to generate PDF report from server.');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseId}_Investigation_Report.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // IOCs
  async getAllIOCs(iocType?: string, search?: string): Promise<ExtractedIOC[]> {
    const params = new URLSearchParams();
    if (iocType && iocType !== 'ALL') params.append('ioc_type', iocType);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/iocs?${params.toString()}`);
    return handleResponse<ExtractedIOC[]>(res);
  },

  // Standalone Analyzers
  async analyzeCase(data: any): Promise<FullAnalysisResponse> {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<FullAnalysisResponse>(res);
  },

  async analyzeURL(url: string): Promise<URLAnalysisResult> {
    const res = await fetch(`${API_BASE}/analyze/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return handleResponse<URLAnalysisResult>(res);
  },

  async analyzeHeaders(raw_headers: string): Promise<HeaderAnalysisResult> {
    const res = await fetch(`${API_BASE}/analyze/headers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_headers }),
    });
    return handleResponse<HeaderAnalysisResult>(res);
  },

  async extractIOCs(text: string): Promise<ExtractedIOC[]> {
    const res = await fetch(`${API_BASE}/extract-iocs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return handleResponse<ExtractedIOC[]>(res);
  },

  // Sample Cases & Settings
  async getSampleCases(): Promise<SampleCase[]> {
    const res = await fetch(`${API_BASE}/sample-cases`);
    return handleResponse<SampleCase[]>(res);
  },

  async getModelInfo(): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/model`);
    return handleResponse(res);
  },

  async retrainModel(): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/retrain`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async resetSampleCases(): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/reset-samples`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
