from .database import DatabaseManager


class DatabaseSchema:

    def __init__(self, db):
        self.db = db
    
    def create_users_table(self):

        query = """ CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            balance REAL NOT NULL DEFAULT 10000.00,
            created_at TEXT NOT NULL
            ); """
        
        self.db.execute(query)
    
    def create_portfolio_table(self):

        query = """CREATE TABLE IF NOT EXISTS portfolio (
            portfolio_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            symbol TEXT NOT NULL,
            asset_type TEXT NOT NULL,
            quantity REAL NOT NULL,
            average_buy_price REAL NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(user_id)
            UNIQUE(user_id, symbol)
            );"""
        
        self.db.execute(query)
    
    def create_transactions_table(self):

        query = """CREATE TABLE IF NOT EXISTS transactions (
        transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        symbol TEXT NOT NULL,
        asset_type TEXT NOT NULL,
        action TEXT NOT NULL,
        quantity REAL NOT NULL,
        price REAL NOT NULL,
        total REAL NOT NULL,
        transaction_time TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(user_id)
        );"""

        self.db.execute(query)
    
    def create_books_table(self):

        query = """CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT,
        description TEXT,
        pdf_path TEXT,
        url TEXT
        );"""

        self.db.execute(query)
    
    def create_tips_table(self):

        query = """CREATE TABLE IF NOT EXISTS tips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL
        );"""
        
        self.db.execute(query)
    
    def create_all_tables(self):

        self.create_users_table()
        self.create_portfolio_table()
        self.create_transactions_table()
        self.create_books_table()
        self.create_tips_table()

        self.db.commit()

    
