import pytest
from flask import Flask
from app import app as flask_app

# Use the pytest fixture to create a test client
@pytest.fixture
def app():
    yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()


# validation tests 
def test_register_invalid_email(client):
    response = client.post('/register', json={
        'email': 'invalidemail',
        'password': 'password123',
        'dateOfBirth': '2000-01-01',
        'type': 'student',
        'receiveNews': True
    })
    assert response.status_code == 400  
    assert response.get_json()['message'] == "Something went wrong pleasr try again."


def test_login_invalid_password(client):
    response = client.post('/login', json={
        'username': 'testuser@example.com',
        'password': 'wrongpassword'
    })
    assert response.status_code == 400  
    assert response.get_json()['message'] == "Invalid credentials."
