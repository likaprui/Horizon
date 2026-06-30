

class User:

    def __init__(self, user_id, username, email, password_hash, balance, created_at):
        self.user_id = user_id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.balance = balance
        self.created_at = created_at
    
    def __str__(self):
        return f"User({self.username}, {self.email}, Balance: ${self.balance:.2f})"

