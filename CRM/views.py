from django.shortcuts import render

# Create your views here.
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from dj_rest_auth.views import LoginView
from notsDjango.utulities import BaseViewSet,DynamicModelViewSet
from .serializers import UserSerializer
from django.contrib.auth import get_user_model
from rest_framework.response import Response
User = get_user_model()

# UserDetailView: get the current user by token

class UserDetailView(BaseViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        # استرجاع المستخدم الحالي فقط
        return User.objects.filter(id=self.request.user.id).only('id', 'username', 'email', 'is_superuser', 'last_name', 'first_name', 'is_staff', 'is_active')

    def retrieve(self, request, pk=None):
        user = request.user  # استرجاع المستخدم الحالي من التوكن
        serializer = self.serializer_class(user)
        return Response(serializer.data)
    
# get all ``User`` objects
class UserViewSet(DynamicModelViewSet):
    model = User
    serializer_class = UserSerializer

    def get_permissions(self):
        return super().get_default_permissions()