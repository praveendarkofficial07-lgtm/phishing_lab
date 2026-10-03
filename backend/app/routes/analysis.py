from fastapi import APIRouter, HTTPException
from backend.app.schemas.analysis import (
    FullAnalysisRequest,
    FullAnalysisResponse,
    URLAnalyzeRequest,
    URLAnalysisResult,
    HeadersAnalyzeRequest,
    HeaderAnalysisResult,
    IOCExtractRequest,
    ExtractedIOC
)
from backend.app.services.pipeline import run_investigation_pipeline
from backend.app.analyzers.url_analyzer import analyze_url
from backend.app.analyzers.header_analyzer import analyze_headers
from backend.app.analyzers.ioc_extractor import extract_all_iocs
from backend.app.services.sample_data import SAMPLE_CASES

router = APIRouter(prefix="/api", tags=["Analysis Engine"])

@router.post("/analyze", response_model=FullAnalysisResponse)
def analyze_phishing_case(req: FullAnalysisRequest):
    """
    Executes the comprehensive analysis pipeline across email content,
    heuristics, URLs, RFC headers, IOCs, and ML classifier.
    """
    try:
        return run_investigation_pipeline(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")

@router.post("/analyze/url", response_model=URLAnalysisResult)
def analyze_single_url(req: URLAnalyzeRequest):
    """
    Performs deep heuristic and threat pattern analysis on an individual URL.
    """
    if not req.url or not req.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty.")
    return analyze_url(req.url.strip())

@router.post("/analyze/headers", response_model=HeaderAnalysisResult)
def analyze_single_headers(req: HeadersAnalyzeRequest):
    """
    Parses and inspects raw email RFC 5322 headers for authentication and sender mismatches.
    """
    if not req.raw_headers or not req.raw_headers.strip():
        raise HTTPException(status_code=400, detail="Headers cannot be empty.")
    return analyze_headers(req.raw_headers)

@router.post("/extract-iocs", response_model=list[ExtractedIOC])
def extract_iocs_endpoint(req: IOCExtractRequest):
    """
    Extracts Indicators of Compromise (URLs, Domains, IPs, Emails, Hashes) from raw text.
    """
    return extract_all_iocs(req.text)

@router.get("/sample-cases")
def get_sample_cases():
    """
    Returns the synthetic academic demonstration cases clearly marked for training.
    """
    return SAMPLE_CASES
