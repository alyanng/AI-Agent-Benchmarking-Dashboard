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
    Create and return a database connection with proper error handling.
    
    Validates that all required environment variables are set before attempting connection.
    Raises clear error messages if configuration is missing.
    
    Returns:
        psycopg2.connection: Database connection object
        
    Raises:
        ValueError: If required environment variables are missing
        psycopg2.Error: If database connection fails
    """
    # Validate required environment variables
    required_vars = {
        'POSTGRES_HOST': os.getenv("POSTGRES_HOST"),
        'POSTGRES_PORT': os.getenv("POSTGRES_PORT", "5432"),  # Default port
        'POSTGRES_DB': os.getenv("POSTGRES_DB"),
        'POSTGRES_USER': os.getenv("POSTGRES_USER"),
        'POSTGRES_PASSWORD': os.getenv("POSTGRES_PASSWORD")
    }
    
    # Check for missing required variables (except PORT which has default)
    missing = [key for key, value in required_vars.items() 
               if value is None and key != 'POSTGRES_PORT']
    
    if missing:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing)}. "
            f"Please set these variables in your .env file or environment."
        )
    
    # Convert port to integer with validation
    try:
        port = int(required_vars['POSTGRES_PORT'])
    except (ValueError, TypeError):
        raise ValueError(
            f"POSTGRES_PORT must be a valid integer, got: {required_vars['POSTGRES_PORT']}"
        )
    
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
            f"Please check your database is running and credentials are correct. "
            f"Original error: {str(e)}"
        )