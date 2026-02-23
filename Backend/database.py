import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
import os


DB_CONFIG = {
    'dbname': '',
    'user': '',  
    'password': '',      
    'host': 'localhost',
    'port': 5432
}

def get_conn():
    """
    Create a database connection using environment variables.
    Raises ValueError if required environment variables are missing.
    """
    # Validate required environment variables
    required_vars = {
        'POSTGRES_HOST': os.getenv("POSTGRES_HOST"),
        'POSTGRES_DB': os.getenv("POSTGRES_DB"),
        'POSTGRES_USER': os.getenv("POSTGRES_USER"),
        'POSTGRES_PASSWORD': os.getenv("POSTGRES_PASSWORD")
    }
    
    missing_vars = [var for var, value in required_vars.items() if not value]
    if missing_vars:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing_vars)}. "
            "Please check your .env file."
        )
    
    # Get port with default value
    port = os.getenv("POSTGRES_PORT", "5432")
    try:
        port = int(port)
    except ValueError:
        raise ValueError(f"POSTGRES_PORT must be a valid integer, got: {port}")
    
    return psycopg2.connect(
        host=required_vars['POSTGRES_HOST'],
        port=port,
        dbname=required_vars['POSTGRES_DB'],
        user=required_vars['POSTGRES_USER'],
        password=required_vars['POSTGRES_PASSWORD'],
    )