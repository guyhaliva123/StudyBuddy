from flask import Flask, request, jsonify
from flask_smorest import Api
from flask_cors import CORS
import pyrebase
import firebase_admin
from firebase_admin import credentials, firestore, storage,auth
import requests
import os
from dotenv import load_dotenv
import json

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    load_dotenv()

    if not firebase_admin._apps:
        cred = credentials.Certificate(os.getenv('local_path'))
        firebase_admin.initialize_app(cred,{
        'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')})

    # get the fireBase config from the .env file 
    firebaseConfig_str = os.getenv('firebase_config')
    firebaseConfig = json.loads(firebaseConfig_str)
    app.config['FIREBASE_CONFIG'] = firebaseConfig

    # Initialize Firebase using Pyrebase (authentication part)
    firebase = pyrebase.initialize_app(firebaseConfig)
    app.config["PYREBASE_AUTH"] = firebase.auth()
   
    # Initialize Firestore client
    firestore_db = firestore.client()
    app.config["FIRESTORE_DB"] = firestore_db

    # Initialize Storage Bucket
    bucket = storage.bucket()
    app.config['STORAGE_BUCKET'] = bucket

    # Get the OpenAI API key from the .env file
    openai_api_key = os.getenv('openAI_API_KEY')
    if openai_api_key:
        app.config['OPENAI_API_KEY'] = openai_api_key


    app.config["API_TITLE"] = "Study Buddy API"
    app.config["API_VERSION"] = "v1"
    app.config["OPENAPI_VERSION"] = "3.0.2"
    app.config["OPENAPI_URL_PREFIX"] = "/"
    app.config["OPENAPI_SWAGGER_UI_PATH"] = "/swagger-ui"
    app.config["OPENAPI_SWAGGER_UI_URL"] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"

    api = Api(app)

    # assign the blueprint routes to the port app.
    from resources.users import blp as UserBlueprint
    from resources.events import blp as EventsBlueprint
    from resources.courses import blp as CourseBlueprint
    from resources.posts import blp as PostBlueprint
    from resources.chatBot import blp as AIBotBlueprint

    app.firestore_db = firestore_db
    api.register_blueprint(UserBlueprint)
    api.register_blueprint(EventsBlueprint)
    api.register_blueprint(CourseBlueprint)
    api.register_blueprint(PostBlueprint)
    api.register_blueprint(AIBotBlueprint)

    
    return app