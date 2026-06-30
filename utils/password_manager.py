import bcrypt

class PasswordManager:

    @staticmethod
    def hash_password(password):
        password_bytes = password.encode("utf-8")
        hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
        return hashed_password.decode("utf-8")
    
    @staticmethod
    def verify_password(password, password_hash):
        password_bytes = password.encode("utf-8")
        hash_bytes = password_hash.encode("utf-8")
        return bcrypt.checkpw(password_bytes, hash_bytes)
