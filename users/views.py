# from django.shortcuts import render
# from rest_framework.response import Response
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework.decorators import api_view
# from django.contrib.auth import authenticate

# from .serializers import UserSerializer
# from django.contrib.auth import get_user_model
# from rest_framework.views import APIView
# from rest_framework.generics import GenericAPIView
# from rest_framework.mixins import CreateModelMixin, UpdateModelMixin
# from rest_framework.permissions import AllowAny
# User = get_user_model()

# # Create your views here.


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




# class LoginView(viewsets.ModelViewSet):
#     authentication_classes = [AllowAny]
#     def post(self, request):
#         refresh = RefreshToken.for_user(request.user)
#         access = str(refresh.access_token)
#         response = Response({"detail": "Login successful"})
#         response.set_cookie(
#             "access_token", access,
#             httponly=True, secure=True, samesite="Lax",
#             domain=".example.com", max_age=300
#         )
#         response.set_cookie(
#             "refresh_token", str(refresh),
#             httponly=True, secure=True, samesite="Lax",
#             domain=".example.com", max_age=7*24*3600
#         )
#         return response

# class RefreshTokenView(viewsets.ModelViewSet):
#     def post(self, request):
#         token = request.COOKIES.get('refresh_token')
#         refresh = RefreshToken(token)
#         new_access = str(refresh.access_token)
#         res = Response({"detail": "Refreshed"})
#         res.set_cookie("access_token", new_access, httponly=True, secure=True, samesite="Lax", domain=".example.com", max_age=300)
#         return res

# class LogoutView(viewsets.ModelViewSet):
#     def post(self, request):
#         response = Response({"detail": "Logged out"})
#         response.delete_cookie('access_token', domain=".example.com")
#         response.delete_cookie('refresh_token', domain=".example.com")
#         return response



# class RegisterView(viewsets.ModelViewSet, CreateModelMixin):
#     serializer_class = UserSerializer

#     def post(self, request, *args, **kwargs):
#         return self.create(request, *args, **kwargs)

# class UpdateProfileView(viewsets.ModelViewSet, UpdateModelMixin):
#     serializer_class = UserSerializer

#     def get_object(self):
#         return self.request.user

#     def post(self, request, *args, **kwargs):
#         return self.update(request, *args, **kwargs)


# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, LoginSerializer,UserSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.timezone import now
# accounts/views.py
from rest_framework.permissions import IsAuthenticated
# from core.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken, TokenError
from rest_framework.permissions import AllowAny
from rest_framework import viewsets
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema

User = get_user_model()

def set_token_cookies(response, refresh):
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite='Lax',
        max_age=300  # 5 دقائق
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite='Lax',
        max_age=7 * 24 * 60 * 60  # 7 أيام
    )

class RegisterView(APIView):
    @extend_schema(
        request=RegisterSerializer,
        responses={200: None},
        description="Register endpoint for users"
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            response = Response({"msg": "User created"}, status=status.HTTP_201_CREATED)
            set_cookie(response, str(refresh.access_token))
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]  # 👈 مفتوح للجميع

    @extend_schema(
        request=LoginSerializer,
        responses={200: None},
        description="Login endpoint for users"
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if user is not None:
                refresh = RefreshToken.for_user(user)
                response = Response({"msg": "Login successful"})
                set_token_cookies(response, refresh)
                return response
            return Response({"error": "Invalid credentials"}, status=401)
        return Response(serializer.errors, status=400)

class RefreshTokenView(APIView):
    @extend_schema(
        request=RefreshToken,
        responses={200: None},
        description="Refresh token endpoint for users"
    )
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if refresh_token is None:
            return Response({"error": "No refresh token found"}, status=401)

        try:
            refresh = RefreshToken(refresh_token)
            new_access = str(refresh.access_token)

            response = Response({"msg": "Token refreshed"})
            response.set_cookie(
                key="access_token",
                value=new_access,
                httponly=True,
                secure=True,
                samesite="Lax",
                max_age=300
            )
            return response
        except TokenError:
            return Response({"error": "Invalid or expired refresh token"}, status=401)

class LogoutView(APIView):
    @extend_schema(
        request=RefreshToken,
        responses={200: None},
        description="Logout endpoint for users"
    )
    def post(self, request):
        response = Response({"msg": "Logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        return response

class ProfileView(APIView):
    # permission_classes = [IsAuthenticated]
    # authentication_classes = [JWTAuthentication]

    @extend_schema(
        responses={200: None},
        description="Profile endpoint for users"
    )
    def get(self, request):
        return Response({"user": request.user.username})

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
