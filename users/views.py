from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.permissions import AllowAny
from rest_framework import viewsets
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema , inline_serializer
from django.db import connection
from core.utils.set_token import set_token_cookies
from django.conf import settings
from core.permissions.permissions import ROLE_PERMISSIONS
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str, force_bytes
from .models import Role,Permission,RolePermission,User,ContactUs,TenantSettings ,Page, PageContent
from .serializers import (PermissionSerializer, RolePermissionSerializer, RoleSerializer,
                          TenantSettingsSerializer,RegisterSerializer, LoginSerializer,
                          UserSerializer,ContactUsSerializer, PageSerializer, PageContentSerializer,PasswordResetConfirmSerializer,
                         TenantSettings)
from tenants.models import Client
from rest_framework import permissions
from .filters import UserFilter
from core.utils.email import send_password_reset_email
from rest_framework.decorators import action
from core.permissions.decorators import permission_required,role_required
from django.utils.decorators import method_decorator

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]
    @extend_schema(
        request=RegisterSerializer,
        responses={200: inline_serializer(
            name='RegisterSuccessResponse',
            fields={'msg': serializers.CharField(),
                    'user': UserSerializer()}
        )},
        description="Register endpoint for users"
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            response = Response({"msg": "User created", "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)
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
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']

            if not user.is_active:
                return Response({"detail": "User account is disabled."}, status=status.HTTP_403_FORBIDDEN)
            role = user.role
            if user.role:
                permissions = user.role.permissions.all()
            else:
                permissions = Permission.objects.none()

            refresh = RefreshToken.for_user(user)
            refresh["role_id"] = user.role.id if user.role else None
            refresh["role"] = user.role.name if user.role else None
            refresh["tenant"] = connection.schema_name
            refresh["permissions"] = list(permissions.values_list('code', flat=True))

            response = Response({"msg": "Login successful"})
            set_token_cookies(response, access=str(refresh.access_token), refresh=str(refresh))
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

            # get user permissions from database
            user_id = refresh["user_id"]
            user = User.objects.get(id=user_id)
            if user.role:
                permissions = user.role.permissions.all()
            else:
                permissions = Permission.objects.none()

            access["role_id"] = user.role.id if user.role else None
            access["role"] = user.role.name if user.role else None
            access["tenant"] = refresh["tenant"]
            access["permissions"] = list(permissions.values_list('code', flat=True))

            response = Response({"msg": "Token refreshed", "access": str(access)})
            set_token_cookies(response, access=str(access))
            return response

        except TokenError:
            return Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

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

class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]
    from tenants.models import Client
    @extend_schema(
        request=serializers.EmailField(),
        responses={
            200: inline_serializer(
                name='PasswordResetSuccessResponse',
                fields={'detail': serializers.CharField()}
            ),
            400: inline_serializer(
                name='PasswordResetBadRequest',
                fields={'email': serializers.ListField(child=serializers.CharField(), required=False)}
            ),
        },
        description="Request password reset"
    )


    def post(self, request):
        email = request.data.get('data', {}).get('email')

        if not email:
            return Response({"detail": "Email is required."}, status=400)

        tenant = request.headers.get('X-Tenant')
        leng=request.headers.get('accept-language')or 'en'
        print(tenant,leng)

        if not tenant:
            return Response({"detail": "Missing X-Tenant header."}, status=400)

        # تحقق من صحة tenant إذا لزم الأمر (اختياري)
        try:
            tenant_obj = Client.objects.get(schema_name=tenant,is_active=True)
        except Client.DoesNotExist:
            return Response({"detail": "Invalid tenant."}, status=400)

        user = User.objects.filter(email=email).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            protocol = "https" if not settings.DEBUG else "http"
            port = ":3000" if settings.DEBUG else ""
            addTenant=f"{tenant}." if tenant !="public" else ""
            if user.is_active:
                reset_url = f"{protocol}://{addTenant}{settings.TENANT_BASE_DOMAIN}{port}/{leng}/auth/reset-password/?uid={uid}&token={token}"
                send_password_reset_email(email, reset_url)

        return Response({"detail": "If the email exists, a reset link has been sent."}, status=200)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        password = serializer.validated_data["password"]

        user.set_password(password)
        user.save()

        return Response({"detail": "Password has been reset successfully"}, status=200)

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

# @method_decorator(role_required(['ADMIN']), name='dispatch')
@method_decorator(permission_required('create_permission'), name='dispatch')
@method_decorator(role_required(['ADMIN','TECHNICIAN','OWNER']), name='dispatch')
class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]

class RolePermissionViewSet(viewsets.ModelViewSet):
    queryset = RolePermission.objects.all()
    serializer_class = RolePermissionSerializer
    permission_classes = [IsAuthenticated]

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

# class UserViewSet(viewsets.ModelViewSet):
#     # is_deleted=False
#     queryset = User.objects.filter()
#     serializer_class = UserSerializer
#     filter_backends = [DjangoFilterBackend]
#     filterset_class = UserFilter
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         if user.is_superuser:
#             return User.objects.all()
#         return User.objects.filter(id=user.id)




from rest_framework.decorators import action
from rest_framework.response import Response

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = UserFilter
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return User.objects.all()
        return User.objects.filter(id=user.id)


    @action(detail=False, methods=["get"])
    def filter_options(self, request):
        roles = User.objects.values_list('role', flat=True).distinct()
        emails = User.objects.values_list('email', flat=True).distinct()
        phones = User.objects.values_list('phone', flat=True).distinct()
        usernames = User.objects.values_list('username', flat=True).distinct()

        return Response({
            "roles": list(filter(None, roles)),
            "emails": list(filter(None, emails)),
            "phones": list(filter(None, phones)),
            "usernames": list(filter(None, usernames)),
        })



class ContactUsViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = ContactUs.objects.all()
    serializer_class = ContactUsSerializer

class TenantSettingsViewset(viewsets.ModelViewSet):
    queryset = TenantSettings.objects.all()
    serializer_class = TenantSettingsSerializer
    permission_classes = [IsAuthenticated]

class PublicPageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    For public pages only
    """
    queryset = Page.objects.filter(is_published=True, is_deleted=False)
    serializer_class = PageSerializer
    lookup_field = "slug"
    permission_classes = [AllowAny]



@method_decorator(role_required(['ADMIN','TECHNICIAN','OWNER']), name='dispatch')
@method_decorator(permission_required(['create_page']), name='dispatch')
class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer


    def get_permissions(self):
        return [IsAuthenticated(), IsOwnerOrReadOnly()]


    def update(self, request, *args, **kwargs):
        data = request.data
        if 'formData' in data:
            data = data['formData']

        # Remove read-only fields that shouldn't be in update
        read_only_fields = ['id', 'created_at', 'updated_at', 'slug', 'author']
        clean_data = {k: v for k, v in data.items() if k not in read_only_fields}

        print("Clean data for serializer:", clean_data)

        # Create a new request data object with clean data
        request._full_data = clean_data

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=clean_data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners to edit their pages.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions only to the owner
        return obj.author == request.user
