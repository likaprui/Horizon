from database.database import DatabaseManager
from utils.password_manager import PasswordManager
from models.user import User
import datetime


class AuthService:

    def __init__(self, db):
        self.db = db
    
    def email_exists(self, email):
        query = """
        SELECT * FROM users WHERE email = ?
        """
        user = self.db.fetch_one(query, (email,))
        return user is not None
        

    def register_user(self, username, email, password):

        if self.email_exists(email):
            return False
        
        hashed_password = PasswordManager.hash_password(password)
        created_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        query = """
        INSERT INTO users (username, email, password_hash, balance, created_at)
        VALUES (?, ?, ?, ?, ?)
        """

        self.db.execute(query, (username, email, hashed_password, 10000.0, created_at))
        self.db.commit()

        return True
    

    def login_user(self, email, password):

        query = """
        SELECT * FROM users WHERE email = ?
        """

        user_data = self.db.fetch_one(query, (email,))

        if not user_data:
            return None
        
        stored_password = user_data[3]

        if not PasswordManager.verify_password(password, stored_password):
            return None
        
        return User(
            user_id = user_data[0],
            username = user_data[1],
            email = user_data[2],
            password_hash = user_data[3],
            balance = user_data[4],
            created_at = user_data[5]
            )
