# test_users.py
import pytest
from api_endpoints import APIEndpoints
from random_word import RandomWords
import logging

log = logging.getLogger(__name__)

@pytest.fixture(scope="module")
def user_data():
    r = RandomWords()
    username = "test_" + r.get_random_word()
    email = username + "@testmail.com"
    pin = "1234"
    # Skapa användaren
    response = APIEndpoints.create_user(username, email, pin)
    assert response.status_code == 200
    return {"username": username, "email": email, "pin": pin, "api_key": response.json()["api_key"]}

def test_create_user(user_data):
    assert user_data["api_key"] is not None
    log.info(f"User {user_data['username']} created successfully.")

def test_login_user(user_data):
    response = APIEndpoints.login_user(user_data["username"], user_data["pin"])
    assert response.status_code == 200
    assert "LOGGED IN" in response.json()["message"]
    log.info(f"User {user_data['username']} logged in successfully.")

def test_delete_user(user_data):
    response = APIEndpoints.delete_user(user_data["api_key"])
    assert response.status_code == 200
    assert "success" in response.json()
    log.info(f"User {user_data['username']} deleted successfully.")
