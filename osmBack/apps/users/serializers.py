from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from core.utils.ReusableFields import ReusableFields
from core.utils.check_unique_field import check_unique_field
from .models import Role,Permission,RolePermission,User,ContactUs,TenantSettings ,Page, PageContent

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
    permission_name = serializers.CharField(source="permission.name", read_only=True)
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
        source='permissions' # هذا مهم، يربط الحقل بـ permissions model
    )

    class Meta:
        model = Role
        fields = ['id', 'name', 'permissions', 'permission_ids' , 'is_active','description']

# User Serializers
class UserSerializer(serializers.ModelSerializer):
    username = ReusableFields.username()
    email = ReusableFields.email()
    phone = ReusableFields.phone()
    password = ReusableFields.password()
    first_name = ReusableFields.first_name()
    last_name = ReusableFields.last_name()
    role = RoleSerializer(read_only=True)


    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role','phone','password', 'client', 'is_active', 'is_staff', 
            'is_deleted', 'deleted_at', 
        ]
        read_only_fields = ['id', 'deleted_at','client']

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


    def validate_username(self, value):
        return check_unique_field(User, 'username', value, self.instance)

    def validate_email(self, value):
        return check_unique_field(User, 'email', value, self.instance)

class RegisterSerializer(serializers.ModelSerializer):
    username = ReusableFields.username()
    email = ReusableFields.email()
    password = ReusableFields.password()
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), required=False)

    class Meta:
        model = User
        fields = [ 'id', 'username','password','email','role' ]
    
    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        # Assign role by ID if provided, otherwise fallback to 'GUEST' role
        role = validated_data.get('role', None)
        if not role:
            # Consider moving 'GUEST' to settings.DEFAULT_ROLE
            guest_role = Role.objects.filter(name='GUEST').first()
            if guest_role:
                user.role = guest_role
        else:
            user.role = role
        user.is_active = True
        user.save()
        return user
    
    def validate_username(self, value):
        return check_unique_field(User, 'username', value, self.instance)

    def validate_email(self, value):
        return check_unique_field(User, 'email', value, self.instance)
    

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")
        
        # Optimize: Don't check DB twice manually. authenticate() does it.
        # But here we want custom error msg "User does not exist" vs "Incorrect password"
        user_check = User.objects.filter(username=username).first()
        if user_check is None:
            raise serializers.ValidationError({"username": ["User does not exist."]})

        user = authenticate(username=username, password=password)
        if user is None:
            # Could be inactive or wrong password
            if user_check and not user_check.is_active:
                 raise serializers.ValidationError({"detail": ["User account is disabled."]})
            raise serializers.ValidationError({"password": ["Incorrect password."]})

        attrs['user'] = user
        return attrs



class PageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageContent
        fields = [
            'language', 'title','content',
            'seo_title', 'meta_description', 'meta_keywords'
        ]

class PageSerializer(serializers.ModelSerializer):
    translations = PageContentSerializer(many=True)
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = Page
        fields = [
            'id','default_language', 'is_published','slug','is_deleted','is_active',
             'created_at', 'updated_at', 'translations','author'
        ]

    def validate_slug(self, value):
        return check_unique_field(Page, 'slug', value, self.instance)

    def create(self, validated_data):
        translations_data = validated_data.pop('translations')
        page = Page.objects.create(**validated_data)
        
        for translation_data in translations_data:
            PageContent.objects.create(page=page, **translation_data)
        
        return page
    
    def update(self, instance, validated_data):
    
        translations_data = validated_data.pop('translations', [])
        
        # Standard serializer behavior: Update instance with validated_data
        # We don't need to manually filter fields if serializer definitions are correct.
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()

        # Update or create translations
        if translations_data:
            new_languages = {t.get('language') for t in translations_data if t.get('language')}
            
            # Use transaction atomic if possible
            instance.translations.exclude(language__in=new_languages).delete()
            
            for translation_data in translations_data:
                language = translation_data.get('language')
                if language:
                    PageContent.objects.update_or_create(
                        page=instance,
                        language=language,
                        defaults=translation_data
                    )
        
        instance.refresh_from_db()
        return instance

class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs  

        fields = '__all__'

class TenantSettingsSerializer(serializers.ModelSerializer):
    logo = serializers.ImageField(required=False, allow_null=True)
    class Meta:
        model = TenantSettings 

        fields = '__all__'


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
            raise serializers.ValidationError({"token": _("Invalid or expired token")})

        # Attach user for later use in view
        data["user"] = user
        return data
