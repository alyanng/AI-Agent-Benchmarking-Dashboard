from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

# -------------------------------
# Load environment variables
# -------------------------------
load_dotenv()  # Reads .env file

DB_CONFIG = {
    'host': os.getenv("POSTGRES_HOST"),
    'port': int(os.getenv("POSTGRES_PORT")),  # psycopg2 expects int
    'dbname': os.getenv("POSTGRES_DB"),
    'user': os.getenv("POSTGRES_USER"),
    'password': os.getenv("POSTGRES_PASSWORD")
}

# Function to get a DB connection
def get_conn():
    return psycopg2.connect(**DB_CONFIG)

# -------------------------------
# Create FastAPI app
# -------------------------------
app = FastAPI(title="Backend API")

# CORS setup: allow React frontend and Swagger UI
origins = [
    "http://localhost:5173",  # Vite frontend
    "http://localhost:5174",  # fallback port
    "http://127.0.0.1:8000",  # Swagger UI
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Test endpoints
# -------------------------------
@app.get("/users")
def get_users():
    return [
        {"id": 1, "name": "Alice"},
        {"id": 2, "name": "Bob"},
    ]

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.get("/hello")
def hello(name: str = "world"):
    return {"message": f"Hello, {name}!"}

# -------------------------------
# Add project endpoint
# -------------------------------
@app.post("/projects")
async def add_project(project: dict):
    required_keys = ["project_name", "github_url", "number_of_errors"]
    if not all(k in project for k in required_keys):
        raise HTTPException(status_code=400, detail="Missing required fields")

    try:
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)  # Return dict instead of tuple
        # Use double quotes for Projects table because of capital P
        cur.execute(
            'INSERT INTO "Projects" (project_name, github_url, number_of_errors) VALUES (%s, %s, %s) RETURNING project_id;',
            (project["project_name"], project["github_url"], project["number_of_errors"])
        )
        new_row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return {"project_id": new_row["project_id"], "message": "Project added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------
# Get all projects endpoint
# -------------------------------
@app.get("/projects")
async def get_projects():
    try:
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            'SELECT project_id, project_name, github_url, number_of_errors FROM "Projects" ORDER BY project_id;'
        )
        projects = cur.fetchall()
        cur.close()
        conn.close()
        return {"projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
