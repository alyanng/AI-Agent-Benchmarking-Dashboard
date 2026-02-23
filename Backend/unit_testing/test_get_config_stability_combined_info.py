import pytest
import psycopg2
import os
from dotenv import load_dotenv
from results_and_configuration_info import get_config_results
from stability_info import get_stability_results, calculate_stability
from combined_info import get_all_results_data, calculate_averages

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


def create_test_configuration(project_id, prompt="test prompt", model="gpt-4"):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO configuration (system_prompt, model, project_id) VALUES (%s, %s, %s) RETURNING configuration_id;",
        (prompt, model, project_id)
    )
    config_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return config_id


def create_test_result(project_id, config_id, fixes=3, duration=60, tokens=100, high_quality_errors=2, detected_errors=5):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO results (number_of_fixes, duration, tokens, project_id, configuration_id, high_quality_errors, detected_errors) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING results_id;",
        (fixes, duration, tokens, project_id, config_id, high_quality_errors, detected_errors)
    )
    result_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return result_id

class TestGetConfigResults:

    #Checks to see each item in list has correct keys
    def test_returns_correct_keys(self):
        project_id = create_test_project()
        config_id = create_test_configuration(project_id)
        result_id = create_test_result(project_id, config_id)
        result = get_config_results(project_id)

        assert len(result) > 0
        item = result[0]
        expected_keys = {"configid", "prompt", "model", "fixes", "duration",
                        "high_quality_errors", "detected_errors", "results_id",
                        "avg_hq_errors", "avg_detected_errors"}
        assert expected_keys.issubset(item.keys())

    #Checks to see each item in list has correct value of what was inserted
    def test_returns_correct_values(self):
        project_id = create_test_project()
        config_id = create_test_configuration(project_id, prompt="my prompt", model="gpt-4")
        result_id = create_test_result(project_id, config_id, fixes=5, duration=90,
                                       high_quality_errors=3, detected_errors=7)
        result = get_config_results(project_id)

        item = result[0]
        assert item["prompt"] == "my prompt"
        assert item["model"] == "gpt-4"
        assert item["fixes"] == 5
        assert item["duration"] == 90
        assert item["high_quality_errors"] == 3
        assert item["detected_errors"] == 7

class TestGetStabilityResults:
    #Checks if each item in list has correct keys
    def test_returns_correct_keys(self):
        project_id = create_test_project()
        config_id = create_test_configuration(project_id)
        result_id = create_test_result(project_id, config_id)
        result = get_stability_results(project_id)
       
        assert len(result) > 0
        assert "configid" in result[0]
        assert "std_dev" in result[0]

    #Checks stdev is zero when only 1 entry of errors for a system prompt
    def test_single_entry_returns_zero(self):
        data = [{"configid": 1, "error": 5, "fixes": 2, "high-quality-errors": 1}]
        result = calculate_stability(data)
        assert result[0]["std_dev"] == 0

    #Checks stdev is non-zero when more than 1 entries of errors for a system prompt
    def test_different_errors_return_nonzeron(self):
        data = [
            {"configid": 1, "error": 2, "fixes": 1, "high-quality-errors": 1},
            {"configid": 1, "error": 8, "fixes": 1, "high-quality-errors": 1},
        ]
        result = calculate_stability(data)
        assert result[0]["std_dev"] > 0

    #Checks that when multiple system prompts are entered, the list contains the same amount
    def test_multiple_systemprompts_returned_seperatetly(self):
        data = [
            {"configid": 1, "error": 3, "fixes": 1, "high-quality-errors": 1},
            {"configid": 2, "error": 5, "fixes": 2, "high-quality-errors": 2},
        ]
        result = calculate_stability(data)
        assert len(result) == 2

class TestGetAllResultsData:

    #Checks averages is calculated across keys for same system prompt
    def test_averages_calculated(self):
        project_id = create_test_project()
        config_id = create_test_configuration(project_id)
        result_id_1 = create_test_result(project_id, config_id, fixes=2, duration=40,
                                          high_quality_errors=1, detected_errors=3)
        result_id_2 = create_test_result(project_id, config_id, fixes=4, duration=80,
                                          high_quality_errors=3, detected_errors=7)
        result = get_all_results_data(project_id)
        item = next(r for r in result if r["configid"] == config_id)
        assert item["fixes"] == 3.0       
        assert item["time"] == 60.0      
        assert item["errors"] == 5.0     
        assert item["high-quality"] == 2.0  