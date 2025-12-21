from rest_framework import serializers
from apps.branches.models import Branch, BranchUsers, Shift


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch_code']


class BranchUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = BranchUsers
        exclude = ['is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ShiftSerializer(serializers.ModelSerializer):
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
