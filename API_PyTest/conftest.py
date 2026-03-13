"""Shared fixtures for SkafferiAppen API tests."""

import uuid
import logging

import pytest
from api_endpoints import APIEndpoints

log = logging.getLogger(__name__)


def _unique_name():
    """Return a short unique string safe for use as a DB table name."""
    return "t_" + uuid.uuid4().hex[:10]


@pytest.fixture(scope="module")
def test_user():
    """Create a throwaway user for a test module and delete it afterwards.

    Yields a dict with keys: username, email, pin, api_key.
    """
    username = _unique_name()
    email = f"{username}@pytest.test"
    pin = "9876"

    resp = APIEndpoints.create_user(username, email, pin)
    assert resp.status_code == 200, f"User creation failed: {resp.text}"
    body = resp.json()
    assert body.get("api_key"), "No api_key in create-user response"

    user = {
        "username": username,
        "email": email,
        "pin": pin,
        "api_key": body["api_key"],
    }
    log.info("Created test user %s", username)

    yield user

    # ---- teardown: best-effort cleanup ----
    log.info("Tearing down test user %s", username)
    # Delete all products first so the user tables are empty
    APIEndpoints.delete_product(user["api_key"], "", "ALLPRODUCTS")
    APIEndpoints.delete_product(user["api_key"], "shopping", "ALLPRODUCTS")
    del_resp = APIEndpoints.delete_user(user["api_key"])
    if del_resp.status_code == 200:
        log.info("Deleted test user %s", username)
    else:
        log.warning("Failed to delete test user %s: %s", username, del_resp.text)
