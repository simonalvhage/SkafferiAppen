"""Tests for product endpoints: post, get, delete (pantry and shopping lists)."""

import logging

import pytest
from api_endpoints import APIEndpoints

log = logging.getLogger(__name__)

# Sample EANs used across tests
EANS = ["0041500962566", "5705830000170", "7300156493934"]


# ---------------------------------------------------------------------------
# Add products (POST /post.php)
# ---------------------------------------------------------------------------

class TestPostProduct:
    """Tests for POST /post.php."""

    @pytest.mark.parametrize("ean", EANS)
    def test_add_product_to_pantry(self, test_user, ean):
        resp = APIEndpoints.post_product(
            test_user["api_key"], "", ean, f"product_{ean}"
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body.get("status") == 1
        assert body.get("Success") == "OK"

    @pytest.mark.parametrize("ean", EANS)
    def test_add_product_to_shopping(self, test_user, ean):
        resp = APIEndpoints.post_product(
            test_user["api_key"], "shopping", ean, f"product_{ean}"
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body.get("status") == 1
        assert body.get("Success") == "OK"

    def test_add_product_missing_ean(self, test_user):
        resp = APIEndpoints.post_product(
            test_user["api_key"], "", "", "some_product"
        )
        body = resp.json()
        assert body.get("status") == 0
        assert "missing" in body.get("error", "").lower()

    def test_add_product_missing_name(self, test_user):
        resp = APIEndpoints.post_product(
            test_user["api_key"], "", "1111111111111", ""
        )
        body = resp.json()
        assert body.get("status") == 0
        assert "missing" in body.get("error", "").lower()

    def test_add_product_invalid_api_key(self):
        resp = APIEndpoints.post_product(
            "invalid_key_xyz", "", "1234567890123", "TestProd"
        )
        body = resp.json()
        assert body.get("status") == 0
        assert "invalid" in body.get("error", "").lower()


# ---------------------------------------------------------------------------
# Get products (GET /get.php)
# ---------------------------------------------------------------------------

class TestGetProduct:
    """Tests for GET /get.php.

    Assumes TestPostProduct has already added products for the same
    module-scoped test_user.
    """

    @pytest.mark.parametrize("ean", EANS)
    def test_get_product_from_pantry(self, test_user, ean):
        # Make sure the product exists
        APIEndpoints.post_product(test_user["api_key"], "", ean, f"product_{ean}")
        resp = APIEndpoints.get_product(test_user["api_key"], "", ean)
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == 1
        assert isinstance(body.get("info"), list)
        assert len(body["info"]) > 0

    @pytest.mark.parametrize("ean", EANS)
    def test_get_product_from_shopping(self, test_user, ean):
        APIEndpoints.post_product(test_user["api_key"], "shopping", ean, f"product_{ean}")
        resp = APIEndpoints.get_product(test_user["api_key"], "shopping", ean)
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == 1
        assert isinstance(body.get("info"), list)

    def test_get_nonexistent_product(self, test_user):
        resp = APIEndpoints.get_product(test_user["api_key"], "", "0000000000000")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == 0
        assert "not found" in body.get("error", "").lower()

    def test_get_product_invalid_api_key(self):
        resp = APIEndpoints.get_product("invalid_key_xyz", "", "0041500962566")
        body = resp.json()
        assert body["status"] == 0
        assert "invalid" in body.get("error", "").lower()

    def test_get_all_pantry_products(self, test_user):
        """Fetch all products (no EAN filter) from the user's pantry."""
        # Ensure at least one product exists
        APIEndpoints.post_product(test_user["api_key"], "", EANS[0], "ensure_exists")
        resp = APIEndpoints.get_product(test_user["api_key"], "")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == 1
        assert isinstance(body.get("info"), list)

    def test_get_public_product(self):
        """Query the public table without an API key."""
        resp = APIEndpoints.get_public_product()
        # The public endpoint should return something (status 1 or 0)
        assert resp.status_code == 200
        body = resp.json()
        assert "status" in body


# ---------------------------------------------------------------------------
# Delete products (GET /delete.php)
# ---------------------------------------------------------------------------

class TestDeleteProduct:
    """Tests for GET /delete.php."""

    def test_delete_single_product_from_pantry(self, test_user):
        ean = "9999999999901"
        APIEndpoints.post_product(test_user["api_key"], "", ean, "to_delete")

        resp = APIEndpoints.delete_product(test_user["api_key"], "", ean)
        assert resp.status_code == 200
        body = resp.json()
        assert body.get("status") == 1
        assert body.get("Success") == "OK"

        # Verify it's gone
        get_resp = APIEndpoints.get_product(test_user["api_key"], "", ean)
        assert get_resp.json().get("status") == 0

    def test_delete_single_product_from_shopping(self, test_user):
        ean = "9999999999902"
        APIEndpoints.post_product(test_user["api_key"], "shopping", ean, "to_delete")

        resp = APIEndpoints.delete_product(test_user["api_key"], "shopping", ean)
        assert resp.status_code == 200
        body = resp.json()
        assert body.get("status") == 1
        assert body.get("Success") == "OK"

        get_resp = APIEndpoints.get_product(test_user["api_key"], "shopping", ean)
        assert get_resp.json().get("status") == 0

    def test_delete_nonexistent_product(self, test_user):
        resp = APIEndpoints.delete_product(
            test_user["api_key"], "", "0000000000099"
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body.get("status") == 1
        assert body.get("error") == "NOT OK"

    def test_delete_all_products_pantry(self, test_user):
        """EAN=ALLPRODUCTS should wipe the pantry list."""
        # Add a product so there's something to delete
        APIEndpoints.post_product(test_user["api_key"], "", "8880000000001", "bulk1")
        APIEndpoints.post_product(test_user["api_key"], "", "8880000000002", "bulk2")

        resp = APIEndpoints.delete_product(test_user["api_key"], "", "ALLPRODUCTS")
        assert resp.status_code == 200
        body = resp.json()
        assert body.get("status") == 1

        # Verify pantry is empty
        get_resp = APIEndpoints.get_product(test_user["api_key"], "", "8880000000001")
        assert get_resp.json().get("status") == 0

    def test_delete_all_products_shopping(self, test_user):
        """EAN=ALLPRODUCTS should wipe the shopping list."""
        APIEndpoints.post_product(test_user["api_key"], "shopping", "8880000000003", "bulk3")

        resp = APIEndpoints.delete_product(test_user["api_key"], "shopping", "ALLPRODUCTS")
        assert resp.status_code == 200
        body = resp.json()
        assert body.get("status") == 1

        get_resp = APIEndpoints.get_product(test_user["api_key"], "shopping", "8880000000003")
        assert get_resp.json().get("status") == 0


# ---------------------------------------------------------------------------
# Full CRUD lifecycle
# ---------------------------------------------------------------------------

class TestProductLifecycle:
    """End-to-end: add -> get -> delete -> verify gone."""

    @pytest.mark.parametrize("list_name", ["", "shopping"])
    def test_full_crud_cycle(self, test_user, list_name):
        ean = "5550000000001"
        product_name = "lifecycle_test_product"

        # Create
        post_resp = APIEndpoints.post_product(
            test_user["api_key"], list_name, ean, product_name
        )
        assert post_resp.json().get("status") == 1

        # Read
        get_resp = APIEndpoints.get_product(test_user["api_key"], list_name, ean)
        body = get_resp.json()
        assert body["status"] == 1
        assert len(body["info"]) > 0

        # Delete
        del_resp = APIEndpoints.delete_product(test_user["api_key"], list_name, ean)
        assert del_resp.json().get("status") == 1

        # Verify deleted
        verify_resp = APIEndpoints.get_product(test_user["api_key"], list_name, ean)
        assert verify_resp.json().get("status") == 0
