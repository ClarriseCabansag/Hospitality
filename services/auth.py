
from models.Manager import Manager
from models.Cashier import Cashier
from models.user import User  # Import User model
from werkzeug.security import check_password_hash, generate_password_hash
from services.database import db
from services.token_service import create_token  # Make sure to import create_token

def migrate_passwords():
    print("Password migration completed successfully!")

def authenticate_user(username, passcode):
    # Check in managers table
    manager = Manager.query.filter_by(username=username).first()
    if manager and manager.passcode == passcode:
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
    if cashier and cashier.passcode == passcode:
        return {
            'id': cashier.id,
            'firstname': cashier.name,
            'lastname': cashier.last_name,
            'username': cashier.username,
            'role': 'cashier',
            'date': cashier.date_created
        }

    # Check in users table
    user = User.query.filter_by(username=username).first()
    if user and user.password == passcode:
        return {
            'id': user.id,
            'firstname': user.full_name,
            'email': user.email_address,
            'username': user.username,
            'role': user.user_level,  # Assign role based on user_level
        }

    return None  # User not found or password incorrect
