from flask.views import MethodView
from flask_smorest import Blueprint, abort
from flask import request, jsonify, current_app
import firebase_admin
from firebase_admin import credentials, firestore, auth
import requests

blp = Blueprint('posts', __name__, description='Operations on users')


def verify_firebase_token(id_token):
    firebase_config = current_app.config['FIREBASE_CONFIG']
    verify_url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={firebase_config['apiKey']}"
    response = requests.post(verify_url, json={'idToken': id_token})
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception("Token verification failed")
    

@blp.route('/get_event_Posts', methods=['GET'])
class getPosts(MethodView):
    def get(self):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"message": "Missing or invalid token"}), 401

            id_token = auth_header.split(' ')[1]
            decoded_token = verify_firebase_token(id_token)
            user_id = decoded_token['users'][0]['localId']

            firestore_db = current_app.config['FIRESTORE_DB']
            events_ref = firestore_db.collection('posts').where('user_id', '==', 'Admin')
            events = events_ref.stream()

            events_list = []
            for event in events:
                event_data = event.to_dict()
                event_data['id'] = event.id
                events_list.append(event_data)

            return jsonify(events_list), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 400
        

@blp.route('/add_post', methods=['POST'])
class addPost(MethodView):
    def post(self):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"message": "Missing or invalid token"}), 401

            id_token = auth_header.split(' ')[1]
            decoded_token = verify_firebase_token(id_token)

            data = request.get_json()
            title = data.get('title')
            startTime = data.get('startTime')
            duration = data.get('duration')
            importance = data.get('importance')
            description = data.get('description')
            eventType = data.get('eventType')
            imageUrl = data.get('imageUrl')  # Optional
            
            if not title or not startTime or not duration or not importance or not description or not eventType:
                return jsonify({"message": "Missing event data"}), 400

            event_ref = {
                'title': title,
                'startTime': startTime,
                'duration': duration,
                'importance': importance,
                'description': description,
                'eventType': eventType,
                'user_id': 'Admin',
                'imageUrl': imageUrl,
                'createdAt': firestore.SERVER_TIMESTAMP
                
            }

            firestore_db = current_app.config['FIRESTORE_DB']
            doc_ref = firestore_db.collection('posts').add(event_ref)
            event_id = doc_ref[1].id  # Get the generated document ID
            
            return jsonify({"message": "Post added successfully","id":event_id}), 200

        except Exception as e:
            print("Error:", str(e))
            return jsonify({"message": str(e)}), 400
        

 
@blp.route('/remove_post/<string:postId>', methods=['DELETE'])
class removePost(MethodView):
    def delete(self,postId):
        try:
            firestore_db = current_app.config['FIRESTORE_DB']
            firestore_db.collection('posts').document(postId).delete()
            return jsonify({"message": "Post removed successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400
        

@blp.route('/update_post/<string:postId>', methods=['PUT'])
class updatePost(MethodView):
    def put(self,postId):
        try:
            post_data = request.json
            firestore_db = current_app.config['FIRESTORE_DB']
            firestore_db.collection('posts').document(postId).update(post_data)
            return jsonify({"message": "Post updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400