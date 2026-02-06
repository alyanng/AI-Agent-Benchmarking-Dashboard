import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager


DB_CONFIG = {
    'dbname': '',
    'user': '',  
    'password': '',      
    'host': 'localhost',
    'port': 5432
}