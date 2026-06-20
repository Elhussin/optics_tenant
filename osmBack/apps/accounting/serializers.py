# apps/accounting/serializers.py
"""
Accounting Serializers
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.accounting.models import (
    ChartOfAccounts, GeneralJournal, JournalLine
)


class ChartOfAccountsSerializer(serializers.ModelSerializer):
    """Serializer لدليل الحسابات"""
    account_type_display = serializers.CharField(
        source='get_account_type_display', read_only=True
    )
    normal_balance_display = serializers.CharField(
        source='get_normal_balance_display', read_only=True
    )
    parent_name = serializers.CharField(
        source='parent.name', read_only=True
    )
    full_path = serializers.SerializerMethodField()

    class Meta:
        model = ChartOfAccounts
        fields = [
            'id', 'code', 'name', 'name_en',
            'account_type', 'account_type_display',
            'account_subtype', 'parent', 'parent_name',
            'description', 'opening_balance', 'current_balance',
            'is_header', 'normal_balance', 'normal_balance_display',
            'full_path', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'current_balance', 'created_at']
        extra_kwargs = {
            'code': {
                'error_messages': {
                    'required': str(_('Account code is required')),
                    'blank': str(_('Account code cannot be blank')),
                }
            },
            'name': {
                'error_messages': {
                    'required': str(_('Account name is required')),
                    'blank': str(_('Account name cannot be blank')),
                }
            },
            'account_type': {
                'error_messages': {
                    'required': str(_('Account type is required')),
                }
            },
        }

    def get_full_path(self, obj):
        return obj.get_full_path()

    def validate_code(self, value):
        """التحقق من عدم تكرار رمز الحساب"""
        queryset = ChartOfAccounts.objects.filter(code=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError(
                _('Account with this code already exists')
            )
        return value

    def validate(self, data):
        """التحقق من صحة البيانات"""
        parent = data.get('parent')
        is_header = data.get('is_header', False)

        # الحسابات الرئيسية لا يمكن أن تكون أبناء لحسابات غير رئيسية
        if parent and not parent.is_header:
            raise serializers.ValidationError({
                'parent': _('Parent account must be a header account')
            })

        return data


class ChartOfAccountsTreeSerializer(serializers.ModelSerializer):
    """Serializer هرمي لدليل الحسابات"""
    children = serializers.SerializerMethodField()

    class Meta:
        model = ChartOfAccounts
        fields = [
            'id', 'code', 'name', 'account_type',
            'current_balance', 'is_header', 'children',
        ]

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return ChartOfAccountsTreeSerializer(children, many=True).data


class JournalLineSerializer(serializers.ModelSerializer):
    """Serializer لسطر القيد"""
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = JournalLine
        fields = [
            'id', 'account', 'account_code', 'account_name',
            'debit', 'credit', 'description', 'cost_center',
        ]
        extra_kwargs = {
            'account': {
                'error_messages': {
                    'required': _('Account is required'),
                    'does_not_exist': _('The specified account does not exist'),
                }
            },
        }

    def validate(self, data):
        """التحقق من صحة المبالغ"""
        debit = data.get('debit', 0) or 0
        credit = data.get('credit', 0) or 0

        # يجب تحديد إما مدين أو دائن
        if debit == 0 and credit == 0:
            raise serializers.ValidationError(
                _('Either debit or credit amount must be specified')
            )

        # لا يمكن تحديد كلاهما في نفس السطر
        if debit > 0 and credit > 0:
            raise serializers.ValidationError(
                _('Cannot have both debit and credit in the same line')
            )

        # المبالغ يجب أن تكون موجبة
        if debit < 0 or credit < 0:
            raise serializers.ValidationError(
                _('Debit and credit amounts must be positive')
            )

        return data


class GeneralJournalSerializer(serializers.ModelSerializer):
    """Serializer لقيد اليومية"""
    lines = JournalLineSerializer(many=True, read_only=True)
    entry_type_display = serializers.CharField(
        source='get_entry_type_display', read_only=True
    )
    source_type_display = serializers.CharField(
        source='get_source_type_display', read_only=True
    )
    posted_by_name = serializers.CharField(
        source='posted_by.get_full_name', read_only=True
    )

    class Meta:
        model = GeneralJournal
        fields = [
            'id', 'entry_number', 'entry_date',
            'entry_type', 'entry_type_display',
            'source_type', 'source_type_display',
            'source_document', 'source_id',
            'description', 'total_debit', 'total_credit',
            'is_posted', 'posted_at', 'posted_by', 'posted_by_name',
            'notes', 'lines', 'created_at',
        ]
        read_only_fields = [
            'id', 'entry_number', 'total_debit', 'total_credit',
            'is_posted', 'posted_at', 'created_at',
        ]


class GeneralJournalCreateSerializer(serializers.ModelSerializer):
    """Serializer لإنشاء قيد يومية"""
    lines = JournalLineSerializer(many=True)

    class Meta:
        model = GeneralJournal
        fields = [
            'entry_date', 'entry_type', 'source_type',
            'source_document', 'description', 'notes', 'lines',
        ]

    def validate_lines(self, lines):
        """التحقق من صحة سطور القيد"""
        if len(lines) < 2:
            raise serializers.ValidationError(
                _("Journal entry must contain at least two lines")
            )

        total_debit = sum(line.get('debit', 0) for line in lines)
        total_credit = sum(line.get('credit', 0) for line in lines)

        if total_debit != total_credit:
            raise serializers.ValidationError(
                _("Journal entry is not balanced: Debit={debit}, Credit={credit}").format(
                    debit=total_debit,
                    credit=total_credit
                )
            )

        return lines

    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        journal = GeneralJournal.objects.create(**validated_data)

        for line_data in lines_data:
            JournalLine.objects.create(journal=journal, **line_data)

        journal.validate_balance()
        journal.save()

        return journal


class GeneralJournalListSerializer(serializers.ModelSerializer):
    """Serializer مختصر للقوائم"""

    class Meta:
        model = GeneralJournal
        fields = [
            'id', 'entry_number', 'entry_date',
            'source_type', 'description',
            'total_debit', 'is_posted', 'created_at',
        ]





# ═══════════════════════════════════════════════════════════════════════════════
# Financial Reports Serializers
# ═══════════════════════════════════════════════════════════════════════════════

class TrialBalanceItemSerializer(serializers.Serializer):
    """عنصر في ميزان المراجعة"""
    account_code = serializers.CharField()
    account_name = serializers.CharField()
    account_type = serializers.CharField()
    debit = serializers.DecimalField(max_digits=14, decimal_places=2)
    credit = serializers.DecimalField(max_digits=14, decimal_places=2)


class IncomeStatementItemSerializer(serializers.Serializer):
    """عنصر في قائمة الدخل"""
    category = serializers.CharField()
    amount = serializers.DecimalField(max_digits=14, decimal_places=2)
    accounts = serializers.ListField(child=serializers.DictField())


class BalanceSheetItemSerializer(serializers.Serializer):
    """عنصر في الميزانية العمومية"""
    category = serializers.CharField()
    total = serializers.DecimalField(max_digits=14, decimal_places=2)
    items = serializers.ListField(child=serializers.DictField())

from apps.accounting.models.tax import TaxRate

class TaxRateSerializer(serializers.ModelSerializer):
    """Serializer New TaxRate Model"""
    gl_account_name = serializers.CharField(source='gl_account.name', read_only=True)

    class Meta:
        model = TaxRate
        fields = ['id', 'name', 'rate', 'country', 'gl_account', 'gl_account_name', 'is_active']
