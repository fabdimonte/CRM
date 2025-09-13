from rest_framework import serializers
from .models import Document, NDA
from apps.users.serializers import UserSerializer


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    deal_title = serializers.CharField(source='deal.title', read_only=True)
    size_human = serializers.ReadOnlyField()
    file_extension = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'deal', 'deal_title', 'filename', 'file', 'file_url', 
                 'size', 'size_human', 'content_type', 'file_extension',
                 'uploaded_by', 'uploaded_by_name', 'uploaded_at']
        read_only_fields = ['id', 'size', 'content_type', 'uploaded_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class DocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer for file uploads"""
    
    class Meta:
        model = Document
        fields = ['deal', 'file']
    
    def validate_file(self, value):
        # Add file size validation (10MB limit)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError("File size cannot exceed 10MB")
        
        # Add file type validation if needed
        allowed_extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt']
        file_extension = value.name.lower().split('.')[-1]
        if f'.{file_extension}' not in allowed_extensions:
            raise serializers.ValidationError(
                f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        return value


class NDASerializer(serializers.ModelSerializer):
    deal_title = serializers.CharField(source='deal.title', read_only=True)
    file_details = DocumentSerializer(source='file', read_only=True)
    
    class Meta:
        model = NDA
        fields = ['id', 'deal', 'deal_title', 'counterparty', 'status', 
                 'signed_at', 'file', 'file_details', 'notes', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        # Custom validation for signed NDAs
        if attrs.get('status') == 'signed':
            if not attrs.get('file') and not self.instance:
                raise serializers.ValidationError("Signed NDA must have an associated document")
            if not attrs.get('signed_at'):
                raise serializers.ValidationError("Signed NDA must have a signed date")
        
        return attrs