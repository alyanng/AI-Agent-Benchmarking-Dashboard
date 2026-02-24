import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
import os


def get_conn():
    """
    Create and return a PostgreSQL database connection using environment variables.
    """
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
    )
