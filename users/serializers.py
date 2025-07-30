from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.core.validators import RegexValidator, MinLengthValidator, MaxLengthValidator
from django.utils.translation import gettext_lazy as _
from core.permissions.roles import Role
from core.utils.ReusableFields import ReusableFields
from core.utils.check_unique_field import check_unique_field
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    # username = ReusableFields.username(read_only=True)
    username = ReusableFields.username()
    email = ReusableFields.email()
    phone = ReusableFields.phone()
    password = ReusableFields.password()
    first_name = ReusableFields.first_name()
    last_name = ReusableFields.last_name()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'role', 'password',
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



