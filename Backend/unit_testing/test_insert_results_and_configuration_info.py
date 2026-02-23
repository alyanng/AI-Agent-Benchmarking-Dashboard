import pytest
import psycopg2
import os
from dotenv import load_dotenv
from results_and_configuration_info import insert_configurations, insert_fixes

load_dotenv()

def get_connection():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD")
    )

def create_test_project():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO projects (project_name, github_url, number_of_errors) VALUES (%s, %s, %s) RETURNING project_id;",
        ("test_project", "https://github.com/test/test", 0)
    )
    project_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return project_id

def fetch_configuration(config_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT configuration_id, system_prompt, model, project_id FROM configuration WHERE configuration_id = %s;",
        (config_id,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row

class TestInsertConfigurations:
        #Checks if configuration insert returns valid integer ID
        def test_returns_config_id(self):
            project_id = create_test_project()
            config_id = insert_configurations("You are helpful.", "gpt-4", project_id)
            assert isinstance(config_id, int)
            assert config_id > 0

        #Checks if configuration row exist in configuration table
        def test_check_configuration_row(self):
            project_id = create_test_project()
            config_id = insert_configurations("My system prompt", "gpt-4", project_id)
            row = fetch_configuration(config_id)
            assert row[1] == "My system prompt"   
            assert row[2] == "gpt-4"              
            assert row[3] == project_id  
        
        #Checks that it can store empy string prompt
        def test_handales_empty_prompt(self):
            project_id = create_test_project()
            config_id = insert_configurations("", "", project_id)
            row = fetch_configuration(config_id)
            assert row is not None

        #Checks that it can store null prompt
        def test_handles_null_prompt(self):
            project_id = create_test_project()
            config_id = insert_configurations(None, None, project_id)
            row = fetch_configuration(config_id)
            assert row[1] is None
             
class TestInsertFixes:

        #Checks inserted results row exist in database
        def test_row_exists_in_db(self):
            project_id = create_test_project()
            config_id = insert_configurations("prompt", "model", project_id)    
            insert_fixes(3, 45, 1200, project_id, config_id)

            conn = get_connection()
            cur = conn.cursor()
            cur.execute(
            "SELECT results_id FROM results WHERE project_id = %s AND configuration_id = %s;",
            (project_id, config_id)
            )
            row = cur.fetchone()
            if row:
                 result_id = row[0] 
            else:
                result_id = None
            cur.close()
            conn.close()
            assert row is not None
        
        #Checks results data are stored as it is in database
        def test_check_results_data(self):
            project_id = create_test_project()
            config_id = insert_configurations("prompt", "model", project_id)
            insert_fixes(
            number_of_fixes=5,
            duration=120,
            tokens=9999,
            project_id=project_id,
            config_id=config_id
            )

            conn = get_connection()
            cur = conn.cursor()
            cur.execute(
            "SELECT results_id, number_of_fixes, duration, tokens, project_id, configuration_id "
            "FROM results WHERE project_id = %s AND configuration_id = %s;",
            (project_id, config_id)
            )
            row = cur.fetchone()
            cur.close()
            conn.close()

            assert row[1] == 5       
            assert row[2] == 120     
            assert row[3] == 9999   
            assert row[4] == project_id
            assert row[5] == config_id

        #Checks if it can store zeros without error
        def test_handles_zero_values(self):
            project_id = create_test_project()
            config_id = insert_configurations("prompt", "model", project_id)
            insert_fixes(0, 0, 0, project_id, config_id)
            conn = get_connection()
            cur = conn.cursor()
            cur.execute(
            "SELECT results_id, number_of_fixes, duration, tokens FROM results "
            "WHERE project_id = %s AND configuration_id = %s;",
            (project_id, config_id)
            )
            row = cur.fetchone()
            cur.close()
            conn.close()

            assert row[1] == 0
            assert row[2] == 0
            assert row[3] == 0