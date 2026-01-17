from django.apps import AppConfig


class AccountingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounting'
    verbose_name = 'المحاسبة'

    def ready(self):
        """
        ربط الـ signals عند تشغيل التطبيق
        """
        try:
            from apps.accounting.signals import connect_accounting_signals
            connect_accounting_signals()
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"تخطي ربط إشارات المحاسبة: {e}")
