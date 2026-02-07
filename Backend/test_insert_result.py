import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv("POSTGRES_HOST"),
    port=os.getenv("POSTGRES_PORT"),
    dbname=os.getenv("POSTGRES_DB"),
    user=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD")
)

print("HOST:", os.getenv("POSTGRES_HOST"))
print("USER:", os.getenv("POSTGRES_USER"))
print("PASSWORD:", os.getenv("POSTGRES_PASSWORD"))

cur = conn.cursor()
cur.execute(
    "INSERT INTO results (number_of_fixes, duration, tokens, project_id) VALUES (%s, %s, %s, %s) RETURNING results_id;",
    (3, 12.5, 450, 1)
)
new_id = cur.fetchone()[0]
conn.commit()
cur.close()
conn.close()

print(f"✅ Inserted test row with result_id {new_id}")
