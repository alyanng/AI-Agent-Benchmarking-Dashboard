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
    Create and return a PostgreSQL database connection.
    
    Validates all required environment variables before attempting connection.
    Raises clear error messages if configuration is missing or invalid.
    
    Returns:
        psycopg2.connection: Active database connection
        
    Raises:
        ValueError: If required environment variables are missing or invalid
        psycopg2.OperationalError: If database connection fails
    """
    # Validate all required environment variables
    required_vars = {
        'POSTGRES_HOST': os.getenv("POSTGRES_HOST"),
        'POSTGRES_PORT': os.getenv("POSTGRES_PORT", "5432"),  # Default port
        'POSTGRES_DB': os.getenv("POSTGRES_DB"),
        'POSTGRES_USER': os.getenv("POSTGRES_USER"),
        'POSTGRES_PASSWORD': os.getenv("POSTGRES_PASSWORD")
    }
    
    # Check for missing variables
    missing = [key for key, value in required_vars.items() if value is None or value == '']
    if missing:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing)}\n"
            f"Please set these variables in your .env file or environment."
        )
    
    # Validate port is a valid integer
    try:
        port = int(required_vars['POSTGRES_PORT'])
    except ValueError:
        raise ValueError(
            f"POSTGRES_PORT must be a valid integer, got: {required_vars['POSTGRES_PORT']}"
        )
    
    # Attempt connection with enhanced error messaging
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
            f"Failed to connect to PostgreSQL database.\n"
            f"Please check your database credentials and ensure PostgreSQL is running.\n"
            f"Host: {required_vars['POSTGRES_HOST']}, Port: {port}, Database: {required_vars['POSTGRES_DB']}\n"
            f"Original error: {e}"
        )
