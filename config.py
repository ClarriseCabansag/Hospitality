class Config:
    SECRET_KEY = '0123'
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:0802@localhost:5432/POS'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
