from datetime import datetime
from services.database import db

class OpenTill(db.Model):
    __tablename__ = 'open_till'
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float)
    time = db.Column(db.String)  # For storing AM/PM formatted time
    date = db.Column(db.String)  # For storing the date in YYYY-MM-DD format
