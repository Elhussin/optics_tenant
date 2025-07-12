from rest_framework import serializers
from .models import (
    Customer, CustomerGroup, Opportunity, Interaction, 
    Complaint, Subscription, Task,Campaign,Document
)

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id', 'phone', 'address_line1', 'address_line2', 
            'city', 'postal_code', 'first_name',
            'last_name', 'email', 'identification_number',
             'customer_type', 'customer_since', 'is_vip', 
             'loyalty_points', 'accepts_marketing', 'registration_number',
              'tax_number', 'preferred_contact', 'website',
               'description'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class InteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interaction
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class OpportunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class CustomerGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerGroup
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']



