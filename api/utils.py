# api/utils.py
from django.core.mail import send_mail
from django.conf import settings

def send_activation_email(email, token):
    activation_link = f"http://{settings.TENANT_BASE_DOMAIN}/api/activate/?token={token}"
    subject = "Activate your account"
    message = f"Click the link to activate your account:\n{activation_link}"
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
