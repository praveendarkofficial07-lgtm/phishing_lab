from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "saved_models"
REPORTS_DIR = BASE_DIR / "reports_generated"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/phishing_lab.db")
MODEL_PATH = MODELS_DIR / "phishing_classifier.joblib"
VECTORIZER_PATH = MODELS_DIR / "phishing_vectorizer.joblib"
DATASET_PATH = DATA_DIR / "phishing_training_data.csv"

# Configuration constants
APP_TITLE = "AI-Powered Phishing Investigation Lab"
APP_VERSION = "1.0.0"
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "*"
]
