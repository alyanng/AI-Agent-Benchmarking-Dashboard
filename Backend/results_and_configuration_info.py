import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

#Connects to the database
def connect_to_db():
    """Create database connection with environment variables."""
    conn = psycopg2.connect(
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD")
    )
    return conn

#Inserts a configuration into the database
def insert_configurations(system_prompt, model, project_id):
    """
    Insert a configuration into the database.
    
    Args:
        system_prompt: The system prompt text
        model: The AI model name
        project_id: The project ID to associate with
        
    Returns:
        int: The ID of the inserted configuration
        
    Raises:
        ValueError: If required parameters are missing
        psycopg2.Error: If database operation fails
    """
    if project_id is None:
        raise ValueError("project_id is required for insert_configurations")
    
    conn = None
    cur = None
    try:
        conn = connect_to_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO configuration (system_prompt, model, project_id) VALUES (%s, %s, %s) RETURNING configuration_ID;",
            (system_prompt, model, project_id)
        )
        config_id = cur.fetchone()[0]
        conn.commit()
        return config_id
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        raise psycopg2.Error(f"Failed to insert configuration: {str(e)}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

#Inserts a result into the database
def insert_fixes(number_of_fixes, duration, tokens, project_id, config_id):
    """
    Insert a result/fix record into the database.
    
    Args:
        number_of_fixes: Number of fixes applied
        duration: Duration in minutes
        tokens: Number of tokens used
        project_id: The project ID
        config_id: The configuration ID
        
    Raises:
        ValueError: If required parameters are missing
        psycopg2.Error: If database operation fails
    """
    if project_id is None or config_id is None:
        raise ValueError("project_id and config_id are required for insert_fixes")
    
    conn = None
    cur = None
    try:
        conn = connect_to_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO results (number_of_fixes, duration, tokens, project_id, configuration_id) VALUES (%s, %s, %s, %s, %s) RETURNING results_id;",
            (number_of_fixes, duration, tokens, project_id, config_id)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        print(f"Inserted row with result_id {new_id}")
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        print(f"Error inserting fixes: {str(e)}")
        raise psycopg2.Error(f"Failed to insert fixes: {str(e)}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

#Fetches configurations of a project from database and returns it as an array
def get_config_results(project_id):
    """
    Fetch all configurations and results for a project.
    
    Args:
        project_id: The project ID to fetch data for
        
    Returns:
        list: Array of configuration and result dictionaries
        
    Raises:
        ValueError: If project_id is missing
        psycopg2.Error: If database query fails
    """
    if project_id is None:
        raise ValueError("project_id is required for get_config_results")
    
    conn = None
    cur = None
    try:
        conn = connect_to_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT 
                c.configuration_ID,
                c.system_prompt,
                c.model,
                r.number_of_fixes,
                r.duration,
                r.high_quality_errors,
                r.detected_errors,
                r.results_id,
                AVG(r.high_quality_errors) OVER (PARTITION BY c.configuration_ID) as avg_hq_errors,
                AVG(r.detected_errors) OVER (PARTITION BY c.configuration_ID) as avg_detected_errors
            FROM configuration c
            INNER JOIN results r ON c.configuration_ID = r.configuration_id
            WHERE c.project_id = %s
            ORDER BY r.results_id 
            """,
            (project_id,)
        )
        rows = cur.fetchall()

        configAndResults = []
        for row in rows:
            configAndResults.append({
                "configid": row[0],
                "prompt": row[1] or "",
                "model": row[2],
                "fixes": row[3],
                "duration": row[4],
                "high_quality_errors": row[5],
                "detected_errors": row[6],
                "results_id": row[7],
                "avg_hq_errors": row[8],
                "avg_detected_errors": row[9]
            })
        return configAndResults
    except psycopg2.Error as e:
        print(f"Error fetching config results: {str(e)}")
        raise psycopg2.Error(f"Failed to fetch configuration results: {str(e)}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def insert_new_system_prompts(projectid: int, prompt):
    """
    Insert a new system prompt configuration for a project.
    
    Args:
        projectid: The project ID
        prompt: The system prompt text
        
    Returns:
        int: The ID of the inserted configuration
        
    Raises:
        ValueError: If required parameters are missing
        psycopg2.Error: If database operation fails
    """
    if projectid is None:
        raise ValueError("projectid is required for insert_new_system_prompts")
    
    conn = None
    cur = None
    try:
        conn = connect_to_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO configuration (system_prompt, project_id) VALUES (%s, %s) RETURNING configuration_ID;",
            (prompt, projectid)
        )
        config_id = cur.fetchone()[0]
        conn.commit()
        return config_id
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        raise psycopg2.Error(f"Failed to insert new system prompt: {str(e)}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
