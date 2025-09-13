from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q

from .models import Document, NDA
from .serializers import DocumentSerializer, DocumentUploadSerializer, NDASerializer
from apps.users.permissions import CanAccessDocument, CanAccessDeal


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.select_related('deal', 'uploaded_by').all()
    serializer_class = DocumentSerializer
    permission_classes = [CanAccessDocument]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['deal', 'content_type', 'uploaded_by']
    search_fields = ['filename']
    ordering_fields = ['filename', 'size', 'uploaded_at']
    ordering = ['-uploaded_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Apply role-based filtering
        if user.is_admin():
            return queryset
        elif user.is_associate():
            return queryset
        elif user.is_analyst():
            # Analysts see documents for deals they own
            return queryset.filter(
                Q(deal__owner=user) | Q(uploaded_by=user) | Q(deal__isnull=True)
            )
        
        return queryset.none()
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload(self, request):
        """Handle file upload"""
        serializer = DocumentUploadSerializer(data=request.data)
        if serializer.is_valid():
            document = serializer.save(uploaded_by=request.user)
            response_serializer = DocumentSerializer(document, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NDAViewSet(viewsets.ModelViewSet):
    queryset = NDA.objects.select_related('deal', 'file').all()
    serializer_class = NDASerializer
    permission_classes = [CanAccessDeal]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['deal', 'counterparty', 'status']
    search_fields = ['notes', 'deal__title']
    ordering_fields = ['counterparty', 'status', 'signed_at', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Apply role-based filtering similar to deals
        if user.is_admin():
            return queryset
        elif user.is_associate():
            return queryset
        elif user.is_analyst():
            # Analysts see NDAs for deals they own
            return queryset.filter(deal__owner=user)
        
        return queryset.none()