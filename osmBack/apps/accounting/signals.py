# apps/accounting/signals.py
"""
Django Signals for automatic linking between Sales and Accounting
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def create_invoice_journal(sender, instance, created, **kwargs):
    """
    Create accounting journal when sales/return invoice is confirmed
    """
    from apps.accounting.services import AutoJournalService
    from apps.accounting.models import GeneralJournal

    # Only when status changes to confirmed or paid
    if instance.status in ['confirmed', 'paid']:
        try:
            # 1. Sales Invoice Logic
            if instance.invoice_type == 'sale':
                # Check for existing sales journal
                existing = GeneralJournal.objects.filter(
                    source_type='sales_invoice',
                    source_id=instance.id
                ).exists()

                if not existing:
                    # Create Sales Journal
                    AutoJournalService.create_sales_invoice_journal(instance)
                    # Create COGS Journal
                    AutoJournalService.create_cogs_journal(instance)
                    logger.info(
                        f"Created accounting sales entries for invoice {instance.invoice_number}")

            # 2. Return Invoice Logic
            elif instance.invoice_type in ['return_sale', 'return_purchase']:
                # Check for existing return journal
                existing = GeneralJournal.objects.filter(
                    source_type='return',
                    source_id=instance.id
                ).exists()

                if not existing:
                    AutoJournalService.create_return_journal(instance)
                    logger.info(
                        f"Created accounting return entry for invoice {instance.invoice_number}")

        except Exception as e:
            logger.error(
                f"Failed to create accounting entry for invoice {instance.invoice_number}: {e}",
                exc_info=True
            )


def create_payment_journal(sender, instance, created, **kwargs):
    """
    Create accounting journal when payment is completed
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
    Connect signals - called from apps.py
    """
    try:
        from apps.sales.models import Invoice, Payment

        # Connect Invoice Signal (Sales & Returns)
        post_save.connect(
            create_invoice_journal,
            sender=Invoice,
            dispatch_uid='invoice_accounting_signal'
        )

        # Connect Payment Signal
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
    Disconnect signals
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
