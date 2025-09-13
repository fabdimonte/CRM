from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StageViewSet, DealViewSet, TaskViewSet

router = DefaultRouter()
router.register(r'stages', StageViewSet)
router.register(r'deals', DealViewSet)
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('', include(router.urls)),
]