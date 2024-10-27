import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "0123")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql://postgre_17_user:TOmuUalV9SI8K0uwzrornfb9WRNCWZon@dpg-cscfr356l47c73e0k7ag-a/postgre_17")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
