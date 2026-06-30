import sqlite3

class DatabaseManager:

    def __init__(self, db_name="horizon.db"):
        self.db_name = db_name
        self.conn = None
        self.cursor = None
    
    def connect(self):
        self.conn = sqlite3.connect(self.db_name)
        self.cursor = self.conn.cursor()
    
    def close(self):
        if self.conn:
            self.conn.close()
            self.conn = None
            self.cursor = None
    
    def execute(self, query, params= None):
        if params is None:
            params = ()
        self.cursor.execute(query, params)
        return self.cursor
    
    def commit(self):
        if self.conn:
            self.conn.commit()
    
    def fetch_one(self, query, params= None):
        self.execute(query, params)
        return self.cursor.fetchone()
    
    def fetch_all(self, query, params= None):
        self.execute(query, params)
        return self.cursor.fetchall()
