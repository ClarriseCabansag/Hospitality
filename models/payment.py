from services.database import db
from datetime import datetime

class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    tax = db.Column(db.Float, nullable=False)
    total = db.Column(db.Float, nullable=False)
    cash_received = db.Column(db.Float, nullable=False)
    change = db.Column(db.Float, nullable=False)
    discount_type = db.Column(db.String(50), nullable=True)
    discount_percentage = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
