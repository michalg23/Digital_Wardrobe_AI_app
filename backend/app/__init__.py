import os
import sys
import pprint
import secrets
from flask import Flask
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file
def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get('SECRET_KEY')  
    #app.config.from_object('config.Config')
    app.config['MONGO_URI'] = "mongodb+srv://michal1029HY:CTNE5m2CiSL4jmkQ@cluster.w0i6nad.mongodb.net/?retryWrites=true&w=majority&appName=Cluster"
    app.config['UPLOAD_FOLDER'] = 'C:/Users/student/Desktop/FinalProject/backend/app/uploads'
    
    client = MongoClient(app.config['MONGO_URI'])
    app.db = client.ProjectTest

    with app.app_context():
        from . import routes

    return app
