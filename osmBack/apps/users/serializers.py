from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from core.utils.ReusableFields import ReusableFields
from core.utils.check_unique_field import check_unique_field
from .models import Role, Permission, RolePermission, User

from django.db import connection
User = get_user_model()


class HealthResponseSerializer(serializers.Serializer):
    """
    Serializer for health check response.
    """
    status = serializers.CharField()


# Role and Permission Serializers
class RolePermissionSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source="role.name", read_only=True)
    permission_name = serializers.CharField(
        source="permission.code", read_only=True)

    class Meta:
        model = RolePermission
        fields = ['id', 'role', 'permission', 'role_name', 'permission_name']


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'code', 'description']


class RoleSerializer(serializers.ModelSerializer):
    # للعرض (GET) - يظهر التفاصيل الكاملة
    permissions = PermissionSerializer(many=True, read_only=True)
    # للكتابة (POST/PUT) - يقبل قائمة IDs
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Permission.objects.all(),
        source='permissions'  # هذا مهم، يربط الحقل بـ permissions model
    )

    class Meta:
        model = Role
        fields = ['id', 'name', 'permissions',
                  'permission_ids', 'is_active', 'description']

# User Serializers


class UserSerializer(serializers.ModelSerializer):
    username = ReusableFields.username()
    email = ReusableFields.email()
    phone = ReusableFields.phone()
    password = ReusableFields.password()
    first_name = ReusableFields.first_name()
    last_name = ReusableFields.last_name()
    roles = RoleSerializer(many=True, read_only=True)
    role_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Role.objects.all(),
        source='roles',
        required=False
    )
    # tenant_settings = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'roles', 'role_ids', 'phone', 'password', 'client', 'is_active', 'is_staff','is_superuser',
            'is_deleted', 'deleted_at',
        ]
        read_only_fields = ['id', 'deleted_at', 'client']

    # def get_tenant_settings(self, obj):
    #     if obj.client and hasattr(obj.client, 'tenantsettings'):
    #         return TenantSettingsSerializer(obj.client.tenantsettings).data
    #     return None

    def create(self, validated_data):
        from django.db import connection
        from apps.tenants.models import Client

        # Auto-assign client based on active tenant schema
        schema_name = connection.schema_name
        if schema_name != 'public':
            try:
                client = Client.objects.get(schema_name=schema_name)
                validated_data['client'] = client
            except Client.DoesNotExist:
                pass

        password = validated_data.pop("password")
        roles = validated_data.pop("roles", [])
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        if roles:
            user.roles.set(roles)
        return user

    def update(self, instance, validated_data):
        if "password" in validated_data:
            password = validated_data.pop("password")
            instance.set_password(password)

        roles = validated_data.pop("roles", None)
        user = super().update(instance, validated_data)

        if roles is not None:
            user.roles.set(roles)

        return user

    def validate_username(self, value):
        return check_unique_field(User, 'username', value, self.instance)

    def validate_email(self, value):
        return check_unique_field(User, 'email', value, self.instance)


class RegisterSerializer(serializers.ModelSerializer):
    username = ReusableFields.username()
    email = ReusableFields.email()
    password = ReusableFields.password()
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']

    def create(self, validated_data):
        from django.db import connection
        from apps.tenants.models import Client

        # Auto-assign client based on active tenant schema
        schema_name = connection.schema_name
        if schema_name != 'public':
            try:
                client = Client.objects.get(schema_name=schema_name)
                validated_data['client'] = client
            except Client.DoesNotExist:
                pass

        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = True
        user.save()

        # Always assign default guest role on registration
        guest_role, created = Role.objects.get_or_create(name='GUEST')
        user.roles.add(guest_role)

        return user

    def validate_username(self, value):
        return check_unique_field(User, 'username', value, self.instance)

    def validate_email(self, value):
        return check_unique_field(User, 'email', value, self.instance)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(label=_("Username or Email"))
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        # Support login by email or username
        user = None

        # 1. Try to fetch user by email or username
        from django.db.models import Q
        user_obj = User.objects.filter(
            Q(username=username) | Q(email=username)
        ).first()

        if user_obj:
            # 2. Authenticate using the username found (even if email was provided)
            # authenticate() usually expects the actual 'username' field of the model
            user = authenticate(username=user_obj.username, password=password)

        # 3. Security: Use generic error message to prevent enumeration attacks
        # "Invalid credentials" is better than telling "User does not exist"
        if user is None:
            # Check for inactive user specifically if you want, or just generic error
            if user_obj and not user_obj.is_active:
                raise serializers.ValidationError(
                    {"detail": [str(_("User account is disabled"))]})

            raise serializers.ValidationError(
                {"detail": [str(_("Invalid credentials"))]})

        attrs['user'] = user
        return attrs





class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)
    new_password = ReusableFields.password()

    def validate(self, data):
        uid = data.get("uid")
        token = data.get("token")
        password = data.get("new_password")

        try:
            from django.utils.encoding import force_str
            from django.utils.http import urlsafe_base64_decode
            from django.contrib.auth.tokens import default_token_generator

            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except Exception:
            raise serializers.ValidationError({"uid": _("Invalid UID")})

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError(
                {"token": _("Invalid or expired token")})

        # Attach user for later use in view
        data["user"] = user
        return data
