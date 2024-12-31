import os
import mysql.connector
import logging

log = logging.getLogger(__name__)

class DatabaseHelper:
    def __init__(self):
        self.config = {
            "host": os.getenv("DB_HOST", "localhost"),
            "user": os.getenv("DB_USER", "root"),
            "password": os.getenv("DB_PASSWORD", ""),
            "database": os.getenv("DB_NAME", "test_db"),
        }
        self.connection = None

    def connect(self):
        log.info("Connecting to the database...")
        self.connection = mysql.connector.connect(**self.config)

    def execute_query(self, query, params=None):
        if not self.connection:
            self.connect()
        cursor = self.connection.cursor()
        try:
            log.debug(f"Executing query: {query} with params: {params}")
            cursor.execute(query, params)
            self.connection.commit()
            return cursor.fetchall()
        except mysql.connector.Error as e:
            log.error(f"Database error: {e}")
            raise
        finally:
            cursor.close()

    def close(self):
        if self.connection:
            log.info("Closing the database connection...")
            self.connection.close()
            self.connection = None
