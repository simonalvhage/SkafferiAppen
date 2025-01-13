# test_products.py

import pytest
from api_endpoints import APIEndpoints
import logging

log = logging.getLogger(__name__)

@pytest.fixture(scope="module")
def product_data(user_data):
    return {
        "api_key": user_data["api_key"],
        "list_name": "shopping",
        "ean": "1234567890123",
        "product": "TestProduct"
    }

def test_add_product_to_pantry(user_data):
    ean_data = ["0041500962566", "5705830000170", "7300156493934"]
    for ean in ean_data:
        response = APIEndpoints.post_product(user_data["api_key"], "", ean, "test_product")
        assert response.status_code == 200
        assert "Success" in response.json()
        log.info(f"Product with EAN {ean} added to pantry successfully.")

def test_add_product_to_shopping(user_data):
    ean_data = ["0041500962566", "5705830000170", "7300156493934"]
    for ean in ean_data:
        response = APIEndpoints.post_product(user_data["api_key"], "shopping", ean, "test_product")
        assert response.status_code == 200
        assert "Success" in response.json()
        log.info(f"Product with EAN {ean} added to shopping list successfully.")

def test_get_product_from_pantry(user_data):
    ean = "0041500962566"
    response = APIEndpoints.get_product(user_data["api_key"], "", ean)
    assert response.status_code == 200
    assert response.json()["status"] == 1
    log.info(f"Product with EAN {ean} retrieved from pantry successfully.")

def test_get_product_from_shopping(user_data):
    ean = "5705830000170"
    response = APIEndpoints.get_product(user_data["api_key"], "shopping", ean)
    assert response.status_code == 200
    assert response.json()["status"] == 1
    log.info(f"Product with EAN {ean} retrieved from shopping list successfully.")

def test_delete_product_from_pantry(user_data):
    ean = "0041500962566"
    response = APIEndpoints.delete_product(user_data["api_key"], "", ean)
    assert response.status_code == 200
    assert "Success" in response.json()
    log.info(f"Product with EAN {ean} deleted from pantry successfully.")

def test_delete_product_from_shopping(user_data):
    ean = "5705830000170"
    response = APIEndpoints.delete_product(user_data["api_key"], "shopping", ean)
    assert response.status_code == 200
    assert "Success" in response.json()
    log.info(f"Product with EAN {ean} deleted from shopping list successfully.")

'''Work in progress
def test_invalid_ean(user_data):
    ean = "0000000000000"
    response = APIEndpoints.post_product(user_data["api_key"], "", ean, "invalid_product")
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}"
    log.info(f"Response for invalid EAN {ean}: {response.json()}")

    # Verify the product was not added
    get_response = APIEndpoints.get_product(user_data["api_key"], "", ean)
    assert get_response.status_code == 200
    assert get_response.json().get("status") == 0, f"Invalid EAN {ean} unexpectedly found in pantry."
    log.info(f"Invalid EAN {ean} was not added to pantry as expected.")
'''

def test_invalid_api_key():
    api_key = "invalid_api_key"
    ean = "0041500962566"
    response = APIEndpoints.get_product(api_key, "", ean)
    assert response.status_code == 403 or response.json().get("status") == 0
    log.info(f"Invalid API key {api_key} was handled correctly.")

