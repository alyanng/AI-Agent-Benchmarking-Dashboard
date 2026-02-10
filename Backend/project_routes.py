from fastapi import APIRouter, UploadFile, File
import json
from projects_info import insert_project
from database import get_conn 

router = APIRouter()

@router.get("/projects")
def fetch_projects():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT project_id, project_name, github_url, number_of_errors
        FROM projects
        ORDER BY project_id DESC
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return [
        {
            "project_id": row[0],
            "project_name": row[1],
            "github_url": row[2],
            "number_of_errors": row[3],
        }
        for row in rows
    ]
