from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Company, Contact
from .serializers import CompanySerializer, ContactSerializer
from apps.users.permissions import IsAdminOrAssociateOrReadOnly


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAdminOrAssociateOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['country', 'sector', 'size']
    search_fields = ['name', 'legal_id', 'sector']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['name']


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.select_related('company').all()
    serializer_class = ContactSerializer
    permission_classes = [IsAdminOrAssociateOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['company', 'seniority']
    search_fields = ['first_name', 'last_name', 'email', 'company__name']
    ordering_fields = ['first_name', 'last_name', 'created_at', 'updated_at']
    ordering = ['last_name', 'first_name']