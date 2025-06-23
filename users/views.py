from django.shortcuts import render
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate
from rest_framework import viewsets
from .serializers import UserSerializer
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView
from rest_framework.mixins import CreateModelMixin, UpdateModelMixin
from rest_framework.permissions import AllowAny
User = get_user_model()

# Create your views here.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


# @api_view(['POST'])
# def login_view(request):
#     refresh = RefreshToken.for_user(request.user)
#     access = str(refresh.access_token)
#     response = Response({"detail": "Login successful"})
#     response.set_cookie(
#         "access_token", access,
#         httponly=True, secure=True, samesite="Lax",
#         domain=".example.com", max_age=300
#     )
#     response.set_cookie(
#         "refresh_token", str(refresh),
#         httponly=True, secure=True, samesite="Lax",
#         domain=".example.com", max_age=7*24*3600
#     )
#     return response

# @api_view(['POST'])
# def refresh_token_view(request):
#     token = request.COOKIES.get('refresh_token')
#     refresh = RefreshToken(token)
#     new_access = str(refresh.access_token)
#     res = Response({"detail": "Refreshed"})
#     res.set_cookie("access_token", new_access, httponly=True, secure=True, samesite="Lax", domain=".example.com", max_age=300)
#     return res

# @api_view(['POST'])
# def logout_view(request):
#     response = Response({"detail": "Logged out"})
#     response.delete_cookie('access_token', domain=".example.com")
#     response.delete_cookie('refresh_token', domain=".example.com")
#     return response


# @api_view(['POST'])
# def register_view(request):
#     serializer = UserSerializer(data=request.data)
#     if serializer.is_valid():
#         user = serializer.save()
#         return Response({"detail": "User registered successfully"})

#     return Response(serializer.errors, status=400)

# @api_view(['POST'])
# def update_profile_view(request):
#     user = request.user
#     serializer = UserSerializer(user, data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response({"detail": "Profile updated successfully"})

#     return Response(serializer.errors, status=400)




class LoginView(viewsets.ModelViewSet):
    authentication_classes = [AllowAny]
    def post(self, request):
        refresh = RefreshToken.for_user(request.user)
        access = str(refresh.access_token)
        response = Response({"detail": "Login successful"})
        response.set_cookie(
            "access_token", access,
            httponly=True, secure=True, samesite="Lax",
            domain=".example.com", max_age=300
        )
        response.set_cookie(
            "refresh_token", str(refresh),
            httponly=True, secure=True, samesite="Lax",
            domain=".example.com", max_age=7*24*3600
        )
        return response

class RefreshTokenView(viewsets.ModelViewSet):
    def post(self, request):
        token = request.COOKIES.get('refresh_token')
        refresh = RefreshToken(token)
        new_access = str(refresh.access_token)
        res = Response({"detail": "Refreshed"})
        res.set_cookie("access_token", new_access, httponly=True, secure=True, samesite="Lax", domain=".example.com", max_age=300)
        return res

class LogoutView(viewsets.ModelViewSet):
    def post(self, request):
        response = Response({"detail": "Logged out"})
        response.delete_cookie('access_token', domain=".example.com")
        response.delete_cookie('refresh_token', domain=".example.com")
        return response



class RegisterView(viewsets.ModelViewSet, CreateModelMixin):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

class UpdateProfileView(viewsets.ModelViewSet, UpdateModelMixin):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def post(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

