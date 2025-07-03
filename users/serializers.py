from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'is_superuser',
            'role',
            'password'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'username': {'required': True, 'allow_blank': False},
            'email': {'required': True, 'allow_blank': False},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
        }


    def create(self, validated_data):
        """
        Create and return a new user.
        """
        user = User(email=validated_data['email'], username=validated_data['username'])
        user.set_password(validated_data['password'])
        user.save()
        return user


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
    write_only=True,
    min_length=8,
    validators=[
        RegexValidator(
            regex=r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$',
            message=_("Password must contain at least one uppercase, one lowercase letter, one number.")
        )
    ],
    error_messages={
        "required": _("Password is required."),
        "blank": _("Password cannot be blank."),
    }
    )

    
    username = serializers.CharField(
        error_messages={
            "required": _("Username is required."),
            "blank": _("Username cannot be blank.")
        }
    )

    email = serializers.EmailField(
        error_messages={
            "required": _("Email is required."),
            "blank": _("Email cannot be blank."),
            "invalid": _("Enter a valid email address.")
        }
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'is_superuser',
            'role',
            'password'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(_("A user with this username already exists."))
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(_("A user with this email already exists."))
        return value

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



