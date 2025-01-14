import requests
import pytest
from api_endpoints import APIEndpoints
from random_word import RandomWords
import logging

log = logging.getLogger(__name__)
BASE_URL = "http://alvhage.se/api"

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

def test_forgot_email_found(user_data):
    """Testa om forgot.php fungerar för en giltig e-postadress."""
    email = "valid_user@example.com"
    response = requests.post(f"{BASE_URL}/forgot.php", data={"email": email})
    assert response.status_code == 200
    assert response.json()["message"] == "OK"

def test_forgot_email_not_found(user_data):
    """Testa om forgot.php returnerar rätt svar för ogiltig e-postadress."""
    email = "nonexistent_user@example.com"
    response = requests.post(f"{BASE_URL}/forgot.php", data={"email": email})
    assert response.status_code == 400
    assert response.json()["error"] == "E-mail not found."

def test_reset_valid_token(user_data):
    """Testa om reset.php fungerar för en giltig token."""
    reset_token = "valid_reset_token"
    new_pin = "1234"
    response = requests.post(f"{BASE_URL}/reset.php?token={reset_token}", data={"pin": new_pin})
    assert response.status_code == 200
    assert "Your PIN has been successfully reset." in response.text

def test_reset_invalid_token(user_data):
    """Testa om reset.php returnerar rätt svar för ogiltig token."""
    reset_token = "invalid_reset_token"
    response = requests.get(f"{BASE_URL}/reset.php?token={reset_token}")
    assert response.status_code == 200
    assert "Invalid reset token." in response.text

def test_reset_missing_token(user_data):
    """Testa om reset.php hanterar saknade tokens korrekt."""
    response = requests.get(f"{BASE_URL}/reset.php")
    assert response.status_code == 200
    assert "Invalid reset token." in response.text

def test_delete_user(user_data):
    response = APIEndpoints.delete_user(user_data["api_key"])
    assert response.status_code == 200
    assert "success" in response.json()
    log.info(f"User {user_data['username']} deleted successfully.")