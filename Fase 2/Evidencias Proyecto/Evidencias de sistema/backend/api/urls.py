
from django.contrib import admin
from django.urls import path, include
from .views import GoogleTokenLoginView, google_login_callback, UserDetailView, validate_google_token
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('token/',TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/',TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/', include('rest_framework.urls')),
    path('callback/', google_login_callback, name='callback'),
    path('auth/user/', UserDetailView.as_view(), name='user_detail'),
    path('google/validate_token/', validate_google_token, name='validate_token'),
    
    path("token/google/", GoogleTokenLoginView.as_view(), name="google_token_login"),
]