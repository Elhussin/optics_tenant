from rest_framework import serializers
from apps.accounting.models import (FinancialPeriod,
                                    Account, Transaction, JournalEntry,
                                    Tax, AccountingCategory, RecurringTransaction)


class FinancialPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialPeriod
        exclude = []  # No IsDeleted in this model based on viewing models.py
        read_only_fields = ['is_closed']

    def validate(self, data):
        if data.get('start_date') and data.get('end_date') and data['start_date'] > data['end_date']:
            raise serializers.ValidationError(
                "End date must be after start date.")
        return data


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        # Account model does not seem to inherit from BaseModel in the viewed file (lines 21), just models.Model
        # But if it did, we should exclude is_deleted. Checked: it is plain models.Model.
        fields = '__all__'
        read_only_fields = ['balance', 'created_at', 'updated_at', 'user']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'amount_currency']

    def validate(self, data):
        # Ensure Period covers the transaction date
        period = data.get('period')
        date = data.get('date')
        if period and date:
            if not (period.start_date <= date <= period.end_date):
                raise serializers.ValidationError(
                    {"date": "Transaction date must be within the selected financial period."})
            if period.is_closed:
                raise serializers.ValidationError(
                    {"period": "Cannot record transactions in a closed period."})
        return data


class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = '__all__'
        # Journal Entries are usually auto-generated or strictly controlled.


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
        fields = '__all__'
        # Should likely be calculated, not set manually initially? Or allow manual start.
        read_only_fields = ['next_execution']
