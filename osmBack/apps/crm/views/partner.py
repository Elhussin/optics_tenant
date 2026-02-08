# apps/crm/views/partner.py
"""
Views للشركاء والتأمين
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter
from rest_framework import serializers

from apps.crm.models import (
    Partner, PartnerBranch,
    CustomerPartnerLink, InsuranceClaim, ClaimItem, ClaimDocument, PartnerSettlement
)
from apps.crm.serializers.partner import (
    PartnerSerializer, PartnerListSerializer, PartnerBranchSerializer,
    CustomerPartnerLinkSerializer,
    InsuranceClaimSerializer, InsuranceClaimCreateSerializer, InsuranceClaimListSerializer,
    ClaimItemSerializer, ClaimDocumentSerializer, PartnerSettlementSerializer
)
from core.views import BaseViewSet
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

# الأدوار المسموحة
PARTNER_ROLES = ["BranchManager", "FinanceOfficer"]
SALES_ROLES = ["SalesClerk", "BranchManager"]


class PartnerViewSet(BaseViewSet):
    """
    ViewSet للشركاء (تأمين، تقسيط، جملة، شركات)
    """
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=PARTNER_ROLES
        )
    ]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['partner_type', 'is_active']
    search_fields = ['name', 'name_en', 'code', 'contact_person', 'email']
    ordering_fields = ['name', 'created_at', 'current_balance']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'list':
            return PartnerListSerializer
        return PartnerSerializer

    @extend_schema(
        parameters=[OpenApiParameter(name='type', required=True, type=str)],
        responses=PartnerListSerializer(many=True)
    )
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """جلب الشركاء حسب النوع"""
        partner_type = request.query_params.get('type')
        if not partner_type:
            return Response(
                {'detail': str(_('Type parameter is required'))},
                status=status.HTTP_400_BAD_REQUEST
            )

        partners = self.get_queryset().filter(
            partner_type=partner_type,
            is_active=True
        )
        serializer = PartnerListSerializer(partners, many=True)
        return Response(serializer.data)

    @extend_schema(responses=PartnerListSerializer(many=True))
    @action(detail=False, methods=['get'])
    def insurance_companies(self, request):
        """شركات التأمين فقط"""
        partners = self.get_queryset().filter(
            partner_type='insurance',
            is_active=True
        )
        serializer = PartnerListSerializer(partners, many=True)
        return Response(serializer.data)

    @extend_schema(responses=PartnerListSerializer(many=True))
    @action(detail=False, methods=['get'])
    def bnpl_providers(self, request):
        """شركات التقسيط (Tabby, Tamara)"""
        partners = self.get_queryset().filter(
            partner_type='bnpl',
            is_active=True
        )
        serializer = PartnerListSerializer(partners, many=True)
        return Response(serializer.data)

    @extend_schema(responses=CustomerPartnerLinkSerializer(many=True))
    @action(detail=True, methods=['get'])
    def customers(self, request, pk=None):
        """العملاء المرتبطين بهذا الشريك"""
        partner = self.get_object()
        links = CustomerPartnerLink.objects.filter(
            partner=partner,
            is_active=True
        ).select_related('customer')
        serializer = CustomerPartnerLinkSerializer(links, many=True)
        return Response(serializer.data)

    @extend_schema(
        responses={
            200: inline_serializer(
                name='PartnerClaimsSummary',
                fields={
                    'summary': inline_serializer(
                        name='ClaimsStats',
                        fields={
                            'total_claims': serializers.IntegerField(),
                            'total_amount': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'total_approved': serializers.DecimalField(max_digits=20, decimal_places=2),
                            'total_paid': serializers.DecimalField(max_digits=20, decimal_places=2),
                        }
                    ),
                    'by_status': serializers.ListField()
                }
            )
        }
    )
    @action(detail=True, methods=['get'])
    def claims_summary(self, request, pk=None):
        """ملخص مطالبات الشريك"""
        partner = self.get_object()
        from django.db.models import Sum, Count

        summary = InsuranceClaim.objects.filter(
            partner=partner
        ).aggregate(
            total_claims=Count('id'),
            total_amount=Sum('total_amount'),
            total_approved=Sum('approved_amount'),
            total_paid=Sum('paid_amount'),
        )

        by_status = InsuranceClaim.objects.filter(
            partner=partner
        ).values('status').annotate(
            count=Count('id'),
            amount=Sum('claim_amount')
        )

        return Response({
            'summary': summary,
            'by_status': list(by_status),
        })

    @extend_schema(
        responses={
            200: inline_serializer(
                name='PartnerChoices',
                fields={
                    'partner_types': serializers.DictField(),
                    'payment_terms': serializers.DictField(),
                }
            )
        }
    )
    @action(detail=False, methods=['get'])
    def choices(self, request):
        """الخيارات المتاحة"""
        return Response({
            'partner_types': Partner.PARTNER_TYPES,
            'payment_terms': Partner.PAYMENT_TERMS,
        })


class PartnerBranchViewSet(BaseViewSet):
    """ربط الشركاء بالفروع"""
    queryset = PartnerBranch.objects.select_related('partner', 'branch').all()
    serializer_class = PartnerBranchSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=PARTNER_ROLES
        )
    ]
    filterset_fields = ['partner', 'branch', 'is_active']


class CustomerPartnerLinkViewSet(BaseViewSet):
    """ربط العملاء بالشركاء"""
    queryset = CustomerPartnerLink.objects.select_related(
        'customer', 'partner').all()
    serializer_class = CustomerPartnerLinkSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=PARTNER_ROLES + SALES_ROLES
        )
    ]
    filterset_fields = ['customer', 'partner', 'is_active']
    search_fields = ['member_id', 'policy_number',
                     'customer__first_name', 'customer__last_name']

    @extend_schema(
        parameters=[OpenApiParameter(
            name='customer_id', required=True, type=int)],
        responses=CustomerPartnerLinkSerializer(many=True)
    )
    @action(detail=False, methods=['get'])
    def by_customer(self, request):
        """جلب ارتباطات عميل معين"""
        customer_id = request.query_params.get('customer_id')
        if not customer_id:
            return Response(
                {'detail': str(_('Customer ID is required'))},
                status=status.HTTP_400_BAD_REQUEST
            )

        links = self.get_queryset().filter(
            customer_id=customer_id,
            is_active=True
        )
        serializer = self.get_serializer(links, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """تعطيل الربط"""
        link = self.get_object()
        link.is_active = False
        link.save()
        return Response({'status': 'deactivated'})


# ═══════════════════════════════════════════════════════════════════════════════
# Insurance Claims
# ═══════════════════════════════════════════════════════════════════════════════

class InsuranceClaimViewSet(BaseViewSet):
    """مطالبات التأمين"""
    queryset = InsuranceClaim.objects.select_related(
        'order', 'partner', 'customer_partner_link', 'order__customer'
    ).prefetch_related('items', 'attached_documents').all()
    serializer_class = InsuranceClaimSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=PARTNER_ROLES + SALES_ROLES
        )
    ]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['partner', 'status', 'order']
    search_fields = ['claim_number',
                     'external_claim_number', 'order__order_number']
    ordering_fields = ['claim_date', 'total_amount', 'status']
    ordering = ['-claim_date']

    def get_serializer_class(self):
        if self.action == 'create':
            return InsuranceClaimCreateSerializer
        if self.action == 'list':
            return InsuranceClaimListSerializer
        return InsuranceClaimSerializer

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='SubmitClaimResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                    'claim_number': serializers.CharField(),
                }
            )
        }
    )
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """تقديم المطالبة"""
        claim = self.get_object()
        try:
            claim.submit()
            return Response({
                'status': 'success',
                'message': str(_('Claim submitted successfully')),
                'claim_number': claim.claim_number,
            })
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        request=inline_serializer(
            name='ApproveClaimRequest',
            fields={
                'approved_amount': serializers.DecimalField(max_digits=20, decimal_places=2),
                'notes': serializers.CharField(required=False)
            }
        ),
        responses={
            200: inline_serializer(
                name='ApproveClaimResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                    'approved_amount': serializers.CharField(),
                }
            )
        }
    )
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """اعتماد المطالبة"""
        claim = self.get_object()
        approved_amount = request.data.get('approved_amount')
        notes = request.data.get('notes', '')

        try:
            claim.approve(approved_amount, notes)
            return Response({
                'status': 'success',
                'message': str(_('Claim approved')),
                'approved_amount': str(claim.approved_amount),
            })
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        request=inline_serializer(
            name='RejectClaimRequest',
            fields={'reason': serializers.CharField()}
        ),
        responses={
            200: inline_serializer(
                name='RejectClaimResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                }
            )
        }
    )
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """رفض المطالبة"""
        claim = self.get_object()
        reason = request.data.get('reason', '')

        try:
            claim.reject(reason)
            return Response({
                'status': 'success',
                'message': str(_('Claim rejected')),
            })
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        request=inline_serializer(
            name='MarkClaimPaidRequest',
            fields={
                'amount': serializers.DecimalField(max_digits=20, decimal_places=2),
                'payment_reference': serializers.CharField(required=False)
            }
        ),
        responses={
            200: inline_serializer(
                name='MarkClaimPaidResponse',
                fields={
                    'status': serializers.CharField(),
                    'message': serializers.CharField(),
                    'paid_amount': serializers.CharField(),
                }
            )
        }
    )
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """تسجيل السداد"""
        claim = self.get_object()
        amount = request.data.get('amount')
        reference = request.data.get('payment_reference', '')

        try:
            claim.mark_paid(amount, reference)
            return Response({
                'status': 'success',
                'message': str(_('Payment recorded')),
                'paid_amount': str(claim.paid_amount),
            })
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(responses=InsuranceClaimListSerializer(many=True))
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """المطالبات المعلقة"""
        claims = self.get_queryset().filter(
            status__in=['draft', 'submitted', 'under_review']
        )
        serializer = InsuranceClaimListSerializer(claims, many=True)
        return Response(serializer.data)

    @extend_schema(responses=InsuranceClaimListSerializer(many=True))
    @action(detail=False, methods=['get'])
    def approved_unpaid(self, request):
        """المطالبات المعتمدة غير المسددة"""
        claims = self.get_queryset().filter(
            status__in=['approved', 'partial']
        )
        serializer = InsuranceClaimListSerializer(claims, many=True)
        return Response(serializer.data)

    @extend_schema(
        responses={
            200: inline_serializer(
                name='ClaimChoices',
                fields={'claim_status': serializers.DictField()}
            )
        }
    )
    @action(detail=False, methods=['get'])
    def choices(self, request):
        """الخيارات المتاحة"""
        return Response({
            'claim_status': InsuranceClaim.CLAIM_STATUS,
        })


class ClaimItemViewSet(BaseViewSet):
    """عناصر المطالبات"""
    queryset = ClaimItem.objects.select_related('claim', 'order_item').all()
    serializer_class = ClaimItemSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=PARTNER_ROLES
        )
    ]
    filterset_fields = ['claim']


class ClaimDocumentViewSet(BaseViewSet):
    """مستندات المطالبات"""
    queryset = ClaimDocument.objects.select_related('claim').all()
    serializer_class = ClaimDocumentSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=PARTNER_ROLES + SALES_ROLES
        )
    ]
    filterset_fields = ['claim', 'document_type']


class PartnerSettlementViewSet(BaseViewSet):
    """التسويات المالية"""
    queryset = PartnerSettlement.objects.select_related('partner').all()
    serializer_class = PartnerSettlementSerializer
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=['FinanceOfficer', 'BranchManager']
        )
    ]
    filterset_fields = ['partner', 'status']
    ordering = ['-settlement_date']

    @action(detail=True, methods=['post'])
    def calculate(self, request, pk=None):
        """حساب التسوية من المطالبات"""
        settlement = self.get_object()
        settlement.calculate_from_claims()
        settlement.save()

        serializer = self.get_serializer(settlement)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """تأكيد التسوية"""
        settlement = self.get_object()
        settlement.status = 'confirmed'
        settlement.save()
        return Response({'status': 'confirmed'})

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """تسجيل سداد التسوية"""
        settlement = self.get_object()
        settlement.status = 'paid'
        settlement.payment_date = request.data.get('payment_date')
        settlement.payment_reference = request.data.get(
            'payment_reference', '')
        settlement.save()
        return Response({'status': 'paid'})
