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
#Gets data necessary for showing stability graph from db
def get_stability_results(project_id):
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute(
    """
    SELECT  
        number_of_fixes,
        high_quality_errors,
        detected_errors,
        configuration_id,
        false_positives
    FROM results
    WHERE project_id = %s
    AND NOT (
    run_time = 0
    )
    ORDER BY configuration_id ASC
    """,
    (project_id,)
    )
    rows = cur.fetchall()

    data=[]
    for row in rows:
        data.append({
            "fixes":row[0],
            "high-quality-errors":row[1],
            "error":row[2],
            "configid":row[3],
            "false-positives":row[4]
        })
    cur.close()
    conn.close()
    print(calculate_stability(data))
    return calculate_stability(data)

#Calculates stability from data
def calculate_stability(data):
    #creates dictionary
    configs = {}
    for d in data:
        config = d.get("configid")
        false_positives = d.get("false-positives")

        if config not in configs:
            configs[config] = []
        configs[config].append(false_positives)

    #creates list
    std_devs = []
    for config, false_positives in configs.items():
        if len(false_positives) > 1:
           std_dev = statistics.stdev(false_positives)
           std_devs.append({
               "configid":config,
               "std_dev":std_dev
            })
           
        # else:
        #     std_devs.append({
        #         "configid":config,
        #         "std_dev":0
        #     })
    return std_devs
      

        # If standard dev is < 0.5 = high stablility, > 3 = low stability