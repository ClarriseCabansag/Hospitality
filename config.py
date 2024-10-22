import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', '0123')  # Fallback if not provided
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI', 'postgresql://postgres:1630@localhost:5432/dbname')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
