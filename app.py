import json
from datetime import datetime, timedelta
import requests
from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from models.Cashier import Cashier
from models.Manager import Manager
from models.order import Orders,OrderItem
from models.Till import OpenTill
from models.payment import Payment
from models.seat import TableReservations
from models.user import User
from services.auth import authenticate_user, migrate_passwords
from services.token_service import create_token, decode_token
from services.database import db
from sqlalchemy import inspect, func
from flask_migrate import Migrate
from flask import jsonify
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize Flask application
app = Flask(__name__)
app.config.from_object('config.Config')

# Initialize database and migration
db.init_app(app)
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()  # This creates tables if they don't exist

# Routes
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


@app.route('/protected', methods=['GET'])
def protected_api():
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
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()

        if tables:
            return jsonify({"message": "Database connection successful!", "tables": tables}), 200
        else:
            return jsonify({"message": "Connected to database, but no tables found."}), 200
    except Exception as e:
        return jsonify({"message": f"Error connecting to database: {str(e)}"}), 500


@app.route('/create_manager', methods=['POST'])
def create_manager():
    data = request.json
    name = data.get('name')
    last_name = data.get('last_name')
    username = data.get('username')
    passcode = data.get('passcode')

    if not name or not last_name or not username or not passcode:
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    if Manager.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists", "success": False}), 400

    try:
        new_manager = Manager(name=name, last_name=last_name, username=username, passcode=passcode)
        db.session.add(new_manager)
        db.session.commit()

        return jsonify({"message": "Manager created successfully", "success": True, "manager": {
            "id": new_manager.id,
            "name": new_manager.name,
            "last_name": new_manager.last_name,
            "username": new_manager.username,
            "passcode": new_manager.passcode,
            "date_created": new_manager.date_created
        }}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to save manager: {str(e)}", "success": False}), 500

@app.route('/get_managers', methods=['GET'])
def get_managers():
        # Query the database for all managers
        managers = Manager.query.all()

        # Create a JSON response with manager details
        return jsonify({"managers": [
            {
                "id": manager.id,
                "name": manager.name,
                "last_name": manager.last_name,
                "username": manager.username,
                "passcode": manager.passcode,  # Only include this if passcode should be visible
                "date_created": manager.date_created
            } for manager in managers
        ]}), 200


@app.route('/sales_order')
def sales_order():
    action = request.args.get('action', None)

    if action == 'open_till':
        # Perform logic to handle "Open Till" (e.g., database update, logging)
        try:
            # Simulate opening the till
            print("Till opened successfully.")
            return jsonify(success=True)
        except Exception as e:
            print(f"Error opening till: {e}")
            return jsonify(success=False)

    # Render the sales_order page for normal requests
    till_opened = session.get('till_opened', False)  # Get the status of till
    return render_template('sales_order.html', till_opened=till_opened)


@app.route('/open_till', methods=['POST'])
def open_till():
    try:
        data = request.get_json()
        amount = data.get('amount')
        time = data.get('time')  # Time passed from the frontend (formatted as AM/PM)
        cashier_id = session.get('user_id')  # Get the cashier's user_id from the session

        # Check for valid amount
        if not amount or float(amount) <= 0:
            return jsonify({'error': 'Invalid amount'}), 400

        if not cashier_id:
            return jsonify({'error': 'Cashier is not logged in'}), 400

        # Get the cashier's username from the Cashier table
        cashier = Cashier.query.filter_by(id=cashier_id).first()
        if not cashier:
            return jsonify({'error': 'Cashier not found'}), 400

        cashier_username = cashier.username  # Get the cashier's username

        # Get current date in YYYY-MM-DD format
        current_date = datetime.now().strftime('%m-%d-%Y')  # Date in format: 2024-12-01

        new_till = OpenTill(amount=amount,
                            time=time,
                            date=current_date,
                            cashier_id=cashier_id,
                            cashier_username=cashier_username)
        db.session.add(new_till)
        db.session.commit()

        # Set session variable to indicate the till has been opened
        session['till_opened'] = True

        return jsonify({'message': 'Till opened successfully',
                        'amount': amount,
                        'time': time,
                        'date': current_date,
                        'cashier_id':cashier_id,
                        'cashier_username': cashier_username}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/open_till', methods=['GET'])
def get_open_tills():
    try:
        # Query parameters
        date = request.args.get('date')  # Filter by date (optional)
        cashier_id = request.args.get('cashier_id')  # Filter by cashier_id (optional)

        # Base query
        query = OpenTill.query

        # Apply filters if provided
        if date:
            query = query.filter_by(date=date)
        if cashier_id:
            query = query.filter_by(cashier_id=cashier_id)

        # Execute query and fetch results
        tills = query.all()

        # If no records are found
        if not tills:
            return jsonify({'message': 'No till records found'}), 404

        # Prepare response
        till_list = [
            {
                'id': till.id,
                'amount': till.amount,
                'time': till.time,
                'date': till.date,
                'cashier_id': till.cashier_id,
                'cashier_username': till.cashier_username,
                'close_time': till.close_time
            }
            for till in tills
        ]

        return jsonify({'tills': till_list}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/check_till_status', methods=['GET'])
def check_till_status():
    till_opened = session.get('till_opened', False)
    return jsonify({'till_opened': till_opened})


@app.route('/save_order', methods=['POST'])
def save_order():
    if not request.is_json:
        return jsonify({'success': False, 'error': "Unsupported Media Type: Content-Type "
                                                   "must be 'application/json'"}), 415

    try:
        data = request.get_json()

        # Extract order details
        order_id = data.get('orderID')
        order_date = data.get('date')
        items = data.get('items', [])
        order_type = data.get('orderType')
        total_amount = data.get('totalAmount')

        if not order_id or not order_date or not items or not order_type or not total_amount:
            return jsonify({'success': False, 'error': 'Incomplete order details'}), 400

        # Save the order to the database
        new_order = Orders(
            order_id=order_id,
            date=order_date,
            order_type=order_type,
            total_amount=total_amount
        )
        db.session.add(new_order)

        # Save each item
        for item in items:
            order_item = OrderItem(
                order_id=order_id,
                item_name=item['name'],
                item_price=item['price'],
                quantity=item['quantity']
            )
            db.session.add(order_item)

        db.session.commit()

        # Store order details in session
        session['payment_data'] = {
            'order_id': order_id,
            'order_date': order_date,
            'order_type': order_type,
            'subtotal': total_amount
        }

        return jsonify({'success': True, 'redirect_url': url_for('payment')}), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/get_orders', methods=['GET'])
def get_orders():
    try:
        # Query all orders
        orders = Orders.query.all()

        # Prepare data to return
        result = []
        for order in orders:
            order_items = OrderItem.query.filter_by(order_id=order.order_id).all()
            items = [
                {
                    'item_name': item.item_name,
                    'item_price': item.item_price,
                    'quantity': item.quantity
                }
                for item in order_items
            ]

            result.append({
                'order_id': order.order_id,
                'date': order.date,
                'order_type': order.order_type,
                'total_amount': order.total_amount,
                'items': items
            })

        return jsonify({'success': True, 'orders': result}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/inventory_data')
def get_inventory_data():
    inventory_url = "https://material-management-system-2.onrender.com/api/inventory_summary"
    response = requests.get(inventory_url)

    if response.status_code == 200:
        inventory_data = response.json()
        return jsonify(inventory_data)
    else:
        return jsonify({"error": "Failed to fetch inventory data"}), response.status_code


@app.route('/main')
def main():
    return render_template('main.html')

# Add User route
@app.route('/add_user', methods=['POST'])
def add_user():
    try:
        # Get data from the request
        data = request.get_json()

        # Extract user data from request
        full_name = data.get('full_name')
        email_address = data.get('email_address')
        username = data.get('username')
        password = data.get('password')
        user_title = data.get('user_title')
        user_level = data.get('user_level')

        # Validation: Check for required fields
        if not all([full_name, email_address, username, password, user_title, user_level]):
            return jsonify({'success': False, 'message': 'All fields are required!'}), 400

        # Check for existing user with the same email or username
        existing_user = User.query.filter((User.email_address == email_address) | (User.username == username)).first()
        if existing_user:
            return jsonify({'success': False, 'message': 'User with this email or username already exists!'}), 400

        # Create new user
        new_user = User(
            full_name=full_name,
            email_address=email_address,
            username=username,
            password=password,  # You should hash the password before storing it
            user_title=user_title,
            user_level=user_level
        )

        # Add to the database session and commit
        db.session.add(new_user)
        db.session.commit()

        # Return success message
        return jsonify({'success': True, 'message': 'User added successfully!'}), 201
    except Exception as e:
        # Handle unexpected errors
        db.session.rollback()  # Rollback the session in case of error
        print(f"Error adding user: {e}")  # Print the error for debugging (can be replaced with logging)
        return jsonify({'success': False, 'message': 'Error adding user', 'error': str(e)}), 500


# Get all users
@app.route('/get_users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_list = []
    for user in users:
        user_list.append({
            "id": user.id,
            "full_name": user.full_name,
            "email_address": user.email_address,
            "username": user.username,
            "user_title": user.user_title,
            "user_level": user.user_level,
        })
    return jsonify({"users": user_list})

# Get a specific user
@app.route('/get_user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = db.session.get(User, user_id)
    if user:
        return jsonify({
            "success": True,
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email_address": user.email_address,
                "username": user.username,
                "password":user.password,
                "user_title": user.user_title,
                "user_level": user.user_level,
            }
        })
    return jsonify({"success": False, "message": "User not found"}), 404


@app.route('/edit_user/<int:user_id>', methods=['PUT'])
def edit_user(user_id):
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    data = request.get_json()

    # Update the user fields
    user.full_name = data.get('full_name', user.full_name)
    user.email_address = data.get('email_address', user.email_address)
    user.username = data.get('username', user.username)
    user.password = data.get('password', user.password)  # No hashing
    user.user_title = data.get('user_title', user.user_title)
    user.user_level = data.get('user_level', user.user_level)

    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'User updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Error updating user', 'error': str(e)}), 500


# Delete User route
@app.route('/delete_user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/get_cashier_name', methods=['GET'])
def get_cashier_name():
    if 'user_id' in session:
        cashier = db.session.get(Cashier, session['user_id'])
        if cashier:
            return jsonify({
                "name": cashier.name,
                "last_name": cashier.last_name
            }), 200
    return jsonify({"message": "Not authenticated"}), 401


@app.route('/seats')
def seats():
    return render_template('seats.html')

@app.route('/save_table_reservation', methods=['POST'])
def save_table_reservation():
    if not request.is_json:
        return jsonify({'success': False, 'error': "Unsupported Media Type: Content-Type must be 'application/json'"}), 415

    try:
        data = request.get_json()
        table_id = data.get('table_id')
        guest_count = data.get('guest_count')
        order_details = data.get('order_details', {})  # Order data (dictionary)

        if not table_id or not guest_count:
            return jsonify({'success': False, 'error': 'Missing table ID or guest count'}), 400

        # Centralized order_id handling
        order_id = order_details.get('orderID') or f"ORD-{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}"  # Generate unique order_id
        order_date = order_details.get('date') or datetime.utcnow().isoformat()
        items = order_details.get('items', [])
        order_type = order_details.get('orderType') or 'Dine-In'
        total_amount = order_details.get('totalAmount') or 0.0

        # Validate order details
        if not items or not total_amount:
            return jsonify({'success': False, 'error': 'Incomplete order details'}), 400

        # Check if the order_id already exists (optional safety check)
        existing_order = Orders.query.filter_by(order_id=order_id).first()
        if existing_order:
            return jsonify({'success': False, 'error': f'Order with ID {order_id} already exists'}), 400

        # Save order to the database
        new_order = Orders(
            order_id=order_id,
            date=order_date,
            order_type=order_type,
            total_amount=total_amount
        )
        db.session.add(new_order)

        # Save each item
        for item in items:
            order_item = OrderItem(
                order_id=order_id,
                item_name=item['name'],
                item_price=item['price'],
                quantity=item['quantity']
            )
            db.session.add(order_item)

        # Save reservation with order_id
        new_reservation = TableReservations(
            table_id=table_id,
            guest_count=guest_count,
            status='Occupied',
            order_id=order_id  # Use the same order_id for the reservation
        )
        db.session.add(new_reservation)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Reservation and order saved successfully', 'order_id': order_id}), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/mark_table_available', methods=['POST'])
def mark_table_available():
    if not request.is_json:
        return jsonify({'success': False, 'error': "Unsupported Media Type: Content-Type must be 'application/json'"}), 415

    try:
        data = request.get_json()
        table_id = data.get('table_id')

        if not table_id:
            return jsonify({'success': False, 'error': 'Missing table ID'}), 400

        # Find the reservation and delete it (or update its status)
        reservation = TableReservations.query.filter_by(table_id=table_id).first()
        if not reservation:
            return jsonify({'success': False, 'error': f'Table {table_id} not found'}), 404

        db.session.delete(reservation)
        db.session.commit()

        return jsonify({'success': True, 'message': f'Table {table_id} is now available'}), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/payment', methods=['GET'])
def payment():
    payment_data = session.get('payment_data', {})
    payment_status = payment_data.get('status', 'Pending')
    return render_template('payment.html', **payment_data, status=payment_status)


@app.route('/save_payment', methods=['POST'])
def save_payment():
    payment_data = request.get_json()

    # Extract data from the JSON payload
    order_id = payment_data.get('order_id')
    subtotal = payment_data.get('subtotal')
    tax = payment_data.get('tax')
    total = payment_data.get('total')
    cash_received = payment_data.get('cash_received')
    change = payment_data.get('change')
    discount_type = payment_data.get('discount_type', None)
    discount_percentage = payment_data.get('discount_percentage', 0)

    # Save payment to the database
    new_payment = Payment(
        order_id=order_id,
        subtotal=subtotal,
        tax=tax,
        total=total,
        cash_received=cash_received,
        change=change,
        discount_type=discount_type,
        discount_percentage=discount_percentage,
        status="Complete"  # Set status to Complete
    )
    db.session.add(new_payment)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Payment saved successfully'})

@app.route('/get_payments', methods=['GET'])
def get_payments():
    # Query all payments from the database
    payments = Payment.query.all()

    # Prepare the payment data for the response
    payments_data = []
    for payment in payments:
        payments_data.append({
            'order_id': payment.order_id,
            'subtotal': payment.subtotal,
            'tax': payment.tax,
            'total': payment.total,
            'cash_received': payment.cash_received,
            'change': payment.change,
            'discount_type': payment.discount_type,
            'discount_percentage': payment.discount_percentage,
            'status': payment.status
        })

    return jsonify({'success': True, 'payments': payments_data})

@app.route('/order_history')
def order_history():
    # Fetch only completed orders
    completed_orders = db.session.query(Orders, Payment).outerjoin(Payment, Orders.order_id == Payment.order_id).filter(
        Payment.status == 'Complete').all()

    order_data = []
    for order, payment in completed_orders:
        order_items = db.session.query(OrderItem).filter(OrderItem.order_id == order.order_id).all()
        order_details = ', '.join([f"{item.item_name} (x{item.quantity})" for item in order_items])

        order_data.append({
            'order_id': order.order_id,
            'order_details': order_details,
            'date': order.date,
            'time': payment.created_at.strftime("%I:%M %p") if payment else 'N/A',
            'order_type': order.order_type,
            'order_status': payment.status if payment else 'Pending',  # This will always be 'Complete' now
            'amount': f"₱{payment.subtotal:,.2f}" if payment else "₱0.00"
        })

    return render_template('order_history.html', orders=order_data)

@app.route('/managers')
def manager_dashboard():
    return render_template('managers.html')


@app.route('/api/daily-sales')
def get_daily_sales():
    # Get sales for the last 7 days
    last_week = datetime.utcnow() - timedelta(days=7)

    sales_data = (
        db.session.query(
            func.date(Payment.created_at).label('date'),
            func.sum(Payment.total).label('total_sales')
        )
        .filter(Payment.created_at >= last_week)
        .group_by(func.date(Payment.created_at))
        .order_by(func.date(Payment.created_at))
        .all()
    )

    # Format data for Chart.js
    sales_chart_data = {"labels": [], "data": []}
    for row in sales_data:
        sales_chart_data["labels"].append(row.date.strftime('%Y-%m-%d'))
        sales_chart_data["data"].append(row.total_sales)

    return jsonify(sales_chart_data)

@app.route('/api/total-orders', methods=['GET'])
def get_total_orders():
    total_orders = Orders.query.count()  # Get the total number of orders
    return jsonify({'totalOrders': total_orders})


@app.route('/api/trending-dishes')
def get_trending_dishes():
    # Query to get the top 20 dishes based on total quantity sold
    trending_dishes = db.session.query(
        OrderItem.item_name,
        func.sum(OrderItem.quantity).label('total_quantity')
    ).group_by(OrderItem.item_name) \
        .order_by(func.sum(OrderItem.quantity).desc()) \
        .limit(20) \
        .all()

    # Prepare the result to send as JSON
    result = [{'item_name': dish.item_name, 'total_quantity': dish.total_quantity} for dish in trending_dishes]
    return jsonify({'trendingDishes': result})

@app.route('/api/total-income', methods=['GET'])
def get_total_income():
    try:
        # Get the time period from the query parameters
        time_period = request.args.get('timePeriod', 'today')
        now = datetime.utcnow()

        if time_period == 'today':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif time_period == 'yesterday':
            start_date = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
            now = start_date + timedelta(days=1)
        elif time_period == 'week':
            start_date = now - timedelta(days=now.weekday())  # Start of the current week
        elif time_period == 'month':
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)  # Start of the current month
        elif time_period == 'year':
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)  # Start of the year
        else:
            return jsonify({"error": "Invalid time period"}), 400

        # Query the total income
        total_income = db.session.query(func.sum(Payment.total)).filter(
            Payment.created_at >= start_date,
            Payment.created_at <= now
        ).scalar() or 0.0

        return jsonify({
            "timePeriod": time_period,
            "totalIncome": round(total_income, 2)  # Rounded to 2 decimal places
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/dashboard1')
def dashboard1():
    return render_template('dashboard1.html')

@app.route('/user_management')
def user_management():
    return render_template('user_management/um_tab_panel.html')

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

    cashier = Cashier.query.get(cashier_id)  # Changed from session to query directly
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
    api_url = "https://material-management-system-2.onrender.com/api/inventory_summary"
    try:
        response = requests.get(api_url)
        response.raise_for_status()  # Raise an error for HTTP issues
        inventory_data = response.json()  # Assuming the API returns JSON data

        # Sort data by date (assuming 'date' is in the format '10 December 2024')
        inventory_data = sorted(
            inventory_data,
            key=lambda x: datetime.strptime(x['date'], "%d %B %Y")  # Adjust format here
        )
    except requests.RequestException as e:
        print(f"Error fetching data from API: {e}")
        inventory_data = []  # Fallback to empty data in case of errors

    return render_template('inventory_management.html', inventory_data=inventory_data)

@app.route('/api/inventory_data')
def inventory_data():
    api_url = "https://material-management-system-2.onrender.com/api/inventory_summary"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        inventory_data = response.json()
        inventory_data = sorted(
            inventory_data,
            key=lambda x: datetime.strptime(x['date'], "%d %B %Y")
        )
    except requests.RequestException as e:
        print(f"Error fetching data from API: {e}")
        inventory_data = []

    return jsonify(inventory_data)

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

    user = Cashier.query.get(user_id) if user_role == 'cashier' else Manager.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found", "success": False}), 404

    if user.passcode != old_passcode:
        return jsonify({"message": "Old passcode is incorrect", "success": False}), 400

    user.passcode = new_passcode
    db.session.commit()

    return jsonify({"message": "Passcode changed successfully!", "success": True}), 200

if __name__ == "__main__":
    with app.app_context():
        migrate_passwords()  # Call the migration function
    app.run(debug=True)