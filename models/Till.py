from services.database import db

class OpenTill(db.Model):
    __tablename__ = 'open_till'
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float)
    time = db.Column(db.String)  # For storing AM/PM formatted time
    date = db.Column(db.String)  # For storing the date in YYYY-MM-DD format
    cashier_id = db.Column(db.Integer, db.ForeignKey('cashiers.id'))
    cashier_username = db.Column(db.String(15))  # Store the username
    cashier = db.relationship('Cashier', back_populates='tills')

    def __init__(self, amount, time, date, cashier_id, cashier_username):
        self.amount = amount
        self.time = time
        self.date = date
        self.cashier_id = cashier_id
        self.cashier_username = cashier_username  # Save the username
