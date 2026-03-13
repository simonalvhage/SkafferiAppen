"""Wrapper for the SkafferiAppen REST API."""

import requests
import logging

log = logging.getLogger(__name__)

BASE_URL = "https://alvhage.se/api"


class APIEndpoints:
    """Thin wrapper around the SkafferiAppen PHP API.

    Methods return the raw ``requests.Response`` without calling
    ``raise_for_status()`` so that tests can assert on error codes too.
    """

    # ------------------------------------------------------------------
    # User management
    # ------------------------------------------------------------------

    @staticmethod
    def create_user(username, email, pin):
        url = f"{BASE_URL}/new.php"
        data = {"username": username, "email": email, "pin": pin}
        log.info("POST %s  username=%s", url, username)
        resp = requests.post(url, data=data, timeout=15)
        log.debug("Response %s: %s", resp.status_code, resp.text)
        return resp

    @staticmethod
    def login_user(username, pin):
        url = f"{BASE_URL}/login.php"
        data = {"username": username, "pin": pin}
        log.info("POST %s  username=%s", url, username)
        resp = requests.post(url, data=data, timeout=15)
        log.debug("Response %s: %s", resp.status_code, resp.text)
        return resp

    @staticmethod
    def delete_user(api_key):
        url = f"{BASE_URL}/delete_user.php"
        data = {"api_key": api_key}
        log.info("POST %s  api_key=%s", url, api_key)
        resp = requests.post(url, data=data, timeout=15)
        log.debug("Response %s: %s", resp.status_code, resp.text)
        return resp

    @staticmethod
    def forgot_password(email):
        url = f"{BASE_URL}/forgot.php"
        data = {"email": email}
        log.info("POST %s  email=%s", url, email)
        resp = requests.post(url, data=data, timeout=15)
        log.debug("Response %s: %s", resp.status_code, resp.text)
        return resp

    # ------------------------------------------------------------------
    # Products
    # ------------------------------------------------------------------

    @staticmethod
    def post_product(api_key, list_name, ean, product):
        url = f"{BASE_URL}/post.php"
        data = {"api_key": api_key, "list": list_name, "EAN": ean, "product": product}
        log.info("POST %s  EAN=%s list=%s", url, ean, list_name or "pantry")
        resp = requests.post(url, data=data, timeout=15)
        log.debug("Response %s: %s", resp.status_code, resp.text)
        return resp

    @staticmethod
    def get_product(api_key, list_name="", ean=""):
        url = f"{BASE_URL}/get.php"
        params = {"api_key": api_key, "list": list_name, "EAN": ean}
        log.info("GET %s  EAN=%s list=%s", url, ean, list_name or "pantry")
        resp = requests.get(url, params=params, timeout=15)
        log.debug("Response %s: %s", resp.status_code, resp.text)
        return resp

    @staticmethod
    def get_public_product(ean=""):
        """Query the public ALL table (no api_key)."""
        url = f"{BASE_URL}/get.php"
        params = {"EAN": ean} if ean else {}
        log.info("GET %s (public)  EAN=%s", url, ean)
        resp = requests.get(url, params=params, timeout=15)
        log.debug("Response %s: %s", resp.status_code, resp.text)
        return resp

    @staticmethod
    def delete_product(api_key, list_name, ean):
        url = f"{BASE_URL}/delete.php"
        params = {"api_key": api_key, "list": list_name, "EAN": ean}
        log.info("GET %s  EAN=%s list=%s", url, ean, list_name or "pantry")
        resp = requests.get(url, params=params, timeout=15)
        log.debug("Response %s: %s", resp.status_code, resp.text)
        return resp
