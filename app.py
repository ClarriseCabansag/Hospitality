from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask.cli import load_dotenv
from models.Cashier import Cashier
from models.Manager import Manager
from services.auth import authenticate_user, migrate_passwords
from services.token_service import create_token, decode_token
from services.database import db
from sqlalchemy import inspect
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)
app.config.from_object('config.Config')
db.init_app(app)

@app.route('/')
def login_page():
    return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    passcode = data.get('passcode')

    # Passcode validation: must be between 4 and 6 digits
    if not (4 <= len(passcode) <= 6):
        return jsonify({'message': 'Passcode must be between 4 and 6 digits'}), 400

    user = authenticate_user(username, passcode)

    if user:
        session['user_id'] = user['id']  # Store user ID in session
        session['role'] = user['role']   # Store user role in session

        # Create a token with the user dictionary
        token = create_token(user)  # Generate the token for the user

        return jsonify({"user": user, "role": user['role'], "token": token}), 200
    else:
        return jsonify({'message': 'Invalid Credentials'}), 401


@app.route('/dashboard')
def dashboard():
    # Optionally, you can add token validation here if needed
    return render_template('dashboard.html', message="Welcome to the Dashboard!")


@app.route('/protected', methods=['GET'])
def protected_api():  # Renamed the function to avoid conflict
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"message": "Token is missing"}), 403

    token = auth_header.split(" ")[1]  # Bearer <token>
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
        # Create an inspector to get table names
        inspector = inspect(db.engine)
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

@app.route('/dashboard')
def cashier_dashboard():
    return render_template('dashboard.html')

@app.route('/sales_order')
def sales_order():
    return render_template('sales_order.html')

@app.route('/seats')
def seats():
    return render_template('seats.html')  # Ensure you have a corresponding HTML template

@app.route('/payment')
def payment():
    return render_template('payment.html')  # Ensure this template exists

@app.route('/order_history')
def order_history():
    return render_template('order_history.html')  # Ensure this template exists

@app.route('/manager_dashboard')
def manager_dashboard():
    return render_template('managers.html')  # Ensure this template exists

@app.route('/profile_management')
def profile_management():
    return render_template('profile_management.html')  # Ensure this template exists
@app.route('/create_cashier', methods=['POST'])
def create_cashier():
    data = request.json
    name = data.get('name')
    last_name = data.get('last_name')
    username = data.get('username')
    passcode = data.get('passcode')

    # Check for missing fields
    if not name or not last_name or not username or not passcode:
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    # Ensure that a cashier with the same username does not already exist
    if Cashier.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists", "success": False}), 400

    try:
        # Create a new cashier object and add to the database
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

    # Ensure that a cashier exists
    cashier = Cashier.query.get(cashier_id)
    if not cashier:
        return jsonify({"message": "Cashier not found", "success": False}), 404

    # Update the cashier's details
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
    return render_template('inventory_management.html')  # Ensure this template exists

@app.route('/cashier_summary')
def cashier_summary():
    return render_template('cashier_summary.html')  # Ensure this template exists


@app.route('/logout')
def logout():
    # Clear the user session
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

    # Directly compare the old passcode
    if user.passcode != old_passcode:
        return jsonify({"message": "Old passcode is incorrect", "success": False}), 400

    # Update the user's passcode directly
    user.passcode = new_passcode
    db.session.commit()

    return jsonify({"message": "Passcode changed successfully!", "success": True}), 200


if __name__ == "__main__":
        with app.app_context():
        migrate_passwords()  # Call the migration function
    app.run(debug=True)
