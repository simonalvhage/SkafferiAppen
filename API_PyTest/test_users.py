"""Tests for user-management endpoints: new, login, delete_user, forgot."""

import uuid
import logging

import pytest
from api_endpoints import APIEndpoints

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_username():
    return "t_" + uuid.uuid4().hex[:10]


# ---------------------------------------------------------------------------
# Create user
# ---------------------------------------------------------------------------

class TestCreateUser:
    """Tests for POST /new.php."""

    def test_create_user_success(self):
        username = _make_username()
        email = f"{username}@pytest.test"
        resp = APIEndpoints.create_user(username, email, "1234")

        assert resp.status_code == 200
        body = resp.json()
        assert body["message"] == "OK"
        assert body.get("api_key"), "Expected an api_key in the response"

        # cleanup
        APIEndpoints.delete_user(body["api_key"])

    def test_create_duplicate_user(self):
        username = _make_username()
        email = f"{username}@pytest.test"

        resp1 = APIEndpoints.create_user(username, email, "1234")
        assert resp1.status_code == 200
        api_key = resp1.json()["api_key"]

        try:
            resp2 = APIEndpoints.create_user(username, email, "1234")
            assert resp2.status_code == 400
            assert "already exists" in resp2.json().get("error", "").lower()
        finally:
            APIEndpoints.delete_user(api_key)

    def test_create_user_missing_username(self):
        resp = APIEndpoints.create_user("", f"x@pytest.test", "1234")
        assert resp.status_code != 200 or resp.json().get("error")

    def test_create_user_missing_email(self):
        resp = APIEndpoints.create_user(_make_username(), "", "1234")
        assert resp.status_code != 200 or resp.json().get("error")

    def test_create_user_missing_pin(self):
        resp = APIEndpoints.create_user(_make_username(), "a@b.com", "")
        assert resp.status_code != 200 or resp.json().get("error")


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

class TestLogin:
    """Tests for POST /login.php."""

    def test_login_success(self, test_user):
        resp = APIEndpoints.login_user(test_user["username"], test_user["pin"])
        assert resp.status_code == 200
        body = resp.json()
        assert body["message"] == "LOGGED IN"
        assert body.get("api_key"), "Login should return an api_key"

    def test_login_wrong_pin(self, test_user):
        resp = APIEndpoints.login_user(test_user["username"], "0000")
        assert resp.status_code == 401
        assert "wrong" in resp.json().get("error", "").lower()

    def test_login_wrong_username(self):
        resp = APIEndpoints.login_user("nonexistent_user_xyz", "1234")
        assert resp.status_code == 401
        assert "wrong" in resp.json().get("error", "").lower()

    def test_login_missing_username(self):
        resp = APIEndpoints.login_user("", "1234")
        assert resp.status_code == 400
        assert "missing" in resp.json().get("error", "").lower()

    def test_login_missing_pin(self, test_user):
        resp = APIEndpoints.login_user(test_user["username"], "")
        assert resp.status_code == 400
        assert "missing" in resp.json().get("error", "").lower()


# ---------------------------------------------------------------------------
# Delete user
# ---------------------------------------------------------------------------

class TestDeleteUser:
    """Tests for POST /delete_user.php."""

    def test_delete_user_success(self):
        username = _make_username()
        email = f"{username}@pytest.test"
        create_resp = APIEndpoints.create_user(username, email, "1234")
        assert create_resp.status_code == 200
        api_key = create_resp.json()["api_key"]

        resp = APIEndpoints.delete_user(api_key)
        assert resp.status_code == 200
        assert resp.json().get("success") is True

    def test_delete_user_invalid_key(self):
        resp = APIEndpoints.delete_user("totally_invalid_key_12345")
        assert resp.status_code == 404
        assert "not found" in resp.json().get("error", "").lower()

    def test_delete_user_missing_key(self):
        resp = APIEndpoints.delete_user("")
        assert resp.status_code == 400
        assert "missing" in resp.json().get("error", "").lower()


# ---------------------------------------------------------------------------
# Forgot password
# ---------------------------------------------------------------------------

class TestForgotPassword:
    """Tests for POST /forgot.php."""

    def test_forgot_success(self, test_user):
        resp = APIEndpoints.forgot_password(test_user["email"])
        assert resp.status_code == 200
        assert resp.json().get("message") == "OK"

    def test_forgot_unknown_email(self):
        resp = APIEndpoints.forgot_password("nobody_here@pytest.test")
        assert resp.status_code == 400
        assert "not found" in resp.json().get("error", "").lower()
