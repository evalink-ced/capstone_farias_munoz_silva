from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated
from usuarios.serializers import UserSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from usuarios.models import User
from django.shortcuts import get_object_or_404

class UserProfileView(APIView):
    authentication_classes = [JWTAuthentication]  # Usar JWT Authentication
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def get(self, request):
        user = request.user  # Obtiene el usuario autenticado
        serializer = UserSerializer(user)
        return Response(serializer.data)
    


class UserAllView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Parámetro de búsqueda
        search_query = request.GET.get('search', '').strip()
        
        # Filtro base: traer todos los usuarios activos
        users = User.objects.select_related('cargo', 'empresa', 'ciclo').filter(
            is_active=True
        )
        
        # Aplicar búsqueda si existe
        if search_query:
            from django.db.models import Q
            users = users.filter(
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(rut__icontains=search_query) |
                Q(email__icontains=search_query) |
                # Búsqueda en títulos - CORREGIDO: sin _set y campo correcto
                Q(usuariotitulo__titulo__titulo__icontains=search_query) |
                Q(usuariotitulo__institucion__universidad__icontains=search_query) |
                # Búsqueda en magísteres - CORREGIDO: sin _set y campo correcto
                Q(usuariomagister__magister__magister__icontains=search_query) |
                Q(usuariomagister__institucion__universidad__icontains=search_query) |
                # Búsqueda en diplomados - CORREGIDO: sin _set y campo correcto
                Q(usuariodiplomado__diplomado__diplomado__icontains=search_query) |
                Q(usuariodiplomado__institucion__universidad__icontains=search_query)
            ).distinct()
        
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        actor = request.user
        if not getattr(getattr(actor, 'group', None), 'is_staff', False):
            return Response({"detail": "No tienes permisos para crear usuarios"}, status=403)
        serializer = UserSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        try:
            user = serializer.save()
        except IntegrityError as e:
            return Response({"detail": str(e)}, status=400)
        return Response(UserSerializer(user, context={'request': request}).data, status=201)

class UserDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        # Obtener el usuario por ID
        user = get_object_or_404(User, id=user_id)
        
        # Serializar los datos del usuario
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        actor = request.user
        if not getattr(getattr(actor, 'group', None), 'is_staff', False):
            return Response({"detail": "No tienes permisos para editar usuarios"}, status=403)
        if int(actor.id) == int(user_id):
            return Response({"detail": "No puedes editar tu propio usuario"}, status=403)
        serializer = UserSerializer(user, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
