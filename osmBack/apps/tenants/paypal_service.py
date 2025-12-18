import requests
import logging
from django.conf import settings
from optics_tenant.config_loader import config
from apps.tenants.models import Payment, SubscriptionPlan, Client
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from rest_framework import status

logger = logging.getLogger('paypal')

# PayPal Config
PAYPAL_CLIENT_ID = config("PAYPAL_CLIENT_ID")
PAYPAL_SECRET = config("PAYPAL_CLIENT_SECRET")
PAYPAL_MODE = config("PAYPAL_MODE", default="sandbox")

def get_base_url():
    if PAYPAL_MODE == "live":
        return "https://api-m.paypal.com"
    return "https://api-m.sandbox.paypal.com"

def get_paypal_access_token():
    """Get Access Token from PayPal v2"""
    auth = (PAYPAL_CLIENT_ID, PAYPAL_SECRET)
    data = {"grant_type": "client_credentials"}
    
    try:
        response = requests.post(
            f"{get_base_url()}/v1/oauth2/token",
            auth=auth,
            data=data
        )
        response.raise_for_status()
        return response.json().get("access_token")
    except Exception as e:
        logger.error(f"Failed to get PayPal access token: {e}")
        return None

def create_paypal_order(client, plan, lang, direction, amount):
    """
    Create an Order in PayPal
    """
    access_token = get_paypal_access_token()
    if not access_token:
        raise Exception("Could not retrieve PayPal access token.")

    # Construct Return URLs
    # Assuming config PROTOCOL, FRONTEND_DOMAIN, FRONTEND_PORT exist
    protocol = config("PROTOCOL", default="http")
    domain = config("FRONTEND_DOMAIN", default="localhost")
    port = config("FRONTEND_PORT", default="3000")
    
    # Logic to build base URL matching the existing service.py logic
    if config("DEBUG"):
        base_url = f"{protocol}://{client.schema_name}.{domain}:{port}/{lang}"
    else:
        base_url = f"{protocol}://{client.schema_name}.{domain}/{lang}"

    # Verify logic for return URL parameters
    return_url = f"{base_url}/payment/processing?client_id={client.uuid}&plan_id={plan.id}&direction={direction}"
    cancel_url = f"{base_url}/payment/processing?status=cancelled&client_id={client.uuid}&plan_id={plan.id}&direction={direction}"

    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": str(client.uuid),
                "description": f"Subscription for {client.name} ({plan.name} - {direction})",
                "amount": {
                    "currency_code": "USD",
                    "value": str(amount)
                }
            }
        ],
        "application_context": {
            "brand_name": "Solo Vizion",
            "landing_page": "LOGIN",
            "user_action": "PAY_NOW",
            "return_url": return_url,
            "cancel_url": cancel_url
        }
    }

    response = requests.post(
        f"{get_base_url()}/v2/checkout/orders",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        },
        json=payload
    )

    if response.status_code in (200, 201):
        data = response.json()
        approval_url = None
        for link in data.get("links", []):
            if link.get("rel") == "approve":
                approval_url = link["href"]
                break
        
        if approval_url:
            return approval_url, data["id"]
        else:
            raise Exception("Approval URL not found in PayPal response.") 
    else:
        logger.error(f"PayPal Order Creation Failed: {response.text}")
        raise Exception(f"PayPal Error: {response.text}")

def capture_paypal_order(order_id):
    """
    Capture a PayPal Order
    """
    access_token = get_paypal_access_token()
    if not access_token:
        raise Exception("Could not retrieve PayPal access token.")

    response = requests.post(
        f"{get_base_url()}/v2/checkout/orders/{order_id}/capture",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
    )
    
    return response.json()
