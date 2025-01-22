from sqlalchemy import ForeignKey

from services.database import db

class Orders(db.Model):
    __tablename__ = 'orders'  # Updated table name
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), unique=True, nullable=False)
    date = db.Column(db.String(50), nullable=False)
    order_type = db.Column(db.String(50), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)

    # Define the relationship for cascade deletion
    items = db.relationship('OrderItem', backref='orders', cascade='all, delete-orphan')


class OrderItem(db.Model):
    __tablename__ = 'orderitem'  # Explicitly define the table name
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), db.ForeignKey('orders.order_id'), nullable=False)
    item_name = db.Column(db.String(100), nullable=False)
    item_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
