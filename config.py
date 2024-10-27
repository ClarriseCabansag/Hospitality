import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "0123")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql://postgres:0802@localhost:5432/POS")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
