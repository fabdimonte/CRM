from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, NDAViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet)
router.register(r'ndas', NDAViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('documents/upload/', DocumentViewSet.as_view({'post': 'upload'}), name='document-upload'),
]