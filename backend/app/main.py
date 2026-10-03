from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import APP_TITLE, APP_VERSION, CORS_ORIGINS
from backend.app.database import init_db, SessionLocal
from backend.app.routes import analysis, investigations, dashboard
from backend.app.services.ml_engine import ml_service
from backend.app.services.sample_data import seed_sample_cases_if_empty

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("phishing_lab")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup:
    logger.info("Initializing Phishing Investigation Lab database...")
    init_db()

    # Train or verify ML model
    logger.info("Verifying ML classification engine...")
    if not ml_service.is_loaded:
        ml_service.train_model()

    # Seed demonstration cases if database is fresh
    logger.info("Checking sample demonstration cases...")
    db = SessionLocal()
    try:
        seed_sample_cases_if_empty(db)
    except Exception as e:
        logger.error(f"Error seeding demo cases: {e}")
    finally:
        db.close()

    logger.info("Phishing Investigation Lab backend is ready.")
    yield
    logger.info("Shutting down Phishing Investigation Lab backend.")

app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description="Defensive Cybersecurity Incident Investigation Platform with Machine Learning & Heuristics",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(investigations.router)
app.include_router(analysis.router)
app.include_router(dashboard.router)

@app.get("/")
def root_endpoint():
    return {
        "name": APP_TITLE,
        "version": APP_VERSION,
        "status": "Operational",
        "docs_url": "/docs",
        "mode": "Defensive Analysis (Local-only, No external API keys required)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
