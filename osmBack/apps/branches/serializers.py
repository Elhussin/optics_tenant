from rest_framework import serializers
from apps.branches.models import Branch, BranchUsers, Shift


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch_code']

class BranchUsersSerializer(serializers.ModelSerializer):
    branch__name = serializers.CharField(source='branch.name', read_only=True)
    employee__name = serializers.CharField(source='employee.user.username', read_only=True)
    class Meta:
        model = BranchUsers
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at','branch','branch_name','employee','employee_name','is_active']

class ShiftSerializer(serializers.ModelSerializer):
    branch__name = serializers.CharField(source='branch.name', read_only=True)
    employee__user__username = serializers.CharField(source='employee.user.username', read_only=True)
    class Meta:
        model = Shift
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        start = data.get('start_time')
        end = data.get('end_time')

        # If partial update, we might not have both. We should check instance if data missing.
        if self.instance and not start:
            start = self.instance.start_time
        if self.instance and not end:
            end = self.instance.end_time

        if start and end and start >= end:
            raise serializers.ValidationError(
                "End time must be after start time.")
        return data
