from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from slugify import slugify
# from core.permissions.roles import Role
from core.utils.ReusableFields import ReusableFields
from core.utils.check_unique_field import check_unique_field
from .models import Role,Permission,RolePermission,User,ContactUs,TenantSettings ,Page, PageContent
from django.utils.text import slugify

User = get_user_model()

# Role and Permission Serializers
class RolePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolePermission
        fields = '__all__'

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'code', 'description']

class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)

    class Meta:
        model = Role
        fields = ['id', 'name', 'permissions']

# User Serializers
class UserSerializer(serializers.ModelSerializer):
    username = ReusableFields.username()
    email = ReusableFields.email()
    phone = ReusableFields.phone()
    password = ReusableFields.password()
    first_name = ReusableFields.first_name()
    last_name = ReusableFields.last_name()
    role = RoleSerializer(read_only=True)  # عرض البيانات كاملة
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        source='role',
        write_only=True  # لقبول الإدخال بالـ ID
    )
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role_id', 'is_active', 'is_staff', 'role', 'password',
            'is_deleted', 'deleted_at', 'phone', 'client'
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

    class Meta:
        model = User
        fields = [ 'id', 'username','password','email' ]
    
    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.role = Role.CUSTOMER   
        user.is_active = True
        user.save()
        return user

    def validate_email(self, value):
        return check_unique_field(User, 'email', value, self.instance)

    
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


        user = User.objects.filter(username=username).first()
        if user is None:
            raise serializers.ValidationError({"username": ["User does not exist."]})

     
        user = authenticate(username=username, password=password)
        if user is None:
            raise serializers.ValidationError({"password": ["Incorrect password."]})
        

        attrs['user'] = user
        return attrs

class PageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageContent
        fields = [
            'language', 'title',  'content',
            'seo_title', 'meta_description', 'meta_keywords'
        ]


class PageSerializer(serializers.ModelSerializer):
    translations = PageContentSerializer(many=True)
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Page
        fields = [
            'id', 'default_language', 'is_published','slug',
            'created_at', 'updated_at', 'translations', 'author'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        translations_data = validated_data.pop('translations')
        page = Page.objects.create(**validated_data)  # author بيتضاف أوتوماتيك
        for translation_data in translations_data:
            PageContent.objects.create(page=page, **translation_data)
        return page

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', [])

        # Update page fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update translations
        for translation_data in translations_data:
            language = translation_data.get('language')
            translation, created = PageContent.objects.get_or_create(
                page=instance,
                language=language,
                defaults=translation_data
            )
            if not created:
                for attr, value in translation_data.items():
                    if value is not None:  # ما نكتبش قيم فاضية فوق القديمة
                        setattr(translation, attr, value)
                translation.save()

        return instance



class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs  

        fields = ['email', 'phone', 'name', 'message']

class TenantSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantSettings 
        
        fields = '__all__'