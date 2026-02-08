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
    conn = connect_to_db
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

#Fetches configurations of a project from database and returns it as an array
def get_configurations(project_id):
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("SELECT configuration_ID, system_prompt, model, project_id FROM configuration WHERE project_ID = %s ORDER BY configuration_ID DESC"
    (project_id,)           
    ) 
    rows = cur.fetchall()

    configurations =[]
    for row in rows:
        configurations.append({
            "id": row[0],
            "prompt":row[1] or "",
            "model": row[2],
        })
    cur.close()
    conn.close()
    return configurations
    
    

