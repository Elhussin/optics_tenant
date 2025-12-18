from django.db import models
from django.contrib.auth import get_user_model
from djmoney.models.fields import MoneyField
from djmoney.money import Money
from django.utils import timezone
from dateutil.relativedelta import relativedelta

User = get_user_model()

class FinancialPeriod(models.Model):
    """ Represents a financial period (e.g., fiscal year). """
    name = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    is_closed = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    

class Account(models.Model):
    """ Represents a user's financial account with a specific currency. """
    CURRENCIES = ['USD', 'EUR', 'SAR']

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="accounts")
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    currency = models.CharField(
        max_length=3,
        choices=[(c, c) for c in CURRENCIES],  # Store currency as a 3-letter code
        default='USD'
    )
    
    # CHANGED: Added real DB field for balance for performance and persistence
    balance = MoneyField(max_digits=19, decimal_places=2, default_currency='USD', default=0)

    def update_balance(self):
        """ Recalculates the balance from transactions and saves it to the DB. """
        # Filter for transactions related to this account
        income = self.transactions.filter(transaction_type='income').aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        expense = self.transactions.filter(transaction_type='expense').aggregate(
            total=models.Sum('amount')
        )['total'] or 0

        # Create Money objects to ensure currency safety
        # income and expense from aggregate might be Decimal, need to wrap in Money if not MoneyField aggregate behavior
        # However, djmoney aggregate returns Money instance usually if field is MoneyField. 
        # But to be safe vs None:
        
        if not isinstance(income, Money):
            income = Money(income, self.currency)
        if not isinstance(expense, Money):
            expense = Money(expense, self.currency)

        self.balance = income - expense
        self.save(update_fields=['balance'])
        return self.balance

    def perform_destroy(self, instance):
        # Logic for destruction if needed
        pass

    def __str__(self):
        return f"{self.name} ({self.currency})"
    

class Tax(models.Model):
    """ Represents a tax rate applicable to transactions. """
    name = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=5, decimal_places=2)  # e.g., 5.00%
    effective_date = models.DateField()
    is_active = models.BooleanField(default=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.rate}%)"


class AccountingCategory(models.Model):
    """ Represents a transaction category (income or expense). """
    TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    name = models.CharField(max_length=100, unique=True)
    category_type = models.CharField(max_length=7, choices=TYPE_CHOICES)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name


class Transaction(models.Model):
    """ Represents a financial transaction within an account. """
    
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    period = models.ForeignKey(FinancialPeriod, on_delete=models.PROTECT)
    date = models.DateField()
    amount = MoneyField(max_digits=10, decimal_places=2, default_currency='USD', currency_field_name='amount_currency')
    transaction_type = models.CharField(max_length=7, choices=[ ('income', 'Income'),('expense', 'Expense'),])
    category = models.ForeignKey("AccountingCategory", on_delete=models.SET_NULL, null=True, blank=True)
    tax_rate = models.ForeignKey(Tax, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """ Ensures the transaction uses the correct currency and updates account balance. """
        if not self.amount_currency:
            self.amount_currency = self.account.currency  # Use account's currency

        super().save(*args, **kwargs)

        # Update account balance 
        self.account.update_balance()

    def delete(self, *args, **kwargs):
        account = self.account
        super().delete(*args, **kwargs)
        account.update_balance()

    def __str__(self):
        return f"{self.date} - {self.amount}"


class JournalEntry(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name="journal_entries")
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    debit = MoneyField(max_digits=10, decimal_places=2, default_currency='USD')
    credit = MoneyField(max_digits=10, decimal_places=2, default_currency='USD')


class RecurringTransaction(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    amount = MoneyField(max_digits=10, decimal_places=2, default_currency='USD')
    # CHANGED: Fixed plural name to match Transaction model for consistency if intended, 
    # but kept singular 'transaction_type' to match logic usually. 
    # Actually, model had 'transaction_types' but Transaction has 'transaction_type'. 
    # I will rename field to 'transaction_type' to match Transaction model.
    transaction_type = models.CharField(max_length=7, choices=[ ('income', 'Income'),('expense', 'Expense'),])
    interval = models.CharField(max_length=10, choices=[('monthly', 'Monthly'), ('yearly', 'Yearly')])
    next_execution = models.DateField()

    def calculate_next_date(self):
        if self.interval == 'monthly':
            return self.next_execution + relativedelta(months=1)
        elif self.interval == 'yearly':
            return self.next_execution + relativedelta(years=1)
        return self.next_execution

    def process(self):
        if self.next_execution <= timezone.now().date():
            # Get or create open period context if needed, but for now just basic creation
            # Note: Creating transaction requires a 'period'. We need a way to resolve current period.
            # Warning: This might fail if no open period exists.
            current_period = FinancialPeriod.objects.filter(
                start_date__lte=timezone.now().date(), 
                end_date__gte=timezone.now().date(),
                is_closed=False
            ).first()
            
            if not current_period:
                # Fallback or error logging needed in real app
                return

            Transaction.objects.create(
                account=self.account,
                amount=self.amount,
                transaction_type=self.transaction_type, # Fixed field name
                date=timezone.now().date(),
                period=current_period
            )
            self.next_execution = self.calculate_next_date()
            self.save()
