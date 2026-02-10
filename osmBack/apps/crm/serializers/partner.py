# apps/crm/serializers/partner.py
"""
Serializers للشركاء والتأمين
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.crm.models import (
    Partner, PartnerBranch,
    CustomerPartnerLink, InsuranceClaim, ClaimItem, ClaimDocument, PartnerSettlement
)


class PartnerSerializer(serializers.ModelSerializer):
    """Serializer للشريك"""
    partner_type_display = serializers.CharField(
        source='get_partner_type_display', read_only=True
    )
    is_contract_active = serializers.BooleanField(read_only=True)
    available_credit = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = Partner
        fields = [
            'id', 'name', 'name_en', 'partner_type', 'partner_type_display',
            'code', 'logo', 'contact_person', 'phone', 'email', 'website', 'address',
            'contract_number', 'contract_start', 'contract_end',
            'payment_terms', 'default_discount',
            'credit_limit', 'current_balance', 'available_credit',
            'patient_share_percentage', 'tax_number', 'notes',
            'is_active', 'is_contract_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']
        extra_kwargs = {
            'name': {
                'error_messages': {
                    'required': str(_('Partner name is required')),
                    'blank': str(_('Partner name cannot be blank')),
                }
            },
            'partner_type': {
                'error_messages': {
                    'required': str(_('Partner type is required')),
                    'invalid_choice': str(_('Invalid partner type')),
                }
            },
        }

    def validate(self, data):
        """التحقق من البيانات"""
        contract_start = data.get('contract_start') or (
            self.instance.contract_start if self.instance else None)
        contract_end = data.get('contract_end') or (
            self.instance.contract_end if self.instance else None)

        # التحقق من تواريخ العقد
        if contract_start and contract_end and contract_end <= contract_start:
            raise serializers.ValidationError(
                _('Contract end date must be after start date')
            )

        # التحقق من حد الائتمان
        credit_limit = data.get('credit_limit')
        if credit_limit is not None and credit_limit < 0:
            raise serializers.ValidationError({
                'credit_limit': _('Credit limit cannot be negative')
            })

        return data


class PartnerListSerializer(serializers.ModelSerializer):
    """Serializer مختصر للقوائم"""
    partner_type_display = serializers.CharField(
        source='get_partner_type_display', read_only=True
    )

    class Meta:
        model = Partner
        fields = [
            'id', 'name', 'partner_type', 'partner_type_display',
            'code', 'is_active', 'default_discount', 'current_balance',
        ]


class PartnerBranchSerializer(serializers.ModelSerializer):
    """Serializer لربط الشريك بالفرع"""
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)

    class Meta:
        model = PartnerBranch
        fields = [
            'id', 'partner', 'partner_name', 'branch', 'branch_name',
            'special_discount', 'is_active',
        ]


class CustomerPartnerLinkSerializer(serializers.ModelSerializer):
    """Serializer لربط العميل بالشريك"""
    customer_name = serializers.CharField(
        source='customer.full_name', read_only=True)
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    partner_type = serializers.CharField(
        source='partner.partner_type', read_only=True)
    is_coverage_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = CustomerPartnerLink
        fields = [
            'id', 'customer', 'customer_name', 'partner', 'partner_name', 'partner_type',
            'membership_number', 'policy_number',
            'coverage_start', 'coverage_end',
            'annual_limit', 'remaining_limit',
            'patient_share_percentage', 'max_patient_share', 'insurance_class',
            'is_active', 'is_coverage_active', 'notes',
        ]

    def validate(self, data):
        """التحقق من البيانات"""
        coverage_start = data.get('coverage_start') or (
            self.instance.coverage_start if self.instance else None)
        coverage_end = data.get('coverage_end') or (
            self.instance.coverage_end if self.instance else None)

        # التحقق من تواريخ التغطية
        if coverage_start and coverage_end and coverage_end <= coverage_start:
            raise serializers.ValidationError(
                _('Coverage end date must be after start date')
            )

        # التحقق من الحد السنوي
        annual_limit = data.get('annual_limit')
        if annual_limit is not None and annual_limit < 0:
            raise serializers.ValidationError({
                'annual_limit': _('Annual limit cannot be negative')
            })

        return data


# ═══════════════════════════════════════════════════════════════════════════════
# Insurance Claims Serializers
# ═══════════════════════════════════════════════════════════════════════════════

class ClaimItemSerializer(serializers.ModelSerializer):
    """Serializer لعنصر المطالبة"""

    class Meta:
        model = ClaimItem
        fields = [
            'id', 'claim', 'order_item', 'description',
            'quantity', 'unit_price', 'total_price',
            'claim_amount', 'approved_amount', 'insurance_code',
        ]
        read_only_fields = ['id', 'total_price']


class ClaimDocumentSerializer(serializers.ModelSerializer):
    """Serializer لمستند المطالبة"""
    document_type_display = serializers.CharField(
        source='get_document_type_display', read_only=True
    )

    class Meta:
        model = ClaimDocument
        fields = [
            'id', 'claim', 'document_type', 'document_type_display',
            'title', 'file', 'notes', 'created_at',
        ]


class InsuranceClaimSerializer(serializers.ModelSerializer):
    """Serializer للمطالبة"""
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    customer_name = serializers.CharField(
        source='order.customer.full_name', read_only=True)
    order_number = serializers.CharField(
        source='order.order_number', read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True)
    items = ClaimItemSerializer(many=True, read_only=True)
    attached_documents = ClaimDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = InsuranceClaim
        fields = [
            'id', 'claim_number', 'external_claim_number',
            'order', 'order_number', 'partner', 'partner_name',
            'customer_partner_link', 'customer_name',
            'claim_date', 'submission_date', 'response_date', 'payment_date',
            'total_amount', 'claim_amount', 'approved_amount', 'paid_amount', 'patient_share',
            'status', 'status_display',
            'rejection_reason', 'partial_reason', 'notes', 'internal_notes',
            'items', 'attached_documents',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'claim_number', 'claim_date',
            'approved_amount', 'paid_amount',
            'submission_date', 'response_date', 'payment_date',
        ]


class InsuranceClaimCreateSerializer(serializers.ModelSerializer):
    """Serializer لإنشاء مطالبة"""

    class Meta:
        model = InsuranceClaim
        fields = [
            'order', 'partner', 'customer_partner_link',
            'total_amount', 'notes',
        ]

    def validate_total_amount(self, value):
        """التحقق من المبلغ"""
        if value <= 0:
            raise serializers.ValidationError(
                _('Total amount must be greater than zero')
            )
        return value

    def validate(self, data):
        """التحقق من البيانات"""
        customer_partner_link = data.get('customer_partner_link')

        # التحقق من أن customer_partner_link نشط
        if customer_partner_link and not customer_partner_link.is_active:
            raise serializers.ValidationError({
                'customer_partner_link': _('Customer partner link is not active')
            })

        # التحقق من أن التغطية نشطة
        if customer_partner_link and not customer_partner_link.is_coverage_active:
            raise serializers.ValidationError({
                'customer_partner_link': _('Coverage period has expired')
            })

        return data

    def create(self, validated_data):
        claim = InsuranceClaim(**validated_data)
        claim.calculate_amounts()
        claim.save()
        return claim


class InsuranceClaimListSerializer(serializers.ModelSerializer):
    """Serializer مختصر للقوائم"""
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    order_number = serializers.CharField(
        source='order.order_number', read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True)

    class Meta:
        model = InsuranceClaim
        fields = [
            'id', 'claim_number', 'order_number', 'partner_name',
            'claim_date', 'total_amount', 'claim_amount', 'approved_amount',
            'status', 'status_display',
        ]


class PartnerSettlementSerializer(serializers.ModelSerializer):
    """Serializer للتسوية المالية"""
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True)

    class Meta:
        model = PartnerSettlement
        fields = [
            'id', 'settlement_number', 'partner', 'partner_name',
            'settlement_date', 'period_start', 'period_end',
            'total_claims', 'total_amount', 'adjustments', 'net_amount',
            'status', 'status_display',
            'payment_date', 'payment_reference', 'notes',
        ]
