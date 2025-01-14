# conftest.py

import pytest
from random_word import RandomWords
from api_endpoints import APIEndpoints
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
    api_key = response.json().get("api_key")
    assert api_key is not None, "API key was not returned during user creation"
    log.info(f"User {username} created with API key {api_key}")
    return {"username": username, "email": email, "pin": pin, "api_key": api_key}
