from database import get_conn 

def insert_project(project_name, github_url, number_of_errors):
    """
    Insert a project into the 'projects' table and return its project_id.
    """
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO projects (project_name, github_url, number_of_errors)
        VALUES (%s, %s, %s)
        RETURNING project_id;
        """,
        (project_name, github_url, number_of_errors)
    )
    project_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return project_id
