from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import upload_ai_data
from dotenv import load_dotenv
from pathlib import Path
from database import get_conn
import get_ai_data

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)


app = FastAPI(title="Backend API")

origins = [
    "http://localhost:5173",
     "http://localhost:5174",
]


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # allowed frontend origins
    allow_credentials=True,
    allow_methods=["*"],          # allow all HTTP methods
    allow_headers=["*"],          # allow all headers
)


app.include_router(upload_ai_data.router)
app.include_router(get_ai_data.router)

@app.get("/api/errors")
def list_errors():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT error_id, error_type, was_fixed, project_id
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
        }
        for r in rows
    ]



