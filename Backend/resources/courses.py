from flask.views import MethodView
from flask_smorest import Blueprint, abort
from flask import request, jsonify, current_app
import firebase_admin
from firebase_admin import credentials, firestore, auth
import requests

blp = Blueprint('courses', __name__, description='Operations on users')


def verify_firebase_token(id_token):
    firebase_config = current_app.config['FIREBASE_CONFIG']
    verify_url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={firebase_config['apiKey']}"
    response = requests.post(verify_url, json={'idToken': id_token})
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception("Token verification failed")
    

@blp.route('/add_course', methods=['POST'])
class addCourse(MethodView):
    def post(self):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"message": "Missing or invalid token"}), 401

            id_token = auth_header.split(' ')[1]
            decoded_token = verify_firebase_token(id_token)
            user_id = decoded_token['users'][0]['localId']

            data = request.get_json()  # Parse JSON data from request body

            name = data.get('name')
            instructor = data.get('instructor')
            startDate = data.get('startDate')
            duration = data.get('duration')
            level = data.get('level')
            description = data.get('description')
            days = data.get('days')

            if not name or not startDate or not duration or not level or not description or not instructor or not days:
                return jsonify({"message": "Missing course data"}), 400

            course_ref = {
                'name': name,
                'instructor': instructor,
                'startDate': startDate,
                'duration': duration,
                'level': level,
                'description': description,
                'days': days,
                'user_id': user_id,
                'createdAt': firestore.SERVER_TIMESTAMP
            }

            firestore_db = current_app.config['FIRESTORE_DB']
            doc_ref = firestore_db.collection('courses').add(course_ref)
            course_id = doc_ref[1].id  # Get the generated document ID
            return jsonify({"message": "Course added successfully", "id": course_id}), 200

        except Exception as e:
            return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@blp.route('/get_courses', methods=['GET'])
class getCourses(MethodView):
    def get(self):
        try:
            firestore_db = current_app.config['FIRESTORE_DB']
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"message": "Missing or invalid token"}), 401

            id_token = auth_header.split(' ')[1]
            decoded_token = verify_firebase_token(id_token)
            user_id = decoded_token['users'][0]['localId']

            user_type = request.args.get('userType')
            if user_type == 'lecturer':
                courses_ref = firestore_db.collection('courses').where('user_id', '==', user_id)
            else :
                courses_ref = firestore_db.collection('courses')
            
            courses_stream = courses_ref.stream()

            courses_list = []
            for course in courses_stream:
                course_data = course.to_dict()
                course_data['id'] = course.id
                courses_list.append(course_data)

            # print("Courses fetched from DB:", courses_list)  # Debug print

            return jsonify(courses_list), 200
        except Exception as e:
            print("Error:", str(e))  # Debug print
            return jsonify({"message": str(e)}), 400


        
@blp.route('/remove_course/<string:courseId>', methods=['DELETE'])
class removeCourse(MethodView):
    def delete(self,courseId):
        try:
            firestore_db = current_app.config['FIRESTORE_DB']
            firestore_db.collection('courses').document(courseId).delete()
            return jsonify({"message": "Event removed successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400

@blp.route('/update_course/<string:courseId>', methods=['PUT'])
class updateCourse(MethodView):
    def put(self,courseId):
        try:
            course_data = request.json
            firestore_db = current_app.config['FIRESTORE_DB']
            firestore_db.collection('courses').document(courseId).update(course_data)
            return jsonify({"message": "course updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400
        
@blp.route('/upload_file/<string:courseId>', methods=['POST'])
class upload_file(MethodView):
    def post(self,courseId):
        try:
            firestore_db = current_app.config['FIRESTORE_DB']
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"message": "Missing or invalid token"}), 401

            id_token = auth_header.split(' ')[1]
            decoded_token = verify_firebase_token(id_token)

            if 'file' not in request.files:
                return jsonify({'message': 'No file part'}), 400

            file = request.files['file']
            if file.filename == '':
                return jsonify({'message': 'No selected file'}), 400

            bucket= current_app.config['STORAGE_BUCKET']
            # Create a blob object with the file name
            blob = bucket.blob(f'courses/{courseId}/{file.filename}')
            blob.upload_from_file(file)

            # Make the blob publicly accessible
            blob.make_public()

            # Update course document with file URL
            firestore_db.collection('courses').document(courseId).update({
                'pdfUrls': firestore.ArrayUnion([blob.public_url])  # Ensure this updates the document
            })

            return jsonify({'file_url': blob.public_url}), 200
        except Exception as e:
            print("Error:", str(e))
            return jsonify({'message': str(e)}), 400


@blp.route('/get_course_users/<string:courseId>', methods=['GET'])
class GetCourseUsers(MethodView):
    def get(self, courseId):
        try:
            firestore_db = current_app.config['FIRESTORE_DB']
            
            users_collection = firestore_db.collection('users')
            users = users_collection.stream()
            registered_user_ids = []

            for user_doc in users:
                user_info = user_doc.to_dict()
                courses = user_info.get('courses', [])
                if courseId in courses:
                    registered_user_ids.append(user_doc.id)

            user_full_names = []
            for user_id in registered_user_ids:
                user_doc = firestore_db.collection('users').document(user_id).get()
                if user_doc.exists:
                    user_info = user_doc.to_dict()
                    full_name = user_info.get('fullName')
                    if full_name:
                        user_full_names.append(full_name)
                    else:
                        print(f"User {user_id} has no 'fullName' field")  # Debugging line
                else:
                    print(f"User document {user_id} not found")  # Debugging line

            print(f"User Full Names: {user_full_names}")  # Debugging line
            return jsonify(user_full_names), 200
        except Exception as e:
            print(f"Error: {str(e)}")  # Debugging line
            return jsonify({"message": str(e)}), 400
        

@blp.route('/get_course_users_ID/<string:courseId>', methods=['GET'])
class GetCourseUsers(MethodView):
    def get(self, courseId):
        try:
            firestore_db = current_app.config['FIRESTORE_DB']
            
            users_collection = firestore_db.collection('users')
            users = users_collection.stream()
            registered_user_ids = []

            for user_doc in users:
                user_info = user_doc.to_dict()
                courses = user_info.get('courses', [])
                id = user_info.get('user_id')
                if courseId in courses:
                    registered_user_ids.append(id)

            print(f"User Full Names: {registered_user_ids}")  # Debugging line
            return jsonify(registered_user_ids), 200
        except Exception as e:
            print(f"Error: {str(e)}")  # Debugging line
            return jsonify({"message": str(e)}), 400
        


@blp.route('/add_notification', methods=['POST'])
class AddNotification(MethodView):
    def post(self):
        try:
            firestore_db = current_app.config['FIRESTORE_DB']
            data = request.get_json()
            user_ids = data.get('user_ids')
            message = data.get('message')

            if not user_ids or not message:
                return jsonify({"success": False, "error": "Invalid data"}), 400

            notification_ref = {
                'user_ids': user_ids,
                'message': message
            }

            doc_ref = firestore_db.collection('notification').add(notification_ref)

            # Debugging
            print(f"Document Reference Type: {type(doc_ref)}")
            print(f"Document Reference Content: {doc_ref}")

         
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500
