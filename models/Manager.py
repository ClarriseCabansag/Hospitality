from services.database import db

class Manager(db.Model):
    __tablename__ = 'managers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    last_name = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(15), nullable=False, unique=True)
    passcode = db.Column(db.String(255), nullable=False)
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __init__(self, name, last_name, username, passcode):
        self.name = name
        self.last_name = last_name
        self.username = username
        self.passcode = passcode