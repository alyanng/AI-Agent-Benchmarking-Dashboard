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
        configuration_id
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
            "high-quality-errors":row[1],
            "error":row[2],
            "configid":row[3],
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
        error = d.get("error")

        if config not in configs:
            configs[config] = []
        configs[config].append(error)

    #creates list
    std_devs = []
    for config, errors in configs.items():
        if len(errors) > 1:
           std_dev = statistics.stdev(errors)
           std_devs.append({
               "configid":config,
               "std_dev":std_dev
            })
           
        else:
            std_devs.append({
                "configid":config,
                "std_dev":0
            })
    return std_devs
      

        # If standard dev is < 0.5 = high stablility, > 3 = low stability