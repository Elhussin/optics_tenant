from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from slugify import slugify
from core.permissions.roles import Role
from core.utils.ReusableFields import ReusableFields
from core.utils.check_unique_field import check_unique_field
from .models import Permission, RolePermission ,Role, Page, PageContent ,ContactUs,TenantSettings
from django.utils.text import slugify

User = get_user_model()


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
            'id', 'page', 'language', 'title', 'content',
            'seo_title', 'meta_description', 'meta_keywords',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PageSerializer(serializers.ModelSerializer):
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())
    translations = PageContentSerializer(many=True, read_only=True)
    slug = serializers.SlugField(
        max_length=50,
        error_messages={
            'blank': 'This field may not be blank.',
            'max_length': 'Ensure this field has no more than 50 characters.'
        }
    )

    class Meta:
        model = Page
        fields = ['id', 'slug', 'author', 'status', 'translations', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def validate_slug(self, value):
        return slugify(value)

    def validate(self, attrs):
        # Ensure slug is unique
        slug = attrs.get('slug')
        if slug:
            instance_id = self.instance.id if self.instance else None
            if Page.objects.filter(slug=slug).exclude(id=instance_id).exists():
                raise serializers.ValidationError({'slug': 'Page with this slug already exists.'})
        return attrs








class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs  

        fields = ['email', 'phone', 'name', 'message']




class TenantSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantSettings 
        
        fields = '__all__'