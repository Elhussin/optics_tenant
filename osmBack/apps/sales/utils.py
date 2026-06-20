import string
from django.utils import timezone
from django.db import connection, transaction, ProgrammingError

def generate_serial_number(model, prefix, field_name='number', with_date=True):
    today_str = timezone.now().strftime('%Y%m%d') if with_date else ''
    serial_prefix = f"{prefix}-{today_str}" if with_date else prefix

    # Create a safe sequence name. e.g. "seq_sales_order_ord_20260426"
    # PostgreSQL sequence names max length is 63 chars.
    table_name = model._meta.db_table[:30]
    seq_prefix = prefix.lower()[:10]
    seq_name = f"seq_{table_name}_{seq_prefix}_{today_str}" if with_date else f"seq_{table_name}_{seq_prefix}"
    
    with connection.cursor() as cursor:
        try:
            # Use atomic so the ProgrammingError doesn't break the outer transaction
            with transaction.atomic():
                cursor.execute(f"SELECT nextval('{seq_name}');")
                last_serial = cursor.fetchone()[0]
        except ProgrammingError:
            # The sequence doesn't exist yet
            with transaction.atomic():
                cursor.execute(f"CREATE SEQUENCE IF NOT EXISTS {seq_name} START 1;")
                cursor.execute(f"SELECT nextval('{seq_name}');")
                last_serial = cursor.fetchone()[0]

    new_serial = f"{serial_prefix}-{last_serial:04d}"
    return new_serial

from decimal import Decimal, ROUND_HALF_UP

class MoneyHelper:
    """
    Unified helper for financial calculations to prevent floating point and rounding issues.
    Defaults to 2 decimal places with ROUND_HALF_UP policy.
    """
    PLACES = Decimal('0.01')
    
    @classmethod
    def quantize(cls, amount: Decimal) -> Decimal:
        if amount is None:
            return Decimal('0.00')
        if not isinstance(amount, Decimal):
            amount = Decimal(str(amount))
        return amount.quantize(cls.PLACES, rounding=ROUND_HALF_UP)
