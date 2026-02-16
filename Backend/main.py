from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import upload_ai_data
from project_routes import router as project_router  # New projects router
from dotenv import load_dotenv
from pathlib import Path
from database import get_conn
import get_ai_data
from mcp import mcp_router

# Load environment variables
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# Create app ONCE
app = FastAPI(title="Backend API")

# Helper function to safely convert to int
def safe_int(value):
    """Convert value to int, return 0 if null or invalid"""
    if value is None:
        return 0
    try:
        return int(value)
    except (ValueError, TypeError):
        return 0

# Define CORS allowed origins
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

# Add CORS middleware IMMEDIATELY after app creation
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # allowed frontend origins
    allow_credentials=True,
    allow_methods=["*"],          # allow all HTTP methods
    allow_headers=["*"],          # allow all headers
)

# Include routers
app.include_router(upload_ai_data.router)
app.include_router(get_ai_data.router)
app.include_router(project_router)      # Projects endpoint
app.include_router(mcp_router.router)

# =============================================
# Endpoint: Get detected errors from results table
# =============================================
@app.get("/api/results/detected_errors")
def get_detected_errors(limit: int = 50):
    """
    Fetch detected errors from results table.
    Returns data sorted oldest to newest (reversed from query order).
    """
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        # Query results table ordered by result_id DESC
        cur.execute("""
            SELECT detected_errors
            FROM results
            ORDER BY results_id DESC
            LIMIT %s;
        """, (limit,))
        
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        # Reverse to show oldest to newest
        rows = list(reversed(rows))
        
        # Format for chart: convert null values to 0, create x-axis index
        result = [
            {
                "x": idx + 1,
                "detected_errors": safe_int(row[0])
            }
            for idx, row in enumerate(rows)
        ]
        
        return result
    except Exception as e:
        print(f"[/api/results/detected-errors] Error: {str(e)}")
        return {"error": str(e)}


# =============================================
# Endpoint: Get high quality errors from results table
# =============================================
@app.get("/api/results/high_quality_errors")
def get_high_quality_errors(limit: int = 50):
    """
    Fetch high quality errors from results table.
    Returns data sorted oldest to newest (reversed from query order).
    """
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        # Query results table ordered by result_id DESC
        cur.execute("""
            SELECT high_quality_errors
            FROM results
            ORDER BY results_id DESC
            LIMIT %s;
        """, (limit,))
        
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        # Reverse to show oldest to newest
        rows = list(reversed(rows))
        
        # Format for chart: convert null values to 0, create x-axis index
        result = [
            {
                "x": idx + 1,
                "high_quality_errors": safe_int(row[0])
            }
            for idx, row in enumerate(rows)
        ]
        
        return result
    except Exception as e:
        print(f"[/api/results/high_quality_errors] Error: {str(e)}")
        return {"error": str(e)}


# Endpoint to list error records, optionally filtered by configuration_id
@app.get("/api/errors")
def list_errors(configuration_id: int = None):
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        if configuration_id is not None:
            cur.execute("""
                SELECT error_id, error_type, was_fixed, project_id, configuration_id
                FROM error_records
                WHERE configuration_id = %s
                ORDER BY error_id
            """, (configuration_id,))
        else:
            cur.execute("""
                SELECT error_id, error_type, was_fixed, project_id, configuration_id
                FROM error_records
                ORDER BY error_id
            """)
        
        rows = cur.fetchall()
        cur.close()
        conn.close()

        return [
            {
                "error_id": r[0],
                "error_type": r[1],
                "was_fixed": r[2],
                "project_id": r[3],
                "configuration_id": r[4]
            }
            for r in rows
        ]
    except Exception as e:
        print(f"[/api/errors] Error: {str(e)}")
        raise

