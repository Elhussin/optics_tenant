from rest_framework import serializers
from django.contrib.auth import get_user_model
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
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'username': {'required': True, 'allow_blank': False},
            'email': {'required': True, 'allow_blank': False},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
        }