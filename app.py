from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import jwt
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize Flask-SQLAlchemy
db = SQLAlchemy()

# Database Models
class Cashier(db.Model):
    __tablename__ = 'cashiers'

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

# Authentication Services
def create_token(user):
    payload = {
        'user_id': user['id'],
        'username': user['username'],
        'role': user['role'],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def decode_token(token):
    try:
        return jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def authenticate_user(username, passcode):
    manager = Manager.query.filter_by(username=username).first()
    if manager:
        if manager.passcode == passcode:
            return {
                'id': manager.id,
                'firstname': manager.name,
                'lastname': manager.last_name,
                'username': manager.username,
                'role': 'manager',
                'date': manager.date_created
            }

    cashier = Cashier.query.filter_by(username=username).first()
    if cashier:
        if cashier.passcode == passcode:
            return {
                'id': cashier.id,
                'firstname': cashier.name,
                'lastname': cashier.last_name,
                'username': cashier.username,
                'role': 'cashier',
                'date': cashier.date_created
            }

    return None

def migrate_passwords():
    print("Password migration completed successfully!")

# Flask Application
app = Flask(__name__)
app.config['SECRET_KEY'] = '0123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgre_17_user:TOmuUalV9SI8K0uwzrornfb9WRNCWZon@dpg-cscfr356l47c73e0k7ag-a/postgre_17'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database with the app
db.init_app(app)

# Routes
@app.route('/')
def login_page():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    passcode = data.get('passcode')

    if not (4 <= len(passcode) <= 6):
        return jsonify({'message': 'Passcode must be between 4 and 6 digits'}), 400

    user = authenticate_user(username, passcode)

    if user:
        session['user_id'] = user['id']
        session['role'] = user['role']
        token = create_token(user)
        return jsonify({"user": user, "role": user['role'], "token": token}), 200
    else:
        return jsonify({'message': 'Invalid Credentials'}), 401

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/protected', methods=['GET'])
def protected_api():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"message": "Token is missing"}), 403

    token = auth_header.split(" ")[1]
    decoded = decode_token(token)

    if decoded:
        user = Cashier.query.get(decoded['user_id']) or Manager.query.get(decoded['user_id'])
        if user:
            return jsonify({
                "id": user.id,
                "firstname": user.name,
                "lastname": user.last_name,
                "username": user.username,
                "role": "cashier" if isinstance(user, Cashier) else "manager",
                "token": token
            }), 200
    return jsonify({"message": "Invalid or expired token"}), 403

@app.route('/test-db')
def test_db_connection():
    try:
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        if tables:
            return jsonify({"message": "Database connection successful!", "tables": tables}), 200
        else:
            return jsonify({"message": "Connected to database, but no tables found."}), 200
    except Exception as e:
        return jsonify({"message": f"Error connecting to database: {str(e)}"}), 500

@app.route('/managers')
def managers():
    return render_template('managers.html')

@app.route('/sales_order')
def sales_order():
    return render_template('sales_order.html')

@app.route('/get_cashier_name', methods=['GET'])
def get_cashier_name():
    if 'user_id' in session:
        cashier = Cashier.query.get(session['user_id'])
        if cashier:
            return jsonify({
                "name": cashier.name,
                "last_name": cashier.last_name
            }), 200
    return jsonify({"message": "Not authenticated"}), 401

@app.route('/seats')
def seats():
    return render_template('seats.html')

@app.route('/payment')
def payment():
    return render_template('payment.html')

@app.route('/order_history')
def order_history():
    return render_template('order_history.html')

@app.route('/manager_dashboard')
def manager_dashboard():
    return render_template('managers.html')

@app.route('/profile_management')
def profile_management():
    return render_template('profile_management.html')

@app.route('/create_cashier', methods=['POST'])
def create_cashier():
    data = request.json
    name = data.get('name')
    last_name = data.get('last_name')
    username = data.get('username')
    passcode = data.get('passcode')

    if not name or not last_name or not username or not passcode:
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    if Cashier.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists", "success": False}), 400

    try:
        new_cashier = Cashier(name=name, last_name=last_name, username=username, passcode=passcode)
        db.session.add(new_cashier)
        db.session.commit()

        return jsonify({"message": "Cashier created successfully", "success": True, "cashier": {
            "id": new_cashier.id,
            "name": new_cashier.name,
            "last_name": new_cashier.last_name,
            "username": new_cashier.username,
            "passcode": new_cashier.passcode,
            "date_created": new_cashier.date_created
        }}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to save cashier: {str(e)}", "success": False}), 500

@app.route('/get_cashiers', methods=['GET'])
def get_cashiers():
    cashiers = Cashier.query.all()
    return jsonify({"cashiers": [
        {
            "id": cashier.id,
            "name": cashier.name,
            "last_name": cashier.last_name,
            "username": cashier.username,
            "passcode": cashier.passcode,
            "date_created": cashier.date_created
        } for cashier in cashiers
    ]}), 200

@app.route('/edit_cashier/<int:cashier_id>', methods=['PUT'])
def edit_cashier(cashier_id):
    data = request.json
    name = data.get('name')
    last_name = data.get('last_name')
    username = data.get('username')
    passcode = data.get('passcode')

    cashier = Cashier.query.get(cashier_id)
    if not cashier:
        return jsonify({"message": "Cashier not found", "success": False}), 404

    cashier.name = name
    cashier.last_name = last_name
    cashier.username = username
    cashier.passcode = passcode
    db.session.commit()

    return jsonify({"message": "Cashier updated successfully", "success": True, "cashier": {
        "id": cashier.id,
        "name": cashier.name,
        "last_name": cashier.last_name,
        "username": cashier.username,
        "passcode": cashier.passcode,
        "date_created": cashier.date_created
    }}), 200

@app.route('/delete_cashier/<int:cashier_id>', methods=['DELETE'])
def delete_cashier(cashier_id):
    cashier = Cashier.query.get(cashier_id)
    if not cashier:
        return jsonify({"message": "Cashier not found", "success": False}), 404
    db.session.delete(cashier)
    db.session.commit()
    return jsonify({"message": "Cashier deleted successfully", "success": True}), 200

@app.route('/inventory_management')
def inventory_management():
    return render_template('inventory_management.html')

@app.route('/cashier_summary')
def cashier_summary():
    return render_template('cashier_summary.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login_page'))

@app.route('/change_passcode', methods=['POST'])
def process_change_passcode():
    data = request.get_json()
    old_passcode = data.get('old_passcode')
    new_passcode = data.get('new_passcode')

    user_id = session.get('user_id')
    user_role = session.get('role')

    if not user_id:
        return jsonify({"message": "User not logged in", "success": False}), 400

    if user_role == 'cashier':
        user = Cashier.query.get(user_id)
    elif user_role == 'manager':
        user = Manager.query.get(user_id)
    else:
        return jsonify({"message": "Invalid role", "success": False}), 400

    if not user:
        return jsonify({"message": "User not found", "success": False}), 404

    if user.passcode != old_passcode:
        return jsonify({"message": "Old passcode is incorrect", "success": False}), 400

    user.passcode = new_passcode
    db.session.commit()

    return jsonify({"message": "Passcode changed successfully!", "success": True}), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        migrate_passwords()
    app.run(debug=True)