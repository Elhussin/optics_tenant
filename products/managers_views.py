# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Branch, BranchInventory, EyewearVariant
from .serializers import BranchSerializer, BranchInventorySerializer

class ActiveBranchesView(APIView):
    def get(self, request):
        branches = Branch.objects.active()
        return Response(BranchSerializer(branches, many=True).data)


class MainBranchView(APIView):
    def get(self, request):
        branch = Branch.objects.main_branch()
        return Response(BranchSerializer(branch).data)


class LowStockByBranchView(APIView):
    def get(self, request, branch_id):
        inventories = BranchInventory.objects.for_branch(branch_id).low_stock()
        return Response(BranchInventorySerializer(inventories, many=True).data)


class VariantTotalStockView(APIView):
    def get(self, request, variant_id):
        variant = EyewearVariant.objects.get(id=variant_id)
        total_stock = BranchInventory.objects.get_total_stock(variant)
        return Response({'variant': variant.name, 'total_stock': total_stock})
