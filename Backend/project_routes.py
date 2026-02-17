from fastapi import APIRouter
from projects_info import insert_project
from database import get_conn

router = APIRouter()


# --- Fetch all projects ---
@router.get("/projects")
def fetch_projects():
    try:
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
    except Exception as e:
        print(f"[/projects] Error: {str(e)}")
        raise


# --- Fixed Errors Summary Endpoint ---
@router.get("/fixed_errors_summary")
def fixed_errors_summary(project_id: int):
    """
    Returns total fixed errors per system prompt and model for a given project.
    """
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT
                c.model,
                c.system_prompt,
                COUNT(e.error_id) AS total_fixed_errors
            FROM configuration c
            LEFT JOIN error_records e
                ON c.configuration_id = e.configuration_id
                AND e.was_fixed = TRUE
            WHERE c.project_id = %s
            GROUP BY c.model, c.system_prompt
            ORDER BY total_fixed_errors DESC
        """, (project_id,))
        rows = cur.fetchall()
        cur.close()

        return [
            {
                "model": r[0],
                "system_prompt": r[1],
                "total_fixed_errors": r[2]
            }
            for r in rows
        ]
    finally:
        conn.close()
