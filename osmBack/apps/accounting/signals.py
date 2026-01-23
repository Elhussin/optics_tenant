# apps/accounting/signals.py
"""
Django Signals للربط التلقائي بين المبيعات والمحاسبة
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def create_invoice_journal(sender, instance, created, **kwargs):
    """
    إنشاء قيد محاسبي عند تأكيد فاتورة المبيعات
    """
    from apps.accounting.services import AutoJournalService

    # فقط عند تغير الحالة إلى confirmed أو paid
    if instance.status in ['confirmed', 'paid']:
        # تحقق من عدم وجود قيد مسبق
        from apps.accounting.models import GeneralJournal
        existing = GeneralJournal.objects.filter(
            source_type='sales_invoice',
            source_id=instance.id
        ).exists()

        if not existing:
            try:
                # قيد المبيعات
                AutoJournalService.create_sales_invoice_journal(instance)

                # قيد تكلفة البضاعة (إذا كانت فاتورة بيع وليس مرتجع)
                if instance.invoice_type == 'sale':
                    AutoJournalService.create_cogs_journal(instance)

                logger.info(
                    f"Created accounting entries for invoice {instance.invoice_number}")
            except Exception as e:
                logger.error(
                    f"Failed to create accounting entry for invoice {instance.invoice_number}: {e}",
                    exc_info=True
                )


def create_return_journal(sender, instance, created, **kwargs):
    """
    إنشاء قيد محاسبي عند تأكيد فاتورة مرتجع
    """
    from apps.accounting.services import AutoJournalService
    from apps.accounting.models import GeneralJournal

    if instance.invoice_type in ['return_sale', 'return_purchase'] and instance.status == 'confirmed':
        existing = GeneralJournal.objects.filter(
            source_type='return',
            source_id=instance.id
        ).exists()
        if not existing:
            try:
                AutoJournalService.create_return_journal(instance)
                logger.info(
                    f"Created return journal entry for invoice {instance.invoice_number}")
            except Exception as e:
                logger.error(
                    f"Failed to create return journal entry for invoice {instance.invoice_number}: {e}",
                    exc_info=True
                )


def create_payment_journal(sender, instance, created, **kwargs):
    """
    إنشاء قيد محاسبي عند اكتمال دفعة
    """
    from apps.accounting.services import AutoJournalService
    from apps.accounting.models import GeneralJournal

    if instance.status == 'completed':
        existing = GeneralJournal.objects.filter(
            source_type='receipt',
            source_id=instance.id
        ).exists()
        if not existing:
            try:
                AutoJournalService.create_payment_journal(instance)
                logger.info(
                    f"Created payment receipt journal entry for payment {instance.id}")
            except Exception as e:
                logger.error(
                    f"Failed to create payment receipt journal entry for payment {instance.id}: {e}",
                    exc_info=True
                )


def connect_accounting_signals():
    """
    ربط الـ signals - يُستدعى من apps.py
    """
    try:
        from apps.sales.models import Invoice, Payment

        # ربط إشارة الفاتورة
        post_save.connect(
            create_invoice_journal,
            sender=Invoice,
            dispatch_uid='invoice_accounting_signal'
        )

        # ربط إشارة الدفعة
        post_save.connect(
            create_payment_journal,
            sender=Payment,
            dispatch_uid='payment_accounting_signal'
        )

        logger.info("Accounting signals connected successfully")
    except Exception as e:
        logger.error(
            f"Failed to connect accounting signals: {e}", exc_info=True)


def disconnect_accounting_signals():
    """
    فصل الـ signals
    """
    try:
        from apps.sales.models import Invoice, Payment

        post_save.disconnect(
            create_invoice_journal,
            sender=Invoice,
            dispatch_uid='invoice_accounting_signal'
        )

        post_save.disconnect(
            create_payment_journal,
            sender=Payment,
            dispatch_uid='payment_accounting_signal'
        )

        logger.info("Accounting signals disconnected successfully")
    except Exception as e:
        logger.error(
            f"Failed to disconnect accounting signals: {e}", exc_info=True)
