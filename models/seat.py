from services.database import db
from datetime import datetime

class TableReservations(db.Model):
    __tablename__ = 'table_reservations'
    id = db.Column(db.Integer, primary_key=True)  # Auto-incrementing ID
    table_id = db.Column(db.String(10), nullable=False)  # Table identifier
    guest_count = db.Column(db.Integer, nullable=False)  # Number of guests
    status = db.Column(db.String(20), default='Occupied')  # Status (e.g., Occupied, Available)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)  # Reservation time

    def __repr__(self):
        return f"<TableReservations(table_id={self.table_id}, guest_count={self.guest_count}, status={self.status})>"
