from models.Manager import Manager
from models.Cashier import Cashier
from werkzeug.security import check_password_hash, generate_password_hash
from services.database import db
from services.token_service import create_token  # Make sure to import create_token

def migrate_passwords():
    # Since we are now storing passwords as plaintext, we don't need to modify anything.
    print("Password migration completed successfully!")

def authenticate_user(username, passcode):
    # Check in managers table
    manager = Manager.query.filter_by(username=username).first()
    if manager:
        # Directly compare plaintext passwords
        if manager.passcode == passcode:
            return {
                'id': manager.id,
                'firstname': manager.name,
                'lastname': manager.last_name,
                'username': manager.username,
                'role': 'manager',
                'date': manager.date_created
            }

    # Check in cashiers table
    cashier = Cashier.query.filter_by(username=username).first()
    if cashier:
        # Directly compare plaintext passwords
        if cashier.passcode == passcode:
            return {
                'id': cashier.id,
                'firstname': cashier.name,
                'lastname': cashier.last_name,
                'username': cashier.username,
                'role': 'cashier',
                'date': cashier.date_created
            }

    return None  # User not found or password incorrect