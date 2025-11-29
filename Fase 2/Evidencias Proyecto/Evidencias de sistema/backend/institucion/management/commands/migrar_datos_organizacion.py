from django.core.management.base import BaseCommand
from django.db import transaction
from institucion.models import (
    Empresa, Sede, Asignacion,
    TipoOrganizacion, Organizacion, EmpresaServicio, 
    SedeOrganizacion, ContratoServicio, AsignacionTrabajador
)
from usuarios.models import User


class Command(BaseCommand):
    help = 'Migra datos del sistema antiguo al nuevo modelo de organizaciones'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Ejecuta la migración sin guardar cambios (solo muestra lo que haría)',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Fuerza la migración incluso si ya existen datos en el nuevo modelo',
        )
    
    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('MODO DRY-RUN: No se guardarán cambios'))
        
        # Verificar si ya existen datos en el nuevo modelo
        if not force and (Organizacion.objects.exists() or EmpresaServicio.objects.exists()):
            self.stdout.write(
                self.style.ERROR(
                    'Ya existen datos en el nuevo modelo. Use --force para sobrescribir.'
                )
            )
            return
        
        try:
            with transaction.atomic():
                self.migrar_tipos_organizacion(dry_run)
                self.migrar_organizaciones_y_empresas(dry_run)
                self.migrar_sedes(dry_run)
                self.migrar_contratos_servicio(dry_run)
                self.migrar_asignaciones(dry_run)
                
                if dry_run:
                    # Rollback en dry-run
                    transaction.set_rollback(True)
                    self.stdout.write(
                        self.style.SUCCESS('Migración completada (DRY-RUN - sin cambios)')
                    )
                else:
                    self.stdout.write(
                        self.style.SUCCESS('Migración completada exitosamente')
                    )
                    
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error durante la migración: {str(e)}')
            )
            raise
    
    def migrar_tipos_organizacion(self, dry_run):
        self.stdout.write('Creando tipos de organización...')
        
        tipos = [
            {'nombre': 'Fundación Educacional', 'descripcion': 'Fundaciones dedicadas a la educación'},
            {'nombre': 'Empresa de Servicios', 'descripcion': 'Empresas que prestan servicios a fundaciones'},
        ]
        
        for tipo_data in tipos:
            if not dry_run:
                tipo, created = TipoOrganizacion.objects.get_or_create(
                    nombre=tipo_data['nombre'],
                    defaults=tipo_data
                )
                if created:
                    self.stdout.write(f'  ✓ Creado: {tipo.nombre}')
                else:
                    self.stdout.write(f'  - Ya existe: {tipo.nombre}')
            else:
                self.stdout.write(f'  [DRY-RUN] Crearía: {tipo_data["nombre"]}')
    
    def migrar_organizaciones_y_empresas(self, dry_run):
        self.stdout.write('Migrando empresas a organizaciones y empresas de servicio...')
        
        tipo_fundacion = TipoOrganizacion.objects.get(nombre='Fundación Educacional') if not dry_run else None
        
        # Mapeo de categorías a organizaciones/empresas
        mapeo = {
            'FUND_PUDAHUEL': {
                'tipo': 'organizacion',
                'nombre': 'Fundación Educacional Pudahuel',
                'nombre_corto': 'CSLB',
                'rut': '65.123.456-7'  # Ajustar con RUT real
            },
            'FUND_CERRO': {
                'tipo': 'organizacion', 
                'nombre': 'Fundación Cerro Navia',
                'nombre_corto': 'CEA',
                'rut': '65.789.012-3'  # Ajustar con RUT real
            },
            'GAE': {
                'tipo': 'empresa_servicio',
                'nombre': 'GAE Servicios Educacionales',
                'nombre_corto': 'GAE',
                'rut': '76.345.678-9'  # Ajustar con RUT real
            },
            'SP': {
                'tipo': 'empresa_servicio',
                'nombre': 'SP Servicios Profesionales', 
                'nombre_corto': 'SP',
                'rut': '76.901.234-5'  # Ajustar con RUT real
            }
        }
        
        for empresa in Empresa.objects.all():
            categoria = empresa.categoria_operativa
            if categoria in mapeo:
                config = mapeo[categoria]
                
                if config['tipo'] == 'organizacion':
                    if not dry_run:
                        org, created = Organizacion.objects.get_or_create(
                            nombre_corto=config['nombre_corto'],
                            defaults={
                                'nombre': config['nombre'],
                                'rut': config['rut'],
                                'tipo': tipo_fundacion,
                                'formulario': empresa.formulario,
                                'fondo': empresa.fondo,
                                'theme': empresa.theme,
                                'direccion': empresa.direccion,
                            }
                        )
                        if created:
                            self.stdout.write(f'  ✓ Organización creada: {org.nombre}')
                        else:
                            self.stdout.write(f'  - Organización ya existe: {org.nombre}')
                    else:
                        self.stdout.write(f'  [DRY-RUN] Crearía organización: {config["nombre"]}')
                
                elif config['tipo'] == 'empresa_servicio':
                    if not dry_run:
                        emp_serv, created = EmpresaServicio.objects.get_or_create(
                            nombre_corto=config['nombre_corto'],
                            defaults={
                                'nombre': config['nombre'],
                                'rut': config['rut'],
                                'tipo_empresa': empresa.tipo_empresa,
                                'direccion': empresa.direccion,
                                'permite_asignacion_multiple': (categoria == 'SP'),
                                'max_organizaciones_simultaneas': 2 if categoria == 'SP' else 1,
                            }
                        )
                        if created:
                            self.stdout.write(f'  ✓ Empresa de servicio creada: {emp_serv.nombre}')
                        else:
                            self.stdout.write(f'  - Empresa de servicio ya existe: {emp_serv.nombre}')
                    else:
                        self.stdout.write(f'  [DRY-RUN] Crearía empresa de servicio: {config["nombre"]}')
    
    def migrar_sedes(self, dry_run):
        self.stdout.write('Migrando sedes...')
        
        # Mapeo de sedes a organizaciones
        mapeo_sedes = {
            'Pudahuel': 'CSLB',
            'Cerro Navia': 'CEA',
        }
        
        for sede in Sede.objects.all():
            org_corto = mapeo_sedes.get(sede.nombre)
            if org_corto and not dry_run:
                try:
                    organizacion = Organizacion.objects.get(nombre_corto=org_corto)
                    sede_org, created = SedeOrganizacion.objects.get_or_create(
                        organizacion=organizacion,
                        slug=sede.slug,
                        defaults={
                            'nombre': sede.nombre,
                            'direccion': sede.direccion,
                        }
                    )
                    if created:
                        self.stdout.write(f'  ✓ Sede creada: {sede_org.nombre} -> {organizacion.nombre}')
                    else:
                        self.stdout.write(f'  - Sede ya existe: {sede_org.nombre}')
                except Organizacion.DoesNotExist:
                    self.stdout.write(f'  ⚠ Organización no encontrada para sede: {sede.nombre}')
            elif dry_run:
                self.stdout.write(f'  [DRY-RUN] Crearía sede: {sede.nombre} -> {org_corto}')
    
    def migrar_contratos_servicio(self, dry_run):
        self.stdout.write('Creando contratos de servicio...')
        
        if dry_run:
            self.stdout.write('  [DRY-RUN] Crearía contratos entre empresas de servicio y organizaciones')
            return
        
        # Crear contratos entre todas las empresas de servicio y organizaciones
        for emp_servicio in EmpresaServicio.objects.all():
            for organizacion in Organizacion.objects.all():
                contrato, created = ContratoServicio.objects.get_or_create(
                    empresa_servicio=emp_servicio,
                    organizacion=organizacion,
                    fecha_inicio='2020-01-01',  # Ajustar fecha según necesidad
                    defaults={
                        'descripcion': f'Contrato de servicios entre {emp_servicio.nombre} y {organizacion.nombre}',
                    }
                )
                
                if created:
                    # Agregar todas las sedes de la organización al contrato
                    contrato.sedes_permitidas.set(organizacion.sedes.all())
                    self.stdout.write(
                        f'  ✓ Contrato creado: {emp_servicio.nombre} -> {organizacion.nombre}'
                    )
                else:
                    self.stdout.write(
                        f'  - Contrato ya existe: {emp_servicio.nombre} -> {organizacion.nombre}'
                    )
    
    def migrar_asignaciones(self, dry_run):
        self.stdout.write('Migrando asignaciones...')
        
        if dry_run:
            asignaciones_count = Asignacion.objects.count()
            self.stdout.write(f'  [DRY-RUN] Migraría {asignaciones_count} asignaciones')
            return
        
        for asignacion in Asignacion.objects.all():
            try:
                # Buscar la empresa de servicio correspondiente
                categoria = asignacion.empresa.categoria_operativa
                if categoria in ['GAE', 'SP']:
                    empresa_servicio = EmpresaServicio.objects.get(nombre_corto=categoria)
                else:
                    self.stdout.write(f'  ⚠ Asignación ignorada (no es empresa de servicio): {asignacion}')
                    continue
                
                # Buscar la sede en el nuevo modelo
                sede_org = SedeOrganizacion.objects.filter(
                    slug=asignacion.sede.slug
                ).first()
                
                if not sede_org:
                    self.stdout.write(f'  ⚠ Sede no encontrada: {asignacion.sede.slug}')
                    continue
                
                # Buscar el contrato de servicio
                contrato = ContratoServicio.objects.filter(
                    empresa_servicio=empresa_servicio,
                    organizacion=sede_org.organizacion
                ).first()
                
                if not contrato:
                    self.stdout.write(
                        f'  ⚠ Contrato no encontrado: {empresa_servicio.nombre} -> {sede_org.organizacion.nombre}'
                    )
                    continue
                
                # Crear la nueva asignación
                nueva_asignacion, created = AsignacionTrabajador.objects.get_or_create(
                    trabajador=asignacion.persona,
                    contrato_servicio=contrato,
                    sede=sede_org,
                    fecha_inicio=asignacion.fecha_inicio,
                    defaults={
                        'fecha_fin': asignacion.fecha_fin,
                        'tipo_asignacion': (
                            AsignacionTrabajador.TipoAsignacion.VARIABLE 
                            if categoria == 'SP' 
                            else AsignacionTrabajador.TipoAsignacion.FIJO
                        ),
                        'porcentaje_tiempo': 100.00,  # Ajustar según necesidad
                        'descripcion': f'Migrado desde asignación ID {asignacion.id}',
                    }
                )
                
                if created:
                    self.stdout.write(
                        f'  ✓ Asignación migrada: {asignacion.persona.get_full_name()} -> {sede_org.nombre}'
                    )
                else:
                    self.stdout.write(
                        f'  - Asignación ya existe: {asignacion.persona.get_full_name()} -> {sede_org.nombre}'
                    )
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Error migrando asignación {asignacion.id}: {str(e)}')
                )