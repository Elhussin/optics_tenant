from rest_framework import serializers
from .models import (
    Customer, CustomerGroup, Opportunity, Interaction,
    Complaint, Subscription, Task, Campaign, Document, Contact
)
from django.contrib.auth import get_user_model


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id', 'phone', 'identification_number',
            'first_name',
            'last_name', 'email',
            'customer_type', 'is_vip',
            'accepts_marketing', 'registration_number',
            'tax_number', 'preferred_contact', 'website',
            'description',
            'address_line1', 'address_line2',
            'city', 'postal_code', 'is_active', 'is_deleted'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

        extra_kwargs = {
            'phone': {
                'error_messages': {
                    'required': 'Phone number is required.',
                    'blank': 'Please enter a valid phone number.'
                }
            },
            'email': {
                'error_messages': {
                    'required': 'Email is required.',
                    'blank': 'Please enter a valid email address.'
                }
            },
            'identification_number': {
                'error_messages': {
                    'required': 'Identification number is required.',
                    'blank': 'Please enter a valid identification number.'
                }
            },
            'customer_type': {
                'error_messages': {
                    'required': 'Customer type is required.',
                    'blank': 'Please select a valid customer type.'
                }
            },
            'first_name': {
                'error_messages': {
                    'required': 'First name is required.',
                    'blank': 'Please enter a valid first name.'
                }
            },
            'last_name': {
                'error_messages': {
                    'required': 'Last name is required.',
                    'blank': 'Please enter a valid last name.'
                }
            },
        }


class InteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interaction
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class OpportunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerGroup
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']
