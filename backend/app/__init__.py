import os
import sys
import pprint
import secrets
import jwt  # PyJWT library
from flask import Flask
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()  # Load environment variables from .env file
# Function to create a JWT token
def create_token(user_id, secret_key):
    token = jwt.encode(
        {'user_id': user_id},
        secret_key,
        algorithm='HS256'
    )
    return token


def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get('SECRET_KEY')  
    #app.config.from_object('config.Config')
    app.config['MONGO_URI'] = os.environ.get('MONGO_URI')
    app.config['UPLOAD_FOLDER'] = 'C:/Users/student/Desktop/FinalProject/backend/app/uploads'
    
    client = MongoClient(app.config['MONGO_URI'])
    app.db = client.ProjectTest

    # Ensure the unique index is created for the email field
    app.db.users.create_index('email', unique=True)

   



    with app.app_context():
        from . import routes

    return app
