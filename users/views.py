
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,serializers
from .serializers import RegisterSerializer, LoginSerializer,UserSerializer
from django.contrib.auth import authenticate
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken, TokenError
from rest_framework.permissions import AllowAny
from rest_framework import viewsets
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema , OpenApiResponse, inline_serializer
from django.db import connection
from core.utils.set_token import set_token_cookies
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from core.permissions.permissions import ROLE_PERMISSIONS
from core.permissions.decorators import role_required
from django.utils.decorators import method_decorator
from django_filters.rest_framework import DjangoFilterBackend
from .filters import UserFilter
User = get_user_model()

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
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']

            if not user.is_active:
                return Response({"detail": "User account is disabled."}, status=status.HTTP_403_FORBIDDEN)
            role = user.role
            permissions = ROLE_PERMISSIONS.get(role, [])

            refresh = RefreshToken.for_user(user)
            refresh["role"] = user.role
            refresh["tenant"] = connection.schema_name
            refresh["permissions"] = permissions

            response = Response({"msg": "Login successful"})
            set_token_cookies(response, access=str(refresh.access_token), refresh=str(refresh))
            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@method_decorator(role_required(['ADMIN']), name='dispatch')
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
            # refresh = RefreshToken.for_user(user)
            response = Response({"msg": "User created", "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)
            # set_token_cookies(response, str(refresh.access_token))
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    @extend_schema(
        responses={
            200: inline_serializer(
                name='RefreshTokenResponse',
                fields={
                    'msg': serializers.CharField(),
                    'access': serializers.CharField(),
                }
            ),
            401: inline_serializer(
                name='TokenRefreshError',
                fields={'error': serializers.CharField()}
            )
        }
    )
    
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
 
        if not refresh_token:
            return Response({"error": "No refresh token found"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(refresh_token)
            access = refresh.access_token
            access["role"] = refresh["role"]
            access["tenant"] = refresh["tenant"]
            access["permissions"] = refresh["permissions"]
            response = Response({"msg": "Token refreshed", "access": str(access)})
            set_token_cookies(response, access=str(access)) 
            return response
        except TokenError:
            return Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
        # except TokenError as e:
        #     print(e)
        #     return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    @extend_schema(
        request=RefreshToken,
        description="Logout endpoint for users",
        responses={
            200: inline_serializer(
                name='LogoutResponse',
                fields={
                    'msg': serializers.CharField(),
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
        response = Response({"msg": "Logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        print("Logged out")
        return response


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=None,
        responses={
            200: UserSerializer,
                401: inline_serializer(
                    name='Unauthorized',
                    fields={
                        'error': serializers.CharField()
                    }
                )
        },
        description="Get current authenticated user profile data"
    )
    def get(self, request):
        """
        Returns the current authenticated user's profile data.
        """
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response(serializer.data,status=status.HTTP_200_OK)
        else:
            return Response({"msg": "User is not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        

class UserViewSet(viewsets.ModelViewSet):



    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = UserFilter
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        # يمكن فلترة بناءً على المستخدم الحالي إذا أردت مثلاً
        user = self.request.user
        if user.is_superuser:
            return User.objects.all()
        return User.objects.filter(id=user.id)


