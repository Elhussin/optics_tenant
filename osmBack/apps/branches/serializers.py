from rest_framework import serializers
from apps.branches.models import Branch, BranchUsers, Shift

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch_code']


class BranchUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = BranchUsers
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        # Basic logical check
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time.")
        return data
