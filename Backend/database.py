import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
import os


def get_conn():
    """
    Get a connection to the PostgreSQL database.
    Validates environment variables before attempting connection.
    
    Returns:
        psycopg2.connection: Database connection object
        
    Raises:
        ValueError: If required environment variables are missing or invalid
        psycopg2.OperationalError: If database connection fails
    """
    # Validate required environment variables
    required_vars = {
        'POSTGRES_HOST': os.getenv("POSTGRES_HOST"),
        'POSTGRES_PORT': os.getenv("POSTGRES_PORT", "5432"),  # Default to 5432
        'POSTGRES_DB': os.getenv("POSTGRES_DB"),
        'POSTGRES_USER': os.getenv("POSTGRES_USER"),
        'POSTGRES_PASSWORD': os.getenv("POSTGRES_PASSWORD"),
    }
    
    # Check for missing variables
    missing = [key for key, value in required_vars.items() if value is None or value == ""]
    
    if missing:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing)}. "
            f"Please check your Backend/.env file and ensure all database credentials are set."
        )
    
    # Validate port is a valid integer
    try:
        port = int(required_vars['POSTGRES_PORT'])
    except ValueError:
        raise ValueError(
            f"POSTGRES_PORT must be a valid integer, got: {required_vars['POSTGRES_PORT']}"
        )
    
    # Attempt connection with enhanced error messages
    try:
        return psycopg2.connect(
            host=required_vars['POSTGRES_HOST'],
            port=port,
            dbname=required_vars['POSTGRES_DB'],
            user=required_vars['POSTGRES_USER'],
            password=required_vars['POSTGRES_PASSWORD'],
        )
    except psycopg2.OperationalError as e:
        raise psycopg2.OperationalError(
            f"Failed to connect to database at {required_vars['POSTGRES_HOST']}:{port}. "
            f"Please check your database credentials and ensure the database is running. "
            f"Original error: {e}"
        )
