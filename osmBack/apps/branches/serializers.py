from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.branches.models import Branch, BranchUsers, Shift, BranchShiftTemplate


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch_code']
        extra_kwargs = {
            'name': {
                'error_messages': {
                    'required': _('Branch name is required'),
                    'blank': _('Branch name cannot be blank'),
                    'unique': _('A branch with this name already exists'),
                }
            },
            'branch_type': {
                'error_messages': {
                    'required': _('Branch type is required'),
                }
            },
        }


class BranchUsersSerializer(serializers.ModelSerializer):
    branch__name = serializers.CharField(source='branch.name', read_only=True)
    employee__name = serializers.CharField(
        source='employee.user.username', read_only=True)

    class Meta:
        model = BranchUsers
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at',
                            'branch_name', 'employee_name', 'is_active']
        extra_kwargs = {
            'branch': {
                'error_messages': {
                    'required': _('Branch is required'),
                    'does_not_exist': _('The specified branch does not exist'),
                }
            },
            'employee': {
                'error_messages': {
                    'required': _('Employee is required'),
                    'does_not_exist': _('The specified employee does not exist'),
                }
            },
        }


class BranchShiftTemplateSerializer(serializers.ModelSerializer):
    branch__name = serializers.CharField(source='branch.name', read_only=True)

    class Meta:
        model = BranchShiftTemplate
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ShiftSerializer(serializers.ModelSerializer):
    branch__name = serializers.CharField(source='branch.name', read_only=True)
    employee__user__username = serializers.CharField(
        source='employee.user.username', read_only=True)
    shift_template__name = serializers.CharField(
        source='shift_template.name', read_only=True)

    class Meta:
        model = Shift
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'branch': {
                'error_messages': {
                    'required': _('Branch is required'),
                }
            },
            'employee': {
                'error_messages': {
                    'required': _('Employee is required'),
                }
            },
            'start_time': {
                'error_messages': {
                    'required': _('Start time is required'),
                    'invalid': _('Enter a valid start time'),
                }
            },
            'end_time': {
                'error_messages': {
                    'required': _('End time is required'),
                    'invalid': _('Enter a valid end time'),
                }
            },
        }

    def validate(self, data):
        """التحقق من صحة أوقات الوردية"""
        start = data.get('start_time')
        end = data.get('end_time')

        # If partial update, we might not have both. We should check instance if data missing.
        if self.instance and not start:
            start = self.instance.start_time
        if self.instance and not end:
            end = self.instance.end_time

        if start and end and start >= end:
            raise serializers.ValidationError({
                'end_time': _('End time must be after start time')
            })

        return data
