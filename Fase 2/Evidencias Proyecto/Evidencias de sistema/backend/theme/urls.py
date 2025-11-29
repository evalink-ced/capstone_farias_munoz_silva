from django.urls import path, include
from rest_framework.routers import DefaultRouter
from theme.views import ThemeViewSet  # o ajusta al nombre de tu app

router = DefaultRouter()
router.register(r'temas', ThemeViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]