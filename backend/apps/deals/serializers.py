from rest_framework import serializers
from .models import Stage, Deal, Task
from apps.companies.serializers import CompanySummarySerializer
from apps.users.serializers import UserSerializer


class StageSerializer(serializers.ModelSerializer):
    deals_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Stage
        fields = ['id', 'name', 'order', 'is_closed', 'is_won', 'default_probability', 
                 'deals_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_deals_count(self, obj):
        return obj.deals.count()


class DealListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    company_name = serializers.CharField(source='company.name', read_only=True)
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    stage_name = serializers.CharField(source='stage.name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    expected_value = serializers.ReadOnlyField()
    
    class Meta:
        model = Deal
        fields = ['id', 'title', 'company', 'company_name', 'owner', 'owner_name',
                 'stage', 'stage_name', 'amount_estimate', 'probability', 'expected_value',
                 'next_action_at', 'is_overdue', 'created_at', 'updated_at']


class DealDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual deal views"""
    company = CompanySummarySerializer(read_only=True)
    owner = UserSerializer(read_only=True)
    stage = StageSerializer(read_only=True)
    is_overdue = serializers.ReadOnlyField()
    expected_value = serializers.ReadOnlyField()
    
    # Nested related objects counts
    interactions_count = serializers.SerializerMethodField()
    documents_count = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Deal
        fields = ['id', 'title', 'company', 'owner', 'stage', 'amount_estimate',
                 'probability', 'expected_value', 'next_action_at', 'is_overdue',
                 'description', 'interactions_count', 'documents_count', 'tasks_count',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_interactions_count(self, obj):
        return obj.interactions.count()
    
    def get_documents_count(self, obj):
        return obj.documents.count()
    
    def get_tasks_count(self, obj):
        return obj.tasks.count()


class DealCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating deals"""
    
    class Meta:
        model = Deal
        fields = ['id', 'title', 'company', 'owner', 'stage', 'amount_estimate',
                 'probability', 'next_action_at', 'description']
        read_only_fields = ['id']
    
    def validate_probability(self, value):
        if value < 0 or value > 1:
            raise serializers.ValidationError("Probability must be between 0 and 1")
        return value


class TaskSerializer(serializers.ModelSerializer):
    deal_title = serializers.CharField(source='deal.title', read_only=True)
    assignee_name = serializers.CharField(source='assignee.full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Task
        fields = ['id', 'deal', 'deal_title', 'title', 'description', 'due_at',
                 'status', 'assignee', 'assignee_name', 'created_by', 'created_by_name',
                 'is_overdue', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class KanbanDealSerializer(serializers.ModelSerializer):
    """Compact serializer for kanban view"""
    company_name = serializers.CharField(source='company.name', read_only=True)
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Deal
        fields = ['id', 'title', 'company_name', 'owner_name', 'amount_estimate',
                 'probability', 'next_action_at', 'is_overdue']