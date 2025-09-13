from rest_framework import serializers
from .models import Interaction
from apps.users.serializers import UserSerializer
from apps.companies.serializers import CompanySummarySerializer, ContactSummarySerializer


class InteractionSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    deal_title = serializers.CharField(source='deal.title', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    contact_name = serializers.CharField(source='contact.full_name', read_only=True)
    related_entity = serializers.ReadOnlyField()
    
    class Meta:
        model = Interaction
        fields = ['id', 'deal', 'deal_title', 'company', 'company_name', 
                 'contact', 'contact_name', 'type', 'subject', 'body', 
                 'occurred_at', 'author', 'author_name', 'related_entity',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        # Ensure interaction is associated with at least one entity
        if not attrs.get('deal') and not attrs.get('company') and not attrs.get('contact'):
            raise serializers.ValidationError(
                "Interaction must be associated with either a deal or company/contact"
            )
        return attrs


class InteractionDetailSerializer(InteractionSerializer):
    """Detailed serializer with nested related objects"""
    author = UserSerializer(read_only=True)
    company = CompanySummarySerializer(read_only=True)
    contact = ContactSummarySerializer(read_only=True)
    
    class Meta(InteractionSerializer.Meta):
        fields = InteractionSerializer.Meta.fields


class InteractionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating interactions"""
    
    class Meta:
        model = Interaction
        fields = ['deal', 'company', 'contact', 'type', 'subject', 'body', 'occurred_at']
    
    def validate(self, attrs):
        # Ensure interaction is associated with at least one entity
        if not attrs.get('deal') and not attrs.get('company') and not attrs.get('contact'):
            raise serializers.ValidationError(
                "Interaction must be associated with either a deal or company/contact"
            )
        return attrs