"""
Main FastAPI Application Entrypoint for SurgeShield AI.
Integrates API routers, database connection health checks, CORS middleware, and Swagger documentation (/docs).
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from backend.app.core.config import settings
from backend.app.schemas.response import HealthResponse
from backend.app.db.database import check_db_connection
from backend.app.api.predict import router as predict_router
from backend.app.api.analyze import router as analyze_router
from backend.app.api.surge import router as surge_router
from backend.app.api.transactions import router as transactions_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.risk_summary import router as risk_summary_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("surgeshield.app")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "SurgeShield AI is an adaptive real-time banking fraud intelligence system. "
        "Distinguishes high-volume legitimate transaction surges from coordinated fraudulent activity. "
        "Features an integrated MySQL persistent storage layer."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", include_in_schema=False)
def root_redirect():
    """Redirect root path to interactive Swagger API documentation."""
    return RedirectResponse(url="/docs")


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["System Health"],
    summary="Check System & MySQL Database Health Status"
)
def health_check():
    """
    Returns service health and MySQL database connection status.
    Tests active connectivity without exposing database credentials or internal secrets.
    """
    db_check = check_db_connection()
    db_status = db_check.get("status", "disconnected")
    
    overall_status = "healthy" if db_status == "connected" else "degraded"
    
    return HealthResponse(
        status=overall_status,
        service="SurgeShield AI",
        database=db_status
    )


# Include API Routers
app.include_router(predict_router)
app.include_router(analyze_router)
app.include_router(transactions_router)
app.include_router(dashboard_router)
app.include_router(risk_summary_router)
app.include_router(surge_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
