from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import upload_ai_data
from project_routes import router as project_router  # New projects router
from dotenv import load_dotenv
from pathlib import Path
from database import get_conn
import get_ai_data

# Load environment variables
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# Create app ONCE
app = FastAPI(title="Backend API")

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
app.include_router(project_router)      # New projects endpoint

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

