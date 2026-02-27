import os
import json
import argparse
from dotenv import load_dotenv
import psycopg2
from dataclasses import dataclass
from pathlib import Path
from database import get_conn

@dataclass
class ErrorRecord:
    error_id: str
    error_type: str
    was_fixed: bool
    project_id: str
    config_id: int
    run_time : int

from database import get_conn

def save_error_records(errors: list, project_id = None, config_id: int = None, run_time : int=None) -> int:
    """
    Save error records into postgres.
    Returns number of newly inserted rows.
    """
    conn = get_conn()
    inserted = 0

    try:
        with conn:
            with conn.cursor() as cur:
                for e in errors:
                    error_name = e.get("error_id")
                    error_type = e.get("error_type")
                    was_fixed = e.get("was_fixed", False)
                    configuration_id = config_id
        
                    print(f"Inserting: error_name={error_name}, error_type={error_type}")  
                    if not error_name or not error_type:
                        continue

                    cur.execute(
                        """
                        INSERT INTO error_records
                        (error_name, error_type, was_fixed, project_id, configuration_id,run_time)
                        VALUES (%s, %s, %s, %s, %s,%s)
                        """,
                        (str(error_name), str(error_type), bool(was_fixed), int(project_id) if project_id else None, configuration_id, int(run_time) if run_time else None)
                    )

                    if cur.rowcount == 1:
                        inserted += 1
                        print(f"Insert successful, rowcount={cur.rowcount}") 
                    else:
                        print(f"Insert failed, rowcount={cur.rowcount}") 
    finally:
        conn.close()

    return inserted


def load_input_json(json_path: Path) -> dict:
    if not json_path.exists():
        raise FileNotFoundError(f"JSON file not found: {json_path}")
    with json_path.open("r", encoding="utf-8") as f:
        return json.load(f)

def main():
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=env_path)
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--json",
        default="user-service-debugging-report-2026-02-05.json",
        help="Path to input JSON file (default: input.json)"
    )
    

    parser.add_argument(
    "--config-id",
    type=int,
    default=None,
    help="configuration_id to link error_records to (optional)"
    )
    args = parser.parse_args()


    json_path = Path(args.json).expanduser().resolve()
    input_json = load_input_json(json_path)

    errors = input_json.get("errors", [])
    config_id = args.config_id  

    
    inserted = save_error_records(errors, project_id="1", config_id=config_id)
    print(f"Inserted {inserted} error records.")

if __name__ == "__main__":
    main()

