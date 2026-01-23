from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from core.utils.ReusableFields import ReusableFields
from apps.crm.models import (
    Customer, CustomerGroup, Opportunity, Interaction,
    Complaint, Subscription, Task, Campaign, Document, Contact
)
from django.contrib.auth import get_user_model


class CustomerSerializer(serializers.ModelSerializer):
    # استخدام ReusableFields للحقول الأساسية
    phone = ReusableFields.phone(required=True)
    email = ReusableFields.email(required=False)
    first_name = ReusableFields.first_name(required=True)
    last_name = ReusableFields.last_name(required=True)

    class Meta:
        model = Customer
        fields = [
            'id', 'phone', 'identification_number',
            'first_name', 'last_name', 'email',
            'customer_type', 'is_vip',
            'accepts_marketing', 'registration_number',
            'tax_number', 'preferred_contact', 'website',
            'description',
            'address_line1', 'address_line2',
            'city', 'postal_code', 'is_active', 'is_deleted'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
        extra_kwargs = {
            'identification_number': {
                'error_messages': {
                    'required': str(_("Identification number is required")),
                    'blank': str(_("Identification number cannot be blank")),
                }
            },
            'customer_type': {
                'error_messages': {
                    'required': str(_("Customer type is required")),
                    'invalid_choice': str(_("Invalid customer type")),
                }
            },
        }

    def validate_identification_number(self, value):
        """التحقق من رقم الهوية"""
        if not value:
            return value

        # التحقق من عدم التكرار
        queryset = Customer.objects.filter(identification_number=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                _("Customer with this identification number already exists")
            )
        return value

    def validate(self, data):
        """التحقق من البيانات"""
        # التحقق من وجود phone أو email على الأقل
        phone = data.get('phone') or (
            self.instance.phone if self.instance else None)
        email = data.get('email') or (
            self.instance.email if self.instance else None)

        if not phone and not email:
            raise serializers.ValidationError(
                _("Customer must have at least phone or email")
            )

        return data


class InteractionSerializer(serializers.ModelSerializer):
    customer__first_name = serializers.CharField(
        source='customer.first_name', read_only=True)

    class Meta:
        model = Interaction
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'customer': {
                'error_messages': {
                    'required': _('Customer is required'),
                    'does_not_exist': _('The specified customer does not exist'),
                }
            },
            'interaction_type': {
                'error_messages': {
                    'required': _('Interaction type is required'),
                }
            },
        }


class ComplaintSerializer(serializers.ModelSerializer):
    customer__first_name = serializers.CharField(
        source='customer.first_name', read_only=True)

    class Meta:
        model = Complaint
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'customer': {
                'error_messages': {
                    'required': _('Customer is required'),
                    'does_not_exist': _('The specified customer does not exist'),
                }
            },
            'subject': {
                'error_messages': {
                    'required': _('Subject is required'),
                    'blank': _('Subject cannot be blank'),
                }
            },
        }


class OpportunitySerializer(serializers.ModelSerializer):
    customer__first_name = serializers.CharField(
        source='customer.first_name', read_only=True)

    class Meta:
        model = Opportunity
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'customer': {
                'error_messages': {
                    'required': _('Customer is required'),
                    'does_not_exist': _('The specified customer does not exist'),
                }
            },
            'title': {
                'error_messages': {
                    'required': _('Title is required'),
                    'blank': _('Title cannot be blank'),
                }
            },
        }


class TaskSerializer(serializers.ModelSerializer):
    customer__first_name = serializers.CharField(
        source='customer.first_name', read_only=True)

    class Meta:
        model = Task
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'title': {
                'error_messages': {
                    'required': _('Title is required'),
                    'blank': _('Title cannot be blank'),
                }
            },
            'due_date': {
                'error_messages': {
                    'invalid': _('Enter a valid due date'),
                }
            },
        }


class CampaignSerializer(serializers.ModelSerializer):
    customer__first_name = serializers.CharField(
        source='customer.first_name', read_only=True)

    class Meta:
        model = Campaign
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'name': {
                'error_messages': {
                    'required': _('Campaign name is required'),
                    'blank': _('Campaign name cannot be blank'),
                }
            },
        }


class DocumentSerializer(serializers.ModelSerializer):
    customer__first_name = serializers.CharField(
        source='customer.first_name', read_only=True)

    class Meta:
        model = Document
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'customer': {
                'error_messages': {
                    'required': _('Customer is required'),
                    'does_not_exist': _('The specified customer does not exist'),
                }
            },
            'title': {
                'error_messages': {
                    'required': _('Document title is required'),
                    'blank': _('Document title cannot be blank'),
                }
            },
        }


class SubscriptionSerializer(serializers.ModelSerializer):
    customer__first_name = serializers.CharField(
        source='customer.first_name', read_only=True)

    class Meta:
        model = Subscription
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'customer': {
                'error_messages': {
                    'required': _('Customer is required'),
                    'does_not_exist': _('The specified customer does not exist'),
                }
            },
        }


class CustomerGroupSerializer(serializers.ModelSerializer):
    customer__first_name = serializers.StringRelatedField(
        many=True, source='customers', read_only=True)

    class Meta:
        model = CustomerGroup
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'name': {
                'error_messages': {
                    'required': _('Group name is required'),
                    'blank': _('Group name cannot be blank'),
                }
            },
        }


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'name': {
                'error_messages': {
                    'required': _('Contact name is required'),
                    'blank': _('Contact name cannot be blank'),
                }
            },
        }
