# apps/crm/serializers/partner.py
"""
Serializers للشركاء والتأمين
"""

from rest_framework import serializers
from apps.crm.models import (
    Partner, PartnerBranch, PartnerPriceList, PartnerPriceListItem,
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


class PartnerPriceListItemSerializer(serializers.ModelSerializer):
    """Serializer لعنصر قائمة الأسعار"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    variant_sku = serializers.CharField(source='variant.sku', read_only=True)
    category_name = serializers.CharField(
        source='category.name', read_only=True)

    class Meta:
        model = PartnerPriceListItem
        fields = [
            'id', 'price_list', 'product', 'product_name',
            'variant', 'variant_sku', 'category', 'category_name',
            'special_price', 'special_discount',
        ]


class PartnerPriceListSerializer(serializers.ModelSerializer):
    """Serializer لقائمة أسعار الشريك"""
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    items = PartnerPriceListItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = PartnerPriceList
        fields = [
            'id', 'partner', 'partner_name', 'name', 'description',
            'price_type', 'adjustment_value',
            'valid_from', 'valid_until', 'applies_to_all',
            'items', 'items_count', 'is_active',
        ]

    def get_items_count(self, obj):
        return obj.items.count()


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
            'member_id', 'policy_number',
            'coverage_start', 'coverage_end',
            'annual_limit', 'remaining_limit',
            'copay_percentage', 'copay_fixed', 'coverage_class',
            'is_active', 'is_coverage_active', 'notes',
        ]


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
