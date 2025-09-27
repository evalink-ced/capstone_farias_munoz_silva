from django.shortcuts import redirect
from usuarios.models import User
from rest_framework import generics
from .serializers import UserSerializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from allauth.socialaccount.models import SocialAccount, SocialToken
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from decouple import config

FRONTEND_URL = config('FRONTEND_URL')
GOOGLE_CLIENT_ID = config("GOOGLE_CLIENT_ID")
from django.contrib.auth import login
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from google.oauth2 import id_token
from google.auth.transport import requests
from django.contrib.auth import get_user_model

User = get_user_model()


class UserDetailView(generics.RetrieveAPIView):
    """
    API view to retrieve the authenticated user's details.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializers
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user

def google_login_callback(request):
    """
    View to handle Google login callback and provide an access & refresh token.
    """
    if not request.user.is_authenticated:
        return redirect(f'{FRONTEND_URL}/login/api/callback/?error=NotAuthenticated')
    user = request.user
    social_accounts = SocialAccount.objects.filter(user=user)
    print("Social accounts for user:", social_accounts)

    social_account = social_accounts.first()

    if not social_account:
        print("No social account for user:", user)
        return redirect(f'{FRONTEND_URL}/login/api/callback/?error=NoSocialAccount')

    # Ensure we're dealing with Google as the provider
    token = SocialToken.objects.filter(account=social_account, account__provider='google').first()
    if token:
        print('Google token found:', token.token)

        # Generar access token y refresh token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)  # Acceso token
        refresh_token = str(refresh)  # Refresh token
        google_token = token.token  # Google token

        # Redirigir con todos los tokens
        return redirect(
            f'{FRONTEND_URL}login/api/callback/'
            f'?access_token={access_token}'
            f'&refresh_token={refresh_token}'
            f'&google_token={google_token}'
        )
    else:
        print('No Google token found for user:', user)
        return redirect(f'{FRONTEND_URL}/login/api/callback/?error=NoGoogleToken')



@csrf_exempt
def validate_google_token(request):
    """
    API endpoint to validate a Google access token.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            google_access_token = data.get('access_token')
            print("Received Google access token:", google_access_token)
            
            if not google_access_token:
                return JsonResponse({'detail': 'Access Token is missing.'}, status=400)
            
            # You can add logic to validate the token against Google's API here
            
            return JsonResponse({'valid': True})
        except json.JSONDecodeError:
            return JsonResponse({'detail': 'Invalid JSON.'}, status=400)
    return JsonResponse({'detail': 'Method not allowed.'}, status=405)

ALLOWED_DOMAINS = ["cslb.cl", "colegioenriquealvear.cl"]
class GoogleTokenLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        print("🚨 ENTRÓ AL MÉTODO POST")
        token = request.data.get("id_token")
        if not token:
            return Response({"error": "No se proporcionó id_token"}, status=400)
        print(f"Token recibido: {token}")
        print(f"Recibido id_token: {token}")
        try:
            id_info = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                audience=GOOGLE_CLIENT_ID
            )

            if id_info["aud"] != GOOGLE_CLIENT_ID:
                return Response({"error": "Token no válido"}, status=403)
            if id_info["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
                return Response({"error": "Emisor inválido"}, status=403)

            email = id_info.get("email")
           

            if not email:
                return Response({"error": "No se encontró email en token"}, status=400)
            try:
                # 🔒 Si el usuario ya existe → login directo
                user = User.objects.get(email=email)
                user.backend = 'django.contrib.auth.backends.ModelBackend'
                login(request, user)

                refresh = RefreshToken.for_user(user)
                return Response({
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                })

            except User.DoesNotExist:
                # 🔍 Si no existe, valida dominio y responde con mensaje claro
                domain = email.split('@')[-1].lower()
                if domain not in ALLOWED_DOMAINS:
                    return Response({
                        "error": "invalid_domain",
                        "detail": f"El dominio '{domain}' no está autorizado para usar esta plataforma, debe registrarse antes"
                    }, status=403)

                return Response({
                    "error": "no_registered",
                    "detail": f"El correo '{email}' tiene un dominio válido pero no está registrado en el sistema"
                }, status=403)

        except ValueError as e:
            return Response({"error": str(e)}, status=400)