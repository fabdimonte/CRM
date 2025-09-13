from rest_framework import serializers
from .models import Company, Contact


class ContactSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = Contact
        fields = ['id', 'company', 'company_name', 'first_name', 'last_name', 'full_name',
                 'email', 'phone', 'role', 'seniority', 'linkedin_url', 'notes',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContactSummarySerializer(serializers.ModelSerializer):
    """Lightweight contact serializer for nested representations"""
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Contact
        fields = ['id', 'full_name', 'email', 'role']


class CompanySerializer(serializers.ModelSerializer):
    contacts_count = serializers.ReadOnlyField()
    deals_count = serializers.ReadOnlyField()
    contacts = ContactSummarySerializer(many=True, read_only=True)
    
    class Meta:
        model = Company
        fields = ['id', 'name', 'legal_id', 'country', 'website', 'sector', 'size',
                 'notes', 'contacts_count', 'deals_count', 'contacts',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CompanySummarySerializer(serializers.ModelSerializer):
    """Lightweight company serializer for nested representations"""
    
    class Meta:
        model = Company
        fields = ['id', 'name', 'sector', 'country']