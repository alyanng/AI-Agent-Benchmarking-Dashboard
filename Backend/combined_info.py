import os
from dotenv import load_dotenv
import psycopg2
import statistics
import math

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

#Gets all the data for the combined graph 
def get_all_results_data(project_id: int):
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute(
    """
    SELECT
        number_of_fixes,
        detected_errors,
        high_quality_errors,
        duration,
        configuration_id,
        results_id
    FROM results
    WHERE project_id = %s
    ORDER BY configuration_id ASC
    """,
    (project_id,)
    )
    rows = cur.fetchall()
    data=[]
    for row in rows:
        data.append({
            "fixes":row[0],
            "errors":row[1],
            "high-quality-errors":row[2],
            "time":row[3],
            "configid":row[4],
            "resultsid":row[5],
        })
    cur.close()
    conn.close()

    return calculate_averages(data)

def calculate_averages(data):
    config = {}
    for a in data:
        configid = a.get("configid")
        fixes = a.get("fixes")
        errors = a.get("errors")
        highQualityErrors = a.get("high-quality-errors")
        time = a.get("time")

        if configid not in config:
            config[configid] = {
                "fixes": [],
                "errors": [],
                "high-quality": [],
                "time": [],
            }
        config[configid]["fixes"].append(fixes)
        config[configid]["errors"].append(errors)
        config[configid]["high-quality"].append(highQualityErrors)
        config[configid]["time"].append(time)

    averages = []
    for configid, values in config.items():
        fix = statistics.mean(values["fixes"])
        error = statistics.mean(values["errors"])
        highQuality = statistics.mean(values["high-quality"])
        time = statistics.mean(values["time"])
        averages.append({
            "configid": configid,
            "fixes": fix,
            "errors": error,
            "high-quality": highQuality,
            "time": time
        })
    print(averages)
    return averages


