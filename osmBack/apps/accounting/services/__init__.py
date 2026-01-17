# apps/accounting/services/__init__.py
"""
Accounting Services Package
"""

from apps.accounting.services.auto_journal import AutoJournalService

__all__ = [
    'AutoJournalService',
]
