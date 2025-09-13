from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q

from .models import Stage, Deal, Task
from .serializers import (
    StageSerializer, DealListSerializer, DealDetailSerializer, 
    DealCreateUpdateSerializer, TaskSerializer, KanbanDealSerializer
)
from apps.users.permissions import IsAdminOrAssociateOrReadOnly, CanAccessDeal


class StageViewSet(viewsets.ModelViewSet):
    queryset = Stage.objects.all()
    serializer_class = StageSerializer
    permission_classes = [IsAdminOrAssociateOrReadOnly]
    ordering = ['order']


class DealViewSet(viewsets.ModelViewSet):
    queryset = Deal.objects.select_related('company', 'owner', 'stage').all()
    permission_classes = [CanAccessDeal]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['stage', 'owner', 'company']
    search_fields = ['title', 'company__name', 'description']
    ordering_fields = ['title', 'amount_estimate', 'probability', 'next_action_at', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'kanban':
            return DealListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return DealCreateUpdateSerializer
        return DealDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Apply role-based filtering
        if user.is_admin():
            return queryset
        elif user.is_associate():
            # For now, associates see all deals (team filtering can be added later)
            return queryset
        elif user.is_analyst():
            # Analysts only see deals they own
            return queryset.filter(owner=user)
        
        return queryset.none()
    
    def perform_create(self, serializer):
        # Set the current user as owner if not specified
        if not serializer.validated_data.get('owner'):
            serializer.save(owner=self.request.user)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def kanban(self, request):
        """Return deals grouped by stage for kanban view"""
        queryset = self.get_queryset()
        
        # Apply filters
        queryset = self.filter_queryset(queryset)
        
        # Group deals by stage
        stages = Stage.objects.all()
        kanban_data = []
        
        for stage in stages:
            stage_deals = queryset.filter(stage=stage)
            deals_data = KanbanDealSerializer(stage_deals, many=True).data
            
            kanban_data.append({
                'stage': StageSerializer(stage).data,
                'deals': deals_data,
                'count': len(deals_data)
            })
        
        return Response(kanban_data)
    
    @action(detail=True, methods=['patch'])
    def move_stage(self, request, pk=None):
        """Move deal to different stage"""
        deal = self.get_object()
        stage_id = request.data.get('stage_id')
        
        if not stage_id:
            return Response(
                {'error': 'stage_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            stage = Stage.objects.get(id=stage_id)
            deal.stage = stage
            # Update probability to stage default if not custom
            if 'update_probability' in request.data and request.data['update_probability']:
                deal.probability = stage.default_probability
            deal.save()
            
            serializer = self.get_serializer(deal)
            return Response(serializer.data)
        except Stage.DoesNotExist:
            return Response(
                {'error': 'Stage not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related('deal', 'assignee', 'created_by').all()
    serializer_class = TaskSerializer
    permission_classes = [CanAccessDeal]  # Tasks follow deal access rules
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'assignee', 'deal']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'due_at', 'created_at']
    ordering = ['due_at', '-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Apply role-based filtering similar to deals
        if user.is_admin():
            return queryset
        elif user.is_associate():
            return queryset
        elif user.is_analyst():
            # Analysts see tasks for deals they own or tasks assigned to them
            return queryset.filter(
                Q(deal__owner=user) | Q(assignee=user)
            )
        
        return queryset.none()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Get tasks assigned to current user"""
        queryset = self.get_queryset().filter(assignee=request.user)
        queryset = self.filter_queryset(queryset)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)