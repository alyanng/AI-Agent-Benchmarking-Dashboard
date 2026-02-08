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

#Inserts a result into the database
def insert_fixes(number_of_fixes, duration, tokens, project_id):
    conn = connect_to_db
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO results (number_of_fixes, duration, tokens, project_id) VALUES (%s, %s, %s, %s) RETURNING results_id;",
        (number_of_fixes, duration, tokens, project_id)
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    print(f"Inserted row with result_id {new_id}")

#Fetches results of a project from database and returns it as an array
def get_results(project_id):
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("SELECT restuls_id, number_of_fixes, duration FROM results WHERE project_ID = %s ORDER BY results_id DESC"
    (project_id,)           
    ) 
    rows = cur.fetchall()

    results =[]
    for row in rows:
        results.append({
            "id": row[0],
            "fixes":row[1],
            "duration": row[2],
        })
    cur.close()
    conn.close()
    return results