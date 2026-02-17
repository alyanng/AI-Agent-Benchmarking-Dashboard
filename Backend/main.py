from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path

# Import your routers
import upload_ai_data
import get_ai_data
from project_routes import router as project_router  # Projects router

from database import get_conn

# -----------------------------------
# Load environment variables
# -----------------------------------
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# -----------------------------------
# Create FastAPI app
# -----------------------------------
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
# -----------------------------------
# CORS settings
# -----------------------------------
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       
    allow_credentials=True,
    allow_methods=["*"],         
    allow_headers=["*"],         
)

# -----------------------------------
# Include routers
# -----------------------------------
app.include_router(upload_ai_data.router)
app.include_router(get_ai_data.router)
app.include_router(project_router)      # Projects endpoint

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
    


# =============================================
# Endpoint: Compare ai models
# =============================================
@app.get("/api/results/compare_ai_models")
def compare_ai_models(project_id: int, limit: int = 50):
    """
    Compare runs across AI models for one project.
    Returns oldest -> newest.
    """
    try:
        conn = get_conn()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT
                r.results_id,
                c.model,
                r.number_of_fixes,
                r.duration,
                r.tokens,
                r.created_at
            FROM results r
            JOIN configuration c
              ON r.project_id = c.project_id
             AND r.configuration_id = c.configuration_id
            WHERE r.project_id = %s
            ORDER BY r.results_id DESC
            LIMIT %s;
            """,
            (project_id, limit)
        )

        rows = cur.fetchall()
        cur.close()
        conn.close()

        # oldest -> newest
        rows.reverse()

        result = []
        for idx, (results_id, model, number_of_fixes, duration, tokens, created_at) in enumerate(rows):
            result.append({
                "x": idx + 1,
                "results_id": safe_int(results_id),
                "model": model,
                "number_of_fixes": safe_int(number_of_fixes),
                "duration": float(duration) if duration is not None else 0.0,
                "tokens": safe_int(tokens),
                "created_at": created_at.isoformat() if created_at else None,
            })

        return result

    except Exception as e:
        print(f"[/api/results/compare_ai_models] Error: {str(e)}")
        return {"error": str(e)}



app.include_router(project_router)

# -----------------------------------
# Endpoint: list error records
# -----------------------------------
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

# -----------------------------------
# Endpoint: get project-level performance data
# -----------------------------------
@app.get("/get_performance_data")
def get_performance_data(project_id: int):
    """
    Returns average performance metrics per prompt (configuration) for a project.
    Each point in the chart = one prompt with averaged number of fixes and duration.
    """
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                configuration_id,
                AVG(number_of_fixes) AS avg_fixes,
                AVG(duration) AS avg_duration
            FROM results
            WHERE project_id = %s
            GROUP BY configuration_id
            ORDER BY configuration_id
        """, (project_id,))
        
        rows = cur.fetchall()
        cur.close()
        conn.close()

        return [
            {
                "config_id": r[0],
                "fixes": r[1],
                "duration": r[2]
            }
            for r in rows
        ]

    except Exception as e:
        print(f"[/get_performance_data] Error: {str(e)}")
        return {"error": str(e)}
