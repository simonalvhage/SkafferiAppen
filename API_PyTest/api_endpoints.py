# api_endpoints.py
import requests
import logging

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

class APIEndpoints:
    base_url = "https://alvhage.se/api"

    @staticmethod
    def create_user(username, email, pin):
        url = f"{APIEndpoints.base_url}/new.php"
        data = {"username": username, "email": email, "pin": pin}
        log.info(f"Creating user: {username}")
        response = requests.post(url, data=data)
        response.raise_for_status()
        log.debug(f"Response: {response.json()}")
        return response

    @staticmethod
    def delete_user(api_key):
        url = f"{APIEndpoints.base_url}/delete_user.php"
        data = {"api_key": api_key}
        log.info(f"Deleting user with API key: {api_key}")
        response = requests.post(url, data=data)
        response.raise_for_status()
        log.debug(f"Response: {response.json()}")
        return response

    @staticmethod
    def login_user(username, pin):
        url = f"{APIEndpoints.base_url}/login.php"
        data = {"username": username, "pin": pin}
        log.info(f"Logging in user: {username}")
        response = requests.post(url, data=data)
        response.raise_for_status()
        log.debug(f"Response: {response.json()}")
        return response

    @staticmethod
    def post_product(api_key, list_name, ean, product):
        url = f"{APIEndpoints.base_url}/post.php"
        data = {"api_key": api_key, "list": list_name, "EAN": ean, "product": product}
        log.info(f"Posting product {product} to list {list_name}")
        response = requests.post(url, data=data)
        response.raise_for_status()
        log.debug(f"Response: {response.json()}")
        return response

    @staticmethod
    def get_product(api_key, list_name, ean):
        url = f"{APIEndpoints.base_url}/get.php"
        params = {"api_key": api_key, "list": list_name, "EAN": ean}
        log.info(f"Fetching product with EAN {ean} from list {list_name}")
        response = requests.get(url, params=params)
        response.raise_for_status()
        log.debug(f"Response: {response.json()}")
        return response

    @staticmethod
    def delete_product(api_key, list_name, ean):
        url = f"{APIEndpoints.base_url}/delete.php"
        params = {"api_key": api_key, "list": list_name, "EAN": ean}
        log.info(f"Deleting product with EAN {ean} from list {list_name}")
        response = requests.get(url, params=params)
        response.raise_for_status()
        log.debug(f"Response: {response.json()}")
        return response
