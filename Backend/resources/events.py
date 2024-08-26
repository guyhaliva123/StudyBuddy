from flask.views import MethodView
from flask_smorest import Blueprint, abort
from flask import request, jsonify, current_app
import firebase_admin
from firebase_admin import credentials, firestore, auth
import requests
import datetime


blp = Blueprint('events', __name__, description='Operations on events')


def verify_firebase_token(id_token):
    firebase_config = current_app.config['FIREBASE_CONFIG']
    verify_url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={firebase_config['apiKey']}"
    response = requests.post(verify_url, json={'idToken': id_token})
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception("Token verification failed")
    

@blp.route('/add_event', methods=['POST'])
class addEvent(MethodView):
    def post(self):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"message": "Missing or invalid token"}), 401

            id_token = auth_header.split(' ')[1]
            decoded_token = verify_firebase_token(id_token)
            user_id = decoded_token['users'][0]['localId']

            data = request.get_json()
            print(f"Received data: {data}")  # Debugging statement

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
                'user_id': user_id,
                'imageUrl': imageUrl,  # Save image URL if provided
                'createdAt': firestore.SERVER_TIMESTAMP
            }
            
            firestore_db = current_app.config['FIRESTORE_DB']
            doc_ref = firestore_db.collection('events').add(event_ref)
            event_id = doc_ref[1].id  # Get the generated document ID
            return jsonify({"message": "Event added successfully", "id": event_id}), 200

        except Exception as e:
            print("Error:", str(e))
            return jsonify({"message": str(e)}), 400
        
    

@blp.route('/get_events', methods=['GET'])
class getEvents(MethodView):
    def get(self):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"message": "Missing or invalid token"}), 401

            id_token = auth_header.split(' ')[1]
            decoded_token = verify_firebase_token(id_token)
            user_id = decoded_token['users'][0]['localId']

            firestore_db = current_app.config['FIRESTORE_DB']

            events_ref = firestore_db.collection('events').where('user_id', '==', user_id)
            events = events_ref.stream()

            events_list = []
            for event in events:
                event_data = event.to_dict()
                event_data['id'] = event.id
                events_list.append(event_data)
            
            return jsonify(events_list), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 400
        


@blp.route('/remove_event/<string:eventId>', methods=['DELETE'])
class removeEvent(MethodView):
    def delete(self,eventId):
        try:
            firestore_db = current_app.config['FIRESTORE_DB']
            # Fetch the event data to get the photo URL
            event_doc = firestore_db.collection('events').document(eventId).get()
            if not event_doc.exists:
                return jsonify({"message": "Event not found"}), 404

            event_data = event_doc.to_dict()
            image_url = event_data.get('imageUrl')
            
            # Delete the event document from Firestore
            firestore_db.collection('events').document(eventId).delete()
            print('Event removed successfully')
            # Remove the photo from Firebase Storage if it exists
            if image_url:
                bucket = current_app.config['STORAGE_BUCKET']
                # Extract the file path from the URL
                # Example: "https://storage.googleapis.com/group15-c52b4.appspot.com/VQNrh6W2YyOEIpFjpKaezV5Lqto1/sce.png"
                file_path = image_url.split("group15-c52b4.appspot.com/")[1]
                blob = bucket.blob(file_path)
                #blob.delete()
                
            return jsonify({"message": "Event removed successfully"}), 200
        except Exception as e:
            print("Error:", str(e))
            return jsonify({"error": str(e)}), 400
        

@blp.route('/update_event/<string:eventId>', methods=['PUT'])
class updateEvent(MethodView):
    def put(self,eventId):
        try:
            event_data = request.json
            firestore_db = current_app.config['FIRESTORE_DB']
            # Fetch the current event data to get the old photo URL
            event_doc = firestore_db.collection('events').document(eventId).get()
            if not event_doc.exists:
                return jsonify({"message": "Event not found"}), 404

            current_event_data = event_doc.to_dict()
            old_image_url = current_event_data.get('imageUrl')
            new_image_url = event_data.get('imageUrl')

            # Delete the old photo blob if a new photo URL is provided and it is different from the old one
            if new_image_url and old_image_url and new_image_url != old_image_url:
                bucket = current_app.config['STORAGE_BUCKET']
                old_file_path = old_image_url.split("group15-c52b4.appspot.com/")[1]
                old_blob = bucket.blob(old_file_path)
                old_blob.delete()

            # Update the event document with the new data
            firestore_db.collection('events').document(eventId).update(event_data)
            print('Event updated successfully')
            return jsonify({"message": "Event updated successfully"}), 200

        except Exception as e:
            print("Error:", str(e))
            return jsonify({"error": str(e)}), 400
        

@blp.route('/upload_image', methods=['POST'])
class uploudImage(MethodView):
    def post(self):
        try:
            auth_header = request.headers.get('Authorization')
            print(f"Authorization Header: {auth_header}")  # Log the Authorization header
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"message": "Missing or invalid token"}), 401

            id_token = auth_header.split(' ')[1]
            decoded_token = verify_firebase_token(id_token)
            print(f"Decoded Token: {decoded_token}")  # Log the decoded token
            user_id = decoded_token['users'][0]['localId']

            if 'file' not in request.files:
                return jsonify({'message': 'No file part'}), 400

            file = request.files['file']
            if file.filename == '':
                return jsonify({'message': 'No selected file'}), 400
            
            bucket = current_app.config['STORAGE_BUCKET']
            
            # Create a blob object with the file name
            blob = bucket.blob(user_id + '/' + file.filename)
            blob.upload_from_file(file)

            # Make the blob publicly accessible
            blob.make_public()

            return jsonify({'file_url': blob.public_url}), 200
        except Exception as e:
            print("Error:", str(e))
            return jsonify({'message': str(e)}), 400
        

@blp.route('/rank_event/<string:eventId>', methods=['PUT'])
class rankEvent(MethodView):
    def put(self, eventId):
        try:
            firestore_db = current_app.config['FIRESTORE_DB']
            data = request.get_json()
            rank = data.get('rank')

            if rank is None:
                return jsonify({"message": "Rank value is required"}), 400

            event_ref = firestore_db.collection('events').document(eventId)
            event_ref.update({"rank": rank, "isRanked": True})

            return jsonify({"message": "Event ranked successfully"}), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 400



# @blp.route('/rank_event/<string:eventId>', methods=['PUT'])
# class rankEvent(MethodView):
#     def put(self, eventId):
#         try:
#             firestore_db = current_app.config['FIRESTORE_DB']
#             data = request.get_json()
#             rank = data.get('rank')

#             if rank is None:
#                 return jsonify({"message": "Rank value is required"}), 400

#             event_ref = firestore_db.collection('events').document(eventId)
#             event_ref.update({"rank": rank, "isRanked": True})

#             event = event_ref.get().to_dict()
#             user_id = event['user_id']
#             start_time = event['startTime']
#             current_week = datetime.datetime.fromisoformat(start_time).isocalendar()[1]

#             events_in_week = firestore_db.collection('events').where('user_id', '==', user_id).where('weekNumber', '==', current_week).stream()
#             all_ranked = all(event.to_dict().get('isRanked', False) for event in events_in_week)

#             return jsonify({"message": "Event ranked successfully"}), 200
#         except Exception as e:
#             return jsonify({"message":str(e)}),400