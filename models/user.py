from services.database import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(255), nullable=False)
    email_address = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)  # Keep it as plaintext (although it is recommended to hash passwords)
    user_title = db.Column(db.String(50))
    user_level = db.Column(db.String(50))
    def __init__(self, full_name, email_address, username, password, user_title=None, user_level=None):
        self.full_name = full_name
        self.email_address = email_address
        self.username = username
        self.password = password  # No hashing (it is advisable to hash passwords)
        self.user_title = user_title
        self.user_level = user_level
