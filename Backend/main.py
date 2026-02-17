from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path

# Import your routers
import upload_ai_data
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
