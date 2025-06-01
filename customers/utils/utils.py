# utils/utils.py
from django.core.mail import send_mail
from django.conf import settings
from django.utils.text import slugify

# def send_activation_email(email, token):
#     activation_link = f"http://{settings.TENANT_BASE_DOMAIN}/api/activate/?token={token}"
#     subject = "Activate your account"
#     message = f"Click the link to activate your account:\n{activation_link}"
#     send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])

def send_activation_email(email, token):
    activation_link = f"http://{settings.TENANT_BASE_DOMAIN}:{settings.PORT}/api/activate/?token={token}"
    message = f"""
        Hi 👋,
        Please activate your account by clicking the link below:
        {activation_link}

        Note: This link will expire in 24 hours.

        Thanks,
        Solo Vizion Team
        """
    send_mail("Activate your account", message, settings.DEFAULT_FROM_EMAIL, [email])


def send_password_reset_email(email, token):
    reset_link = f"http://{settings.TENANT_BASE_DOMAIN}/api/reset-password/?token={token}"
    message = f"""
        Hi 👋,
        Please reset your password by clicking the link below:
        {reset_link}

        Note: This link will expire in 24 hours.

        Thanks,
        Solo Vizion Team
        """
    send_mail("Reset your password", message, settings.DEFAULT_FROM_EMAIL, [email])


def send_password_change_email(email):
    message = """
    Hi 👋,
    Your password has been changed successfully.

    Thanks,
    Solo Vizion Team
    """
    send_mail("Password Changed", message, settings.DEFAULT_FROM_EMAIL, [email])

def send_message_acount_activated(email,schema_name,name):
    domain = f"{slugify(schema_name)}.{settings.TENANT_BASE_DOMAIN}"
    message = f"""
    Hi 👋,
    Your account has been activated successfully.
    
    Your store name: {schema_name}
    Your domain: {domain}
    Your login link: http://{domain}/login
    Your superuser email: {email}
    Your superuser username: {schema_name}
    Your superuser password: ***Enter at Registration
    
    Thanks,
    Solo Vizion Team
    """
    send_mail("Account Activated", message, settings.DEFAULT_FROM_EMAIL, [email])