from database.database import DatabaseManager
# from database.schema import DatabaseSchema
from services.auth_service import AuthService

# def main():
#     db = DatabaseManager()
#     db.connect()

#     schema = DatabaseSchema(db)
#     schema.create_all_tables()

#     db.close()


def main():
    db = DatabaseManager()
    db.connect()

    auth = AuthService(db)

    print("Registering user...")

    result = auth.register_user( username="testuser", email="test@example.com", password="123456")

    print("Registration success:", result)

    # # შესვლა
    print("\nLogging in...")

    user = auth.login_user(email="test@example.com", password="123456")

    if user:
        print("Login successful!")
        print(user)
    else:
        print("Login failed!")
    
    db.close()

if __name__ == "__main__":
    main()
