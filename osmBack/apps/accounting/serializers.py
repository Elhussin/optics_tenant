from rest_framework import serializers
from apps.accounting.models import  (FinancialPeriod,
 Account,Transaction,JournalEntry,
Tax,AccountingCategory,RecurringTransaction)

class FinancialPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialPeriod
        fields = '__all__'

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'
        read_only_fields = ['balance', 'created_at', 'updated_at', 'user']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = '__all__'

class TaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tax
        fields = '__all__'

class AccountingCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountingCategory
        fields = '__all__'

class RecurringTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringTransaction
        # Changed fields due to rename in models logic
        fields = '__all__'
