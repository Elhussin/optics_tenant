# core.utils.update_client_plan
# from tenants.models import Payment
from core.utils.expiration_date import expiration_date
# from tenants.models import Client

def update_client_plan(payment):
    """Update client plan limits if payment is success"""
    if payment.status != "success" or not payment.plan:
        return
    client = payment.client
    client.plan = payment.plan
    client.paid_until = expiration_date(payment.plan.duration_days)
    client.on_trial = False
    client.is_active = True
    client.apply_plan_limits()
    client.save()
