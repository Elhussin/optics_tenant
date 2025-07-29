# tenants/paypal_service.py
import paypalrestsdk
from django.conf import settings
from optics_tenant.config_loader import config
paypalrestsdk.configure({
    "mode": config("PAYPAL_MODE"),
    "client_id": config("PAYPAL_CLIENT_ID"),
    "client_secret": config("PAYPAL_CLIENT_SECRET")
})


def create_paypal_order(client, plan, period):
    from tenants.models import PLAN_LIMITS

    price = PLAN_LIMITS[plan]['price_month'] if period == "month" else PLAN_LIMITS[plan]['price_year']

    payment = paypalrestsdk.Payment({
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": config("PAYPAL_RETURN_URL"),
            "cancel_url": config("PAYPAL_CANCEL_URL")
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": f"{plan} plan ({period})",
                    "sku": plan,
                    "price": str(price),
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "total": str(price),
                "currency": "USD"
            },
            "description": f"Subscription for {client.name} ({plan} - {period})"
        }]
    })

    if payment.create():
        for link in payment.links:
            if link.rel == "approval_url":
                return str(link.href)
    else:
        raise Exception(payment.error)
