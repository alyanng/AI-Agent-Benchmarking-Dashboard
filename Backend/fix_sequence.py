"""
Fix PostgreSQL sequence conflicts

Run this script when you get errors like:
"duplicate key value violates unique constraint"

This resets all sequences to match the actual maximum IDs in the tables.
"""

import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

def connect_to_db():
    conn = psycopg2.connect(
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD")
    )
    return conn

def fix_sequence(table_name, id_column, sequence_name):
    """Fix a single sequence by setting it to MAX(id) + 1"""
    conn = connect_to_db()
    cur = conn.cursor()
    
    try:
        # Get current max ID
        cur.execute(f"SELECT MAX({id_column}) FROM {table_name};")
        result = cur.fetchone()
        max_id = result[0] if result[0] is not None else 0
        
        # Reset sequence to max_id
        cur.execute(f"SELECT setval('{sequence_name}', {max_id});")
        
        conn.commit()
        print(f"✅ Fixed {table_name}: Set {sequence_name} to {max_id}")
        
    except Exception as e:
        print(f"❌ Error fixing {table_name}: {str(e)}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

def fix_all_sequences():
    """Fix all table sequences"""
    print("🔧 Fixing database sequences...\n")
    
    # List of tables and their sequences
    tables_to_fix = [
        ("results", "results_id", "results_results_id_seq"),
        ("configuration", "configuration_id", "configuration_configuration_id_seq"),
        ("projects", "project_id", "projects_project_id_seq"),
        ("error_records", "id", "error_records_id_seq"),  # Adjust if different
    ]
    
    for table_name, id_column, sequence_name in tables_to_fix:
        fix_sequence(table_name, id_column, sequence_name)
    
    print("\n✅ All sequences fixed!")
    print("You can now save reports without duplicate key errors.")

if __name__ == "__main__":
    print("=" * 60)
    print("PostgreSQL Sequence Fix Script")
    print("=" * 60)
    print()
    
    try:
        fix_all_sequences()
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        print("\nMake sure:")
        print("1. Backend/.env file exists with correct database credentials")
        print("2. PostgreSQL database is running")
        print("3. You have permission to modify the database")
