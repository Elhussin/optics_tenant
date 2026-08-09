from core.tasks import async_send_email
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from optics_tenant.config_loader import config

FRONTEND_DOMAIN = config("FRONTEND_DOMAIN")
FRONTEND_PORT = config("FRONTEND_PORT")
PROTOCOL = config("PROTOCOL")
LOCALE = config("LOCALE")


def send_activation_email(email, token):
    if FRONTEND_PORT:
        activation_link = f"{PROTOCOL}://{FRONTEND_DOMAIN}:{FRONTEND_PORT}/{LOCALE}/auth/activate/?token={token}"
    else:
        activation_link = f"{PROTOCOL}://{FRONTEND_DOMAIN}/{LOCALE}/auth/activate/?token={token}"

    message_template = _(
        "Hi 👋,\n"
        "Please activate your account by clicking the link below:\n"
        "{link}\n\n"
        "Note: This link will expire in 24 hours.\n\n"
        "Thanks,\n"
        "Solo Vizion Team"
    )
    message = str(message_template).format(link=activation_link)

    async_send_email.delay(str(_("Activate your account")), message, [email])


def send_message_acount_activated(email, schema_name, name):
    if FRONTEND_PORT:
        domain = f"{slugify(schema_name)}.{FRONTEND_DOMAIN}:{FRONTEND_PORT}/{LOCALE}"
    else:
        domain = f"{slugify(schema_name)}.{FRONTEND_DOMAIN}/{LOCALE}"

    message_template = _(
        "Hi 👋,\n"
        "Your account has been activated successfully.\n\n"
        "Your store name: {schema_name}\n"
        "Your domain: {domain}\n"
        "Your login link: {protocol}://{domain}/auth/login\n"
        "Your username: {email}\n"
        "Your password: ***Enter at Registration\n\n"
        "Thanks,\n"
        "Solo Vizion Team"
    )
    message = str(message_template).format(
        schema_name=schema_name,
        domain=domain,
        protocol=PROTOCOL,
        email=email
    )

    async_send_email.delay(str(_("Account Activated")), message, [email])


def send_password_reset_email(email, url):
    message_template = _(
        "Hi 👋,\n\n"
        "Please reset your password by clicking the link below:\n\n"
        "{url}\n\n"
        "Note: This link will expire in 24 hours.\n\n"
        "Thanks,\n"
        "Solo Vizion Team"
    )
    message = str(message_template).format(url=url)

    async_send_email.delay(str(_("Reset your password")), message, [email])


def send_password_change_email(email):
    message = _(
        "Hi 👋,\n"
        "Your password has been changed successfully.\n\n"
        "Thanks,\n"
        "Solo Vizion Team"
    )
    async_send_email.delay(str(_("Password Changed")), str(message), [email])


def send_failed_activation_email(email):
    message = _(
        "Hi 👋,\n"
        "Your account activation failed.\n"
        "Please try again by clicking previous activation link.\n"
    )
    async_send_email.delay(str(_("Account Activation Failed")), str(message), [email])
