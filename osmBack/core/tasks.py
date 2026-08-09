import logging
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger('tenant')

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def async_send_email(self, subject, message, recipient_list):
    """
    Generic task to send an email asynchronously.
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        logger.info(f"Successfully sent email to {recipient_list}")
    except Exception as exc:
        logger.error(f"Error sending email to {recipient_list}: {str(exc)}")
        raise self.retry(exc=exc)
