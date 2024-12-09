import jwt
from datetime import datetime, timedelta
from flask import current_app

def create_token(user):
    payload = {
        'user_id': user['id'],  # Accessing 'id' key directly from the dictionary
        'username': user['username'],  # Accessing 'username' key directly from the dictionary
        'role': user['role'],  # Accessing 'role' key directly from the dictionary
        'exp': datetime.utcnow() + timedelta(days=30)  # Token expires in 24 hours
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

def decode_token(token):
    try:
        return jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None  # Token has expired
    except jwt.InvalidTokenError:
        return None  # Invalid token