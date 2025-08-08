from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,serializers
from .serializers import RegisterSerializer, LoginSerializer,UserSerializer,ContactUsSerializer, PageSerializer, PageContentSerializer,TenantSettings
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.permissions import AllowAny
from rest_framework import viewsets
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema , inline_serializer
from django.db import connection
from core.utils.set_token import set_token_cookies
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from core.permissions.permissions import ROLE_PERMISSIONS
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str, force_bytes
from .models import Permission, RolePermission ,Role, Page, PageContent, ContactUs,TenantSettings
from django.core.exceptions import PermissionDenied
from .serializers import PermissionSerializer, RolePermissionSerializer, RoleSerializer,TenantSettingsSerializer
from .filters import UserFilter
from core.utils.email import send_password_reset_email
from rest_framework.decorators import action
User = get_user_model()

# @method_decorator(role_required(['ADMIN']), name='dispatch')
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
        
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_deleted=False)
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = UserFilter
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return User.objects.all()
        return User.objects.filter(id=user.id)

class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]
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
        email = request.data.get('email')
        tenant = request.headers.get('X-Tenant')

        if not tenant:
            return Response({"detail": "Missing X-Tenant header."}, status=400)

        # تحقق من صحة tenant إذا لزم الأمر (اختياري)
        try:
            tenant_obj = Client.objects.get(schema_name=tenant)
        except Client.DoesNotExist:
            return Response({"detail": "Invalid tenant."}, status=400)

        user = User.objects.filter(email=email).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            protocol = "https" if not settings.DEBUG else "http"
            port = ":3000" if settings.DEBUG else ""
            reset_url = f"{protocol}://{tenant}.{settings.TENANT_BASE_DOMAIN}{port}/auth/forgot-password/?uid={uid}&token={token}"
            send_password_reset_email(email, reset_url)

        return Response({"detail": "If the email exists, a reset link has been sent."}, status=200)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid UID"}, status=400)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token"}, status=400)

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

    
class ContactViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = ContactUs.objects.all()
    serializer_class = ContactUsSerializer



class TenantSettingsViewset(viewsets.ModelViewSet):
    queryset = TenantSettings.objects.all()
    serializer_class = TenantSettingsSerializer


from rest_framework import permissions
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
    
class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsAuthenticated(), IsOwnerOrReadOnly()]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Show only published pages to anonymous users
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(status=Page.PUBLISHED)
        # Show own pages + published pages to authenticated users
        elif not self.request.user.is_staff:
            queryset = queryset.filter(
                models.Q(status=Page.PUBLISHED) | 
                models.Q(author=self.request.user)
            )
        return queryset

    @action(detail=True, methods=['get'])
    def content(self, request, slug=None):
        """Get page content for a specific language"""
        page = self.get_object()
        language = request.query_params.get('lang', settings.LANGUAGE_CODE)
        
        try:
            content = page.translations.get(language=language)
            serializer = PageContentSerializer(content)
            return Response(serializer.data)
        except PageContent.DoesNotExist:
            return Response(
                {'error': f'Content not available in language: {language}'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def add_translation(self, request, slug=None):
        """Add translation for a page"""
        page = self.get_object()
        self.check_object_permissions(request, page)
        
        serializer = PageContentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(page=page)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PageContentViewSet(viewsets.ModelViewSet):
    queryset = PageContent.objects.all()
    serializer_class = PageContentSerializer

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        slug = self.request.query_params.get('slug')
        lang = self.request.query_params.get('lang')

        # Filter by published pages for anonymous users
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(page__status=Page.PUBLISHED)

        if slug:
            queryset = queryset.filter(page__slug=slug)
        if lang:
            queryset = queryset.filter(language=lang)

        return queryset

    def perform_create(self, serializer):
        # Ensure user owns the page they're adding content to
        page = serializer.validated_data['page']
        if page.author != self.request.user:
            raise serializers.ValidationError("You can only add content to your own pages.")
        serializer.save()

    def perform_update(self, serializer):
        # Ensure user owns the page they're updating content for
        page = serializer.validated_data.get('page', serializer.instance.page)
        if page.author != self.request.user:
            raise serializers.ValidationError("You can only update content of your own pages.")
        serializer.save()