from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q  # ← Agregar esta línea
from institucion.models import (
    Empresa, Sede, Asignacion,
    TipoOrganizacion, Organizacion, EmpresaServicio, 
    SedeOrganizacion, ContratoServicio, AsignacionTrabajador
)
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Migra datos del modelo antiguo al nuevo sistema de organizaciones'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Ejecuta sin hacer cambios reales en la base de datos',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Fuerza la migración incluso si ya existen datos nuevos',
        )
    
    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('MODO DRY-RUN: No se harán cambios reales'))
        
        try:
            with transaction.atomic():
                self.migrar_tipos_organizacion(dry_run)
                self.migrar_organizaciones(dry_run)
                self.migrar_empresas_servicio(dry_run)
                self.migrar_sedes(dry_run)
                self.migrar_contratos(dry_run)
                self.migrar_asignaciones(dry_run)
                
                if dry_run:
                    raise transaction.TransactionManagementError("Rollback para dry-run")
                    
        except transaction.TransactionManagementError:
            if dry_run:
                self.stdout.write(self.style.SUCCESS('Dry-run completado exitosamente'))
            else:
                raise
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error durante la migración: {e}'))
            raise
    
    def migrar_tipos_organizacion(self, dry_run):
        """Crea los tipos de organización básicos"""
        tipos = [
            {'nombre': 'Fundación', 'descripcion': 'Fundación educacional'},
            {'nombre': 'Corporación', 'descripcion': 'Corporación sin fines de lucro'},
        ]
        
        for tipo_data in tipos:
            if not dry_run:
                TipoOrganizacion.objects.get_or_create(
                    nombre=tipo_data['nombre'],
                    defaults=tipo_data
                )
            self.stdout.write(f"Tipo de organización: {tipo_data['nombre']}")
    
    def migrar_organizaciones(self, dry_run):
        """Migra fundaciones del modelo Empresa al modelo Organizacion"""
        fundaciones = Empresa.objects.filter(
            categoria_operativa__in=['FUND_PUDAHUEL', 'FUND_CERRO']
        )
        
        tipo_fundacion = None if dry_run else TipoOrganizacion.objects.get(nombre='Fundación')
        
        for empresa in fundaciones:
            # Generar nombre único para evitar duplicados
            nombre_base = empresa.name or empresa.empresa
            nombre_unico = nombre_base
            contador = 1
            
            # Verificar si ya existe una organización con este nombre
            if not dry_run:
                while Organizacion.objects.filter(nombre=nombre_unico).exists():
                    nombre_unico = f"{nombre_base} ({contador})"
                    contador += 1
            
            org_data = {
                'rut': empresa.rut,
                'nombre': nombre_unico,
                'nombre_corto': empresa.empresa,
                'direccion': empresa.direccion,
                'tipo_organizacion': tipo_fundacion,
                'logo': empresa.logo,
                'fondo': empresa.fondo,
                'theme': empresa.theme,
                'formulario': empresa.formulario,
            }
            
            if not dry_run:
                try:
                    org, created = Organizacion.objects.get_or_create(
                        nombre_corto=empresa.empresa,
                        defaults=org_data
                    )
                    if created:
                        self.stdout.write(f"✓ Organización creada: {org.nombre}")
                    else:
                        self.stdout.write(f"- Organización ya existe: {org.nombre}")
                except Exception as e:
                    self.stdout.write(f"✗ Error al crear organización {empresa.empresa}: {e}")
            else:
                self.stdout.write(f"[DRY-RUN] Crearía organización: {nombre_unico}")
    
    def migrar_empresas_servicio(self, dry_run):
        """Migra empresas de servicio (GAE, SP)"""
        empresas_servicio = Empresa.objects.filter(
            categoria_operativa__in=['GAE', 'SP']
        )
        
        for empresa in empresas_servicio:
            # Generar nombre único para evitar duplicados
            nombre_base = empresa.name or empresa.empresa
            nombre_unico = nombre_base
            contador = 1
            
            # Verificar si ya existe una empresa de servicio con este nombre
            if not dry_run:
                while EmpresaServicio.objects.filter(nombre=nombre_unico).exists():
                    nombre_unico = f"{nombre_base} ({contador})"
                    contador += 1
            
            emp_data = {
                'rut': empresa.rut,
                'nombre': nombre_unico,
                'nombre_corto': empresa.empresa,
                'direccion': empresa.direccion,
                'tipo_empresa': empresa.tipo_empresa,
                'permite_asignaciones_multiples': empresa.categoria_operativa == 'SP',
                'max_sedes_por_trabajador': empresa.max_sedes_activas_por_persona,
            }
            
            if not dry_run:
                try:
                    emp_serv, created = EmpresaServicio.objects.get_or_create(
                        nombre_corto=empresa.empresa,
                        defaults=emp_data
                    )
                    if created:
                        self.stdout.write(f"✓ Empresa de servicio creada: {emp_serv.nombre}")
                    else:
                        self.stdout.write(f"- Empresa de servicio ya existe: {emp_serv.nombre}")
                except Exception as e:
                    self.stdout.write(f"✗ Error al crear empresa de servicio {empresa.empresa}: {e}")
            else:
                self.stdout.write(f"[DRY-RUN] Crearía empresa de servicio: {nombre_unico}")
    
    def migrar_sedes(self, dry_run):
        """Migra sedes al nuevo modelo"""
        sedes = Sede.objects.all()
        
        for sede in sedes:
            # Determinar a qué organización pertenece la sede
            organizacion = None
            if not dry_run:
                if 'pudahuel' in sede.nombre.lower():
                    organizacion = Organizacion.objects.filter(nombre_corto__icontains='pudahuel').first()
                elif 'cerro' in sede.nombre.lower() or 'navia' in sede.nombre.lower():
                    organizacion = Organizacion.objects.filter(nombre_corto__icontains='cerro').first()
                else:
                    # Asignar a la primera organización disponible
                    organizacion = Organizacion.objects.first()
            
            if organizacion or dry_run:
                sede_data = {
                    'organizacion': organizacion,
                    'nombre': sede.nombre,
                    'slug': sede.slug,
                    'direccion': sede.direccion,
                }
                
                if not dry_run:
                    SedeOrganizacion.objects.get_or_create(
                        organizacion=organizacion,
                        slug=sede.slug,
                        defaults=sede_data
                    )
                
                self.stdout.write(f"Sede migrada: {sede.nombre} → {organizacion.nombre_corto if organizacion else 'TBD'}")
    
    def migrar_contratos(self, dry_run):
        """Crea contratos de servicio entre empresas y organizaciones"""
        if dry_run:
            self.stdout.write("Contratos de servicio serían creados...")
            return
        
        # Crear contratos GAE → Fundaciones (permanentes)
        gae = EmpresaServicio.objects.filter(nombre_corto='GAE').first()
        if gae:
            for org in Organizacion.objects.all():
                contrato, created = ContratoServicio.objects.get_or_create(
                    empresa_servicio=gae,
                    organizacion=org,
                    defaults={
                        'fecha_inicio': timezone.now().date(),
                        'permite_multisede': False,
                    }
                )
                # Asignar todas las sedes de la organización
                contrato.sedes_permitidas.set(org.sedes.all())
                
                if created:
                    self.stdout.write(f"Contrato creado: GAE → {org.nombre_corto}")
        
        # Crear contratos SP → Fundaciones (flexibles)
        sp = EmpresaServicio.objects.filter(nombre_corto='SP').first()
        if sp:
            for org in Organizacion.objects.all():
                contrato, created = ContratoServicio.objects.get_or_create(
                    empresa_servicio=sp,
                    organizacion=org,
                    defaults={
                        'fecha_inicio': timezone.now().date(),
                        'permite_multisede': True,
                    }
                )
                # Asignar todas las sedes de la organización
                contrato.sedes_permitidas.set(org.sedes.all())
                
                if created:
                    self.stdout.write(f"Contrato creado: SP → {org.nombre_corto}")
    
    def migrar_asignaciones(self, dry_run):
        """Migra asignaciones al nuevo modelo"""
        # No podemos filtrar por 'activa' porque es una propiedad, no un campo
        # En su lugar, obtenemos todas las asignaciones y filtramos por fecha
        hoy = timezone.localdate()
        asignaciones = Asignacion.objects.filter(
            fecha_inicio__lte=hoy
        ).filter(
            Q(fecha_fin__isnull=True) | Q(fecha_fin__gte=hoy)
        )
        
        for asig in asignaciones:
            if dry_run:
                self.stdout.write(f"Asignación a migrar: {asig.persona.get_full_name()} → {asig.empresa.empresa} - {asig.sede.nombre}")
                continue
            
            # Buscar la sede en el nuevo modelo
            sede_nueva = SedeOrganizacion.objects.filter(
                nombre=asig.sede.nombre
            ).first()
            
            if not sede_nueva:
                self.stdout.write(
                    self.style.WARNING(f"No se encontró sede nueva para: {asig.sede.nombre}")
                )
                continue
            
            # Buscar el contrato de servicio correspondiente
            contrato = ContratoServicio.objects.filter(
                organizacion=sede_nueva.organizacion,
                empresa_servicio__nombre_corto=asig.empresa.empresa
            ).first()
            
            if not contrato:
                self.stdout.write(
                    self.style.WARNING(f"No se encontró contrato para: {asig.empresa.empresa} → {sede_nueva.organizacion.nombre_corto}")
                )
                continue
            
            # Crear la nueva asignación
            asignacion_nueva, created = AsignacionTrabajador.objects.get_or_create(
                trabajador=asig.persona,
                contrato_servicio=contrato,
                sede=sede_nueva,
                fecha_inicio=asig.fecha_inicio,
                defaults={
                    'fecha_fin': asig.fecha_fin,
                    'porcentaje_tiempo': 100.00,  # Valor por defecto
                    'es_permanente': True,
                    'activa': True,
                }
            )
            
            if created:
                self.stdout.write(f"Asignación migrada: {asig.persona.get_full_name()} → {sede_nueva}")
            else:
                self.stdout.write(f"Asignación ya existía: {asig.persona.get_full_name()} → {sede_nueva}")