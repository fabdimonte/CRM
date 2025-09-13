from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q

from .models import Interaction
from .serializers import InteractionSerializer, InteractionDetailSerializer, InteractionCreateSerializer
from apps.users.permissions import CanAccessDeal


class InteractionViewSet(viewsets.ModelViewSet):
    queryset = Interaction.objects.select_related('deal', 'company', 'contact', 'author').all()
    permission_classes = [CanAccessDeal]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type', 'deal', 'company', 'contact', 'author']
    search_fields = ['subject', 'body']
    ordering_fields = ['subject', 'occurred_at', 'created_at']
    ordering = ['-occurred_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return InteractionCreateSerializer
        elif self.action == 'retrieve':
            return InteractionDetailSerializer
        return InteractionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Apply role-based filtering
        if user.is_admin():
            return queryset
        elif user.is_associate():
            return queryset
        elif user.is_analyst():
            # Analysts see interactions for deals they own or interactions they authored
            return queryset.filter(
                Q(deal__owner=user) | Q(author=user) | Q(deal__isnull=True)
            )
        
        return queryset.none()
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)