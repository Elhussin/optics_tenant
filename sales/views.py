from django.shortcuts import render

# Create your views here.
from sales.services.order_service import confirm_order
from sales.models import Order
from django.contrib.auth.models import User

order = Order.objects.get(id=1)
user = User.objects.get(id=1)
confirm_order(order, user)