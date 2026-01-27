from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _

from ..models import ProductVariant
from ..utils.helper_functions import (
    get_variant_stock_summary,
    find_nearest_branch_with_stock,
    can_fulfill_order_across_branches
)
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter
from rest_framework import serializers


class VariantStockSummaryAPIView(APIView):
    """
    API View to get stock summary for a specific variant across all branches.
    """

    @extend_schema(
        responses=inline_serializer(
            name='VariantStockSummaryResponse',
            fields={
                'total_stock': serializers.FloatField(),
                'total_available': serializers.FloatField(),
                'total_reserved': serializers.FloatField(),
                'branches': inline_serializer(
                    name='StockSummaryBranchInfo',
                    fields={
                        'branch': serializers.PrimaryKeyRelatedField(read_only=True),
                        'stock': serializers.FloatField(),
                        'available': serializers.FloatField(),
                        'reserved': serializers.FloatField(),
                        'status': serializers.CharField(),
                    },
                    many=True
                ),
                'low_stock_branches': serializers.ListField(
                    child=serializers.PrimaryKeyRelatedField(read_only=True)
                ),
                'out_of_stock_branches': serializers.ListField(
                    child=serializers.PrimaryKeyRelatedField(read_only=True)
                ),
            }
        )
    )
    def get(self, request, variant_id):
        variant = get_object_or_404(ProductVariant, id=variant_id)
        summary = get_variant_stock_summary(variant)
        return Response(summary)


class NearestBranchAPIView(APIView):
    """
    API View to find the nearest branch with sufficient stock.
    """

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='min_quantity',
                description='Minimum quantity required',
                required=False,
                type=int,
                default=1
            )
        ],
        responses=inline_serializer(
            name='NearestBranchResponse',
            fields={
                'branch_id': serializers.IntegerField(),
                'branch_name': serializers.CharField(),
                'available': serializers.FloatField(),
            }
        )
    )
    def get(self, request, variant_id):
        variant = get_object_or_404(ProductVariant, id=variant_id)

        # TO DO: specific user location logic
        user_location = None
        min_quantity = int(request.query_params.get("min_quantity", 1))

        branch_inventory = find_nearest_branch_with_stock(
            variant, user_location, min_quantity)
        if not branch_inventory:
            return Response({'detail': _('No branch has sufficient stock.')}, status=status.HTTP_404_NOT_FOUND)

        data = {
            'branch_id': branch_inventory.branch.id,
            'branch_name': branch_inventory.branch.name,
            'available': branch_inventory.available_quantity,
        }
        return Response(data)


class OrderFulfillmentCheckAPIView(APIView):
    """
    API View to check if an order can be fulfilled across multiple branches.
    """

    @extend_schema(
        request=inline_serializer(
            name='OrderFulfillmentCheckRequest',
            fields={
                'items': inline_serializer(
                    name='OrderFulfillmentItem',
                    fields={
                        'variant_id': serializers.IntegerField(),
                        'quantity': serializers.IntegerField()
                    },
                    many=True
                )
            }
        ),
        responses={
            200: inline_serializer(
                name='OrderFulfillmentCheckResponse',
                fields={
                    'variant_id': inline_serializer(
                        name='VariantFulfillmentPlan',
                        fields={
                            'branch_id': serializers.IntegerField(),
                            'branch_name': serializers.CharField(),
                            'quantity': serializers.IntegerField()
                        },
                        many=True
                    )
                }
            )
        }
    )
    def post(self, request):
        """
        Expecting JSON in the format:
        {
            "items": [
                {"variant_id": 1, "quantity": 3},
                {"variant_id": 5, "quantity": 2}
            ]
        }
        """
        items_data = request.data.get("items", [])
        items_dict = {}

        for item in items_data:
            variant_id = item.get("variant_id")
            quantity = item.get("quantity")
            if not variant_id or not quantity:
                continue

            variant = get_object_or_404(ProductVariant, id=variant_id)
            items_dict[variant] = quantity

        fulfillment_plan = can_fulfill_order_across_branches(items_dict)

        if not fulfillment_plan:
            return Response({'detail': _('Cannot fulfill order completely.')}, status=status.HTTP_400_BAD_REQUEST)

        # Format response
        response_data = {}
        for variant, plan in fulfillment_plan.items():
            response_data[variant.id] = [
                {
                    'branch_id': item['branch'].id,
                    'branch_name': item['branch'].name,
                    'quantity': item['quantity']
                }
                for item in plan
            ]

        return Response(response_data)
