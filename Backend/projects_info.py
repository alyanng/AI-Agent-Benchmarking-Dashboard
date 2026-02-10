from database import get_conn 

def insert_project(project_name, github_url, number_of_errors):
    """
    Ensure same github_url always maps to the same project_id.
    If the github_url already exists, return the existing project_id (do NOT insert).
    Otherwise insert a new row and return its project_id.
    """
    conn = get_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                # 1) try find existing project_id by github_url
                cur.execute(
                    """
                    SELECT project_id
                    FROM projects
                    WHERE github_url = %s
                    ORDER BY project_id
                    LIMIT 1
                    """,
                    (github_url,)
                )
                row = cur.fetchone()
                if row:
                    return row[0]

                # 2) not found -> insert new
                cur.execute(
                    """
                    INSERT INTO projects (project_name, github_url, number_of_errors)
                    VALUES (%s, %s, %s)
                    RETURNING project_id;
                    """,
                    (project_name, github_url, number_of_errors)
                )
                return cur.fetchone()[0]
    finally:
        conn.close()
