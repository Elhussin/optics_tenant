# from django.shortcuts import render

# # Create your views here.
# # views.py - عرض البيانات
# from django.shortcuts import render, get_object_or_404, redirect
# from django.contrib.auth.decorators import login_required
# from django.contrib import messages
# from django.http import JsonResponse, HttpResponse
# from django.core.paginator import Paginator
# from django.db.models import Q, Sum, Count
# from django.db import transaction
# from django.utils import timezone
# from django.views.decorators.http import require_http_methods
# from django.views.decorators.csrf import csrf_exempt
# import json

# from .models import Order, OrderItem, Invoice, InvoiceItem, Stock, StockMovement
# from .forms import OrderForm, OrderItemFormSet, InvoiceForm, StockAdjustmentForm
# from .services import OrderService, InventoryService, InvoiceService


# # Order Views
# @login_required
# def order_list(request):
#     """قائمة الطلبات"""
#     orders = Order.objects.select_related('customer', 'branch').order_by('-created_at')
    
#     # البحث والفلترة
#     search = request.GET.get('search')
#     if search:
#         orders = orders.filter(
#             Q(order_number__icontains=search) |
#             Q(customer__full_name__icontains=search) |
#             Q(customer__phone__icontains=search)
#         )
    
#     status = request.GET.get('status')
#     if status:
#         orders = orders.filter(status=status)
    
#     # التصفح
#     paginator = Paginator(orders, 20)
#     page_number = request.GET.get('page')
#     page_obj = paginator.get_page(page_number)
    
#     context = {
#         'page_obj': page_obj,
#         'status_choices': Order.STATUS_CHOICES,
#         'search': search,
#         'selected_status': status,
#     }
    
#     return render(request, 'orders/order_list.html', context)


# @login_required
# def order_detail(request, order_id):
#     """تفاصيل الطلب"""
#     order = get_object_or_404(Order, id=order_id)
    
#     context = {
#         'order': order,
#         'items': order.items.select_related('variant__product').all(),
#         'invoices': order.invoices.all(),
#     }
    
#     return render(request, 'orders/order_detail.html', context)


# @login_required
# @transaction.atomic
# def order_create(request):
#     """إنشاء طلب جديد"""
#     if request.method == 'POST':
#         form = OrderForm(request.POST)
#         formset = OrderItemFormSet(request.POST)
        
#         if form.is_valid() and formset.is_valid():
#             order = form.save(commit=False)
#             order.save()
            
#             formset.instance = order
#             formset.save()
            
#             messages.success(request, f'تم إنشاء الطلب {order.order_number} بنجاح')
#             return redirect('order_detail', order_id=order.id)
#     else:
#         form = OrderForm()
#         formset = OrderItemFormSet()
    
#     context = {
#         'form': form,
#         'formset': formset,
#     }__all__ = [
    
#     return render(request, 'orders/order_form.html', context)


# @login_required
# @require_http_methods(["POST"])
# def order_confirm(request, order_id):
#     """تأكيد الطلب"""
#     order = get_object_or_404(Order, id=order_id)
    
#     try:
#         order.confirm_order(request.user)
#         messages.success(request, f'تم تأكيد الطلب {order.order_number}')
#     except ValidationError as e:
#         messages.error(request, str(e))
    
#     return redirect('order_detail', order_id=order.id)


# @login_required
# @require_http_methods(["POST"])
# def order_cancel(request, order_id):
#     """إلغاء الطلب"""
#     order = get_object_or_404(Order, id=order_id)
    
#     try:
#         order.cancel_order(request.user)
#         messages.success(request, f'تم إلغاء الطلب {order.order_number}')
#     except ValidationError as e:
#         messages.error(request, str(e))
    
#     return redirect('order_detail', order_id=order.id)


# # Invoice Views
# @login_required
# def invoice_list(request):
#     """قائمة الفواتير"""
#     invoices = Invoice.objects.select_related('customer', 'branch').order_by('-date_created')
    
#     # البحث والفلترة
#     search = request.GET.get('search')
#     if search:
#         invoices = invoices.filter(
#             Q(invoice_number__icontains=search) |
#             Q(customer__full_name__icontains=search)
#         )
    
#     status = request.GET.get('status')
#     if status:
#         invoices = invoices.filter(status=status)
    
#     # التصفح
#     paginator = Paginator(invoices, 20)
#     page_number = request.GET.get('page')
#     page_obj = paginator.get_page(page_number)
    
#     context = {
#         'page_obj': page_obj,
#         'status_choices': Invoice.INVOICE_STATUS_CHOICES,
#         'search': search,
#         'selected_status': status,
#     }
    
#     return render(request, 'invoices/invoice_list.html', context)


# @login_required
# def invoice_detail(request, invoice_id):
#     """تفاصيل الفاتورة"""
#     invoice = get_object_or_404(Invoice, id=invoice_id)
    
#     context = {
#         'invoice': invoice,
#         'items': invoice.items.select_related('variant__product').all(),
#     }
    
#     return render(request, 'invoices/invoice_detail.html', context)


# @login_required
# @transaction.atomic
# def invoice_create_from_order(request, order_id):
#     """إنشاء فاتورة من الطلب"""
#     order = get_object_or_404(Order, id=order_id)
    
#     try:
#         invoice = InvoiceService.create_invoice_from_order(order, request.user)
#         messages.success(request, f'تم إنشاء الفاتورة {invoice.invoice_number} من الطلب {order.order_number}')
#         return redirect('invoice_detail', invoice_id=invoice.id)
#     except ValidationError as e:
#         messages.error(request, str(e))
#         return redirect('order_detail', order_id=order.id)


# @login_required
# @require_http_methods(["POST"])
# def invoice_payment(request, invoice_id):
#     """معالجة دفع الفاتورة"""
#     invoice = get_object_or_404(Invoice, id=invoice_id)
    
#     try:
#         amount = float(request.POST.get('amount', 0))
#         payment_method = request.POST.get('payment_method', 'cash')
        
#         InvoiceService.process_invoice_payment(invoice, amount, payment_method)
#         messages.success(request, f'تم تسجيل دفعة بقيمة {amount} للفاتورة {invoice.invoice_number}')
#     except (ValueError, ValidationError) as e:
#         messages.error(request, str(e))
    
#     return redirect('invoice_detail', invoice_id=invoice.id)


# # Stock Views
# @login_required
# def stock_list(request):
#     """قائمة المخزون"""
#     stocks = Stock.objects.select_related('variant__product', 'branch').order_by('branch', 'variant__product__name')
    
#     # الفلترة
#     branch_id = request.GET.get('branch')
#     if branch_id:
#         stocks = stocks.filter(branch_id=branch_id)
    
#     low_stock = request.GET.get('low_stock')
#     if low_stock:
#         stocks = stocks.filter(stock_quantity__lte=models.F('minimum_stock_level'))
    
#     search = request.GET.get('search')
#     if search:
#         stocks = stocks.filter(
#             Q(variant__product__name__icontains=search) |
#             Q(variant__sku__icontains=search)
#         )
    
#     # التصفح
#     paginator = Paginator(stocks, 50)
#     page_number = request.GET.get('page')
#     page_obj = paginator.get_page(page_number)
    
#     context = {
#         'page_obj': page_obj,
#         'search': search,
#         'selected_branch': branch_id,
#         'low_stock': low_stock,
#     }
    
#     return render(request, 'stock/stock_list.html', context)


# @login_required
# def stock_movements(request):
#     """حركات المخزون"""
#     movements = StockMovement.objects.select_related('variant__product', 'branch', 'created_by').order_by('-movement_date')
    
#     # الفلترة
#     branch_id = request.GET.get('branch')
#     if branch_id:
#         movements = movements.filter(branch_id=branch_id)
    
#     movement_type = request.GET.get('type')
#     if movement_type:
#         movements = movements.filter(movement_type=movement_type)
    
#     # التصفح
#     paginator = Paginator(movements, 100)
#     page_number = request.GET.get('page')
#     page_obj = paginator.get_page(page_number)
    
#     context = {
#         'page_obj': page_obj,
#         'movement_types': StockMovement.MOVEMENT_TYPES,
#         'selected_branch': branch_id,
#         'selected_type': movement_type,
#     }
    
#     return render(request, 'stock/movements.html', context)


# @login_required
# @transaction.atomic
# def stock_adjustment(request):
#     """تعديل المخزون"""
#     if request.method == 'POST':
#         form = StockAdjustmentForm(request.POST)
#         if form.is_valid():
#             try:
#                 InventoryService.adjust_stock(
#                     branch=form.cleaned_data['branch'],
#                     variant=form.cleaned_data['variant'],
#                     new_quantity=form.cleaned_data['new_quantity'],
#                     user=request.user,
#                     reason=form.cleaned_data.get('reason', 'Manual adjustment')
#                 )
#                 messages.success(request, 'تم تعديل المخزون بنجاح')
#                 return redirect('stock_list')
#             except ValidationError as e:
#                 messages.error(request, str(e))
#     else:
#         form = StockAdjustmentForm()
    
#     context = {'form': form}
#     return render(request, 'stock/adjustment_form.html', context)


# # API Views for AJAX
# @login_required
# def api_product_variants(request):
#     """API للحصول على متغيرات المنتج"""
#     product_id = request.GET.get('product_id')
#     if not product_id:
#         return JsonResponse({'variants': []})
    
#     variants = ProductVariant.objects.filter(product_id=product_id).values(
#         'id', 'sku', 'name', 'selling_price', 'cost_price'
#     )
    
#     return JsonResponse({'variants': list(variants)})


# @login_required
# def api_stock_check(request):
#     """API للتحقق من المخزون"""
#     variant_id = request.GET.get('variant_id')
#     branch_id = request.GET.get('branch_id')
    
#     if not variant_id or not branch_id:
#         return JsonResponse({'available': 0})
    
#     stock = Stock.objects.filter(variant_id=variant_id, branch_id=branch_id).first()
#     available = stock.available_quantity if stock else 0
    
#     return JsonResponse({
#         'available': available,
#         'reserved': stock.quantity_reserved if stock else 0,
#         'total': stock.stock_quantity if stock else 0,
#     })


# @login_required
# def api_customer_search(request):
#     """API للبحث عن العملاء"""
#     query = request.GET.get('q', '')
#     if len(query) < 2:
#         return JsonResponse({'customers': []})
    
#     customers = Customer.objects.filter(
#         Q(full_name__icontains=query) |
#         Q(phone__icontains=query) |
#         Q(email__icontains=query)
#     )[:10]
    
#     results = []
#     for customer in customers:
#         results.append({
#             'id': customer.id,
#             'name': customer.full_name,
#             'phone': customer.phone,
#             'email': customer.email,
#         })
    
#     return JsonResponse({'customers': results})


# # Export Views
# @login_required
# def export_stock_excel(request):
#     """تصدير المخزون إلى Excel"""
#     branch_id = request.GET.get('branch')
#     low_stock = request.GET.get('low_stock')
    
#     stocks = Stock.objects.select_related('variant__product', 'branch')
    
#     if branch_id:
#         stocks = stocks.filter(branch_id=branch_id)
    
#     if low_stock:
#         stocks = stocks.filter(stock_quantity__lte=models.F('minimum_stock_level'))
    
#     from .utils import export_stock_to_excel
#     return export_stock_to_excel(stocks)


# # Dashboard Views
# @login_required
# def dashboard(request):
#     """لوحة التحكم"""
#     # إحصائ
#     pass
# views.py
# from rest_framework import viewsets
# from .models import ProductVariant, Stocks, StockMovements, StockTransfer, StockTransferItem, Product
# from .serializers import *

# class BulkInventoryMovementAPIView(APIView):
#     def post(self, request, branch_id):
#         serializer = BulkStockMovementSerializer(data=request.data)
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         movements_data = serializer.validated_data['movements']
#         results = []

#         try:
#             with transaction.atomic():
#                 for move in movements_data:
#                     variant_id = move['variant_id']
#                     quantity = move['quantity']
#                     movement_type = move['movement_type']
#                     notes = move.get('notes', '')

#                     inventory = Inventory.objects.select_for_update().get(
#                         branch_id=branch_id, variant_id=variant_id
#                     )

#                     quantity_before = inventory.quantity_in_stock
#                     inventory.quantity_in_stock += quantity

#                     if inventory.quantity_in_stock < 0 and not inventory.allow_backorder:
#                         raise ValueError(f"Insufficient stock for variant {variant_id}")

#                     inventory.save(update_fields=['quantity_in_stock'])

#                     StockMovements.objects.create(
#                         inventory=inventory,
#                         movement_type=movement_type,
#                         quantity=quantity,
#                         quantity_before=quantity_before,
#                         quantity_after=inventory.quantity_in_stock,
#                         notes=notes
#                     )

#                     results.append({
#                         'variant_id': variant_id,
#                         'quantity_before': quantity_before,
#                         'quantity_after': inventory.quantity_in_stock,
#                         'status': 'success'
#                     })

#             return Response({'movements': results}, status=status.HTTP_200_OK)

#         except Inventory.DoesNotExist:
#             return Response({"error": f"Inventory not found for one of the variants."}, status=status.HTTP_404_NOT_FOUND)
#         except ValueError as e:
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from .models import Product
from .forms import ProductForm

from rest_framework import viewsets
from .serializers import (
    ProductSerializer,
    ProductVariantSerializer,
    StocksSerializer,
    StockMovementsSerializer,
    StockTransferSerializer,
    StockTransferItemSerializer
)
from .models import (
    ProductVariant, 
    Stocks,
    StockMovements,
    StockTransfer,
    StockTransferItem
)
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from rest_framework import status
# from django.db import transaction
# from django.shortcuts import get_object_or_404

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer


class StocksViewSet(viewsets.ModelViewSet):
    queryset = Stocks.objects.all()
    serializer_class = StocksSerializer


class StockMovementsViewSet(viewsets.ModelViewSet):
    queryset = StockMovements.objects.all()
    serializer_class = StockMovementsSerializer


class StockTransferViewSet(viewsets.ModelViewSet):
    queryset = StockTransfer.objects.all()
    serializer_class = StockTransferSerializer


class StockTransferItemViewSet(viewsets.ModelViewSet):
    queryset = StockTransferItem.objects.all()
    serializer_class = StockTransferItemSerializer



class ProductListView(ListView):
    model = Product
    template_name = 'templates/products/product_list.html'
    context_object_name = 'object_list'

class ProductDetailView(DetailView):
    model = Product
    template_name = 'products/product_detail.html'
    context_object_name = 'object'

class ProductCreateView(CreateView):
    model = Product
    form_class = ProductForm
    template_name = 'templates/products/product_form.html'
    success_url = reverse_lazy('products:product_list')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['view'] = {'action': 'Create'}
        return context

class ProductUpdateView(UpdateView):
    model = Product
    form_class = ProductForm
    template_name = 'templates/products/product_form.html'
    success_url = reverse_lazy('products:product_list')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['view'] = {'action': 'Update'}
        return context

class ProductDeleteView(DeleteView):
    model = Product
    template_name = 'templates/products/product_confirm_delete.html'
    success_url = reverse_lazy('products:product_list')
