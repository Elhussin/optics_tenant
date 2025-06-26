
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,serializers
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
from drf_spectacular.utils import extend_schema , OpenApiResponse, inline_serializer
from django.db import connection
from core.utils.set_token import set_token_cookies
from rest_framework.permissions import IsAuthenticated

User = get_user_model()


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
    permission_classes = [AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={
            200: inline_serializer(
                name='LoginSuccessResponse',
                fields={'msg': serializers.CharField()}
            ),
            400: inline_serializer(
                name='LoginBadRequest',
                fields={'username': serializers.ListField(child=serializers.CharField(), required=False),
                        'password': serializers.ListField(child=serializers.CharField(), required=False)}
            ),
            403: inline_serializer(
                name='LoginForbidden',
                fields={'detail': serializers.CharField()}
            ),
        },
        description="Login endpoint for users"
    )

    def post(self, request):
        print("request",request.data)
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            print("user",user)
            if not user.is_active:
                return Response(
                    {"detail": "User account is disabled."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            refresh = RefreshToken.for_user(user)
            response = Response(
                {"msg": "Login successful"},
                status=status.HTTP_200_OK
            )
            set_token_cookies(response, refresh)
            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(APIView):
    @extend_schema(
        responses={
            200: inline_serializer(
                name='RefreshTokenResponse',
                fields={
                    'msg': serializers.CharField(),
                    'access': serializers.CharField()
                }
            ),
            401: inline_serializer(
                name='TokenRefreshError',
                fields={
                    'error': serializers.CharField()
                }
            )
        }
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
                httponly=True, # HttpOnly flag to prevent JavaScript access
                secure=False,  # Secure flag to ensure cookie is sent over HTTPS
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
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=None,
        responses={200: UserSerializer},
        description="Get current authenticated user profile data"

    )
    def get(self, request):
        """
        Returns the current authenticated user's profile data.
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)




class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # ✅ يتأكد من أن المستخدم مصادق عليه

    def get_queryset(self):
        # يمكن فلترة بناءً على المستخدم الحالي إذا أردت مثلاً
        user = self.request.user
        if user.is_superuser:
            return User.objects.all()
        return User.objects.filter(id=user.id)
