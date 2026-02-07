import os
import json
import argparse
from dotenv import load_dotenv
import psycopg2
from dataclasses import dataclass
from pathlib import Path

@dataclass
class ErrorRecord:
    error_id: str
    error_type: str
    was_fixed: bool
    project_id: str

def load_input_json(json_path: Path) -> dict:
    if not json_path.exists():
        raise FileNotFoundError(f"JSON file not found: {json_path}")
    with json_path.open("r", encoding="utf-8") as f:
        return json.load(f)

def main():
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=env_path)

#     input_json = {
#   "project_name": "Victoria Test Application (Autohive - BadTrain Package)",
#   "project_github_url": "https://github.com/camelliabi/autohive",
#   "task_prompt_timestamp": "2026-02-05T14:00:00Z",
#   "number_of_fixes": 19,
#   "total_time_spent_minutes": 65,
#   "number_of_errors_from_raygun": 17,
#   "errors": [
#     {
#       "error_id": "269815739353",
#       "error_type": "FileNotFoundException",
#       "was_fixed": False
#     },
#     {
#       "error_id": "269876052491",
#       "error_type": "InputMismatchException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876091818",
#       "error_type": "InputMismatchException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876068714",
#       "error_type": "InputMismatchException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876067042",
#       "error_type": "InputMismatchException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876064592",
#       "error_type": "CompilationError",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876081690",
#       "error_type": "NoSuchElementException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876079187",
#       "error_type": "NoSuchElementException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876024655",
#       "error_type": "NoSuchElementException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876058691",
#       "error_type": "NoSuchElementException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876080924",
#       "error_type": "IndexOutOfBoundsException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876079932",
#       "error_type": "IndexOutOfBoundsException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876065004",
#       "error_type": "IndexOutOfBoundsException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876074232",
#       "error_type": "NullPointerException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876069262",
#       "error_type": "NullPointerException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876072932",
#       "error_type": "IllegalArgumentException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "269876055758",
#       "error_type": "ArithmeticException",
#       "was_fixed": True
#     },
#     {
#       "error_id": "LOGIC_ERROR_001",
#       "error_type": "LogicError",
#       "was_fixed": True
#     },
#     {
#       "error_id": "LOGIC_ERROR_002",
#       "error_type": "LogicError",
#       "was_fixed": True
#     }
#   ],
#   "summary": {
#     "total_errors_identified": 19,
#     "errors_fixed": 18,
#     "errors_not_fixed": 1,
#     "deployment_correlation": "Errors were introduced across multiple commits. Most errors appear to be intentional bugs for testing purposes.",
#     "recommendations": [
#       "Add comprehensive unit tests for input validation scenarios",
#       "Implement integration tests for Scanner input handling",
#       "Add boundary tests for array/list operations",
#       "Create the missing file: Johnsonville_Wellington-services.data",
#       "Add null-safety checks as a code review requirement",
#       "Implement pre-commit hooks to catch division by zero",
#       "Add code coverage metrics and aim for 80%+ coverage",
#       "Consider using Java Optional for nullable returns",
#       "Add input sanitization layer for user inputs",
#       "Implement logging for all caught exceptions"
#     ]
#   }
# }

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--json",
        default="user-service-debugging-report-2026-02-05.json",
        help="Path to input JSON file (default: input.json)"
    )
    args = parser.parse_args()

    json_path = Path(args.json).expanduser().resolve()
    input_json = load_input_json(json_path)


    project_name = input_json["project_name"]
    errors = input_json["errors"]

    records: list[ErrorRecord] = []
    for e in errors:
        record = ErrorRecord(
            error_id=e["error_id"],
            error_type=e["error_type"],
            was_fixed=e["was_fixed"],
            project_id="1"
        )
        records.append(record)

    # print("Parsed error records:\n")
    # for r in records:
    #     print(
    #         f"Error ID: {r.error_id} | "
    #         f"Type: {r.error_type} | "
    #         f"Was Fixed: {r.was_fixed} | "
    #         f"Project: {r.project_id}"
    #     )

    conn = psycopg2.connect(
    host=os.getenv("POSTGRES_HOST"),
    port=os.getenv("POSTGRES_PORT"),
    dbname=os.getenv("POSTGRES_DB"),
    user=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD")
    )

    # print("HOST:", os.getenv("POSTGRES_HOST"))
    # print("USER:", os.getenv("POSTGRES_USER"))
    # print("PASSWORD:", os.getenv("POSTGRES_PASSWORD"))

    cur = conn.cursor()

    for r in records:
        cur.execute(
            """
            INSERT INTO error_records
            (error_id, error_type, was_fixed, project_id)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (error_id) DO NOTHING
            """,
            (r.error_id, r.error_type, r.was_fixed, r.project_id)
        )

    conn.commit()
    print("error records inserted successfully.")

    cur.execute(
        "SELECT error_id, error_type, was_fixed, project_id FROM error_records"
    )
    rows = cur.fetchall()

    print("\ndata from postgre：")
    for row in rows:
        error_id, error_type, was_fixed, project_id = row
        print(
            f"Error ID: {error_id} | "
            f"Type: {error_type} | "
            f"Was Fixed: {was_fixed} | "
            f"Project: {project_id}"
        )

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()

