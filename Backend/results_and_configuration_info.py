import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

#Connects to the database
def connect_to_db():
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
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO configuration (system_prompt, model, project_id) VALUES (%s, %s, %s) RETURNING configuration_ID;",
        (system_prompt, model, project_id)
    )
    config_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return config_id

#Inserts a result into the database
def insert_fixes(number_of_fixes, duration, tokens, project_id, config_id):
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO results (number_of_fixes, duration, tokens, project_id, configuration_id) VALUES (%s, %s, %s, %s, %s) RETURNING results_id;",
        (number_of_fixes, duration, tokens, project_id, config_id)
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    print(f"Inserted row with result_id {new_id}")

#Fetches configurations of a project from database and returns it as an array
def get_config_results(project_id):
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

    configAndResults =[]
    for row in rows:
        configAndResults.append({
            "configid": row[0],
            "prompt":row[1] or "",
            "model": row[2],
            "fixes":row[3],
            "duration": row[4],
            "high_quality_errors":row[5],
            "detected_errors":row[6],
            "results_id":row[7],
            "avg_hq_errors": row[8],
            "avg_detected_errors":row[9]
        })
    cur.close()
    conn.close()
    return configAndResults
    
    

