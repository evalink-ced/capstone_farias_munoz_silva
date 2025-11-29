"""
Mixins para funcionalidades específicas del modelo User
"""
from django.db import models
from django.db.models import Q
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from usuarios.utils.date_utils import _as_date


class ContractMixin(models.Model):
    """Mixin para funcionalidades relacionadas con contratos"""
    
    class Meta:
        abstract = True
    
    def contrato_vigente(self, ref=None) -> bool:
        """Verifica si el contrato del usuario está vigente"""
        hoy = _as_date(ref) or timezone.localdate()
        fin = _as_date(self.fecha_termino_contrato) if self.tipo_contrato != self.TipoContrato.INDEFINIDO else None
        inicio = _as_date(self.date_joined)
        return inicio <= hoy and (fin is None or fin >= hoy)
    
    @property
    def tiempo(self) -> float:
        """Calcula el tiempo en días desde el ingreso hasta la fecha de término o hoy"""
        if not self.date_joined:
            return 0.0
        inicio = _as_date(self.date_joined)
        fin = _as_date(self.fecha_termino_contrato) or timezone.localdate()
        return float(max((fin - inicio).days, 0))

    @property
    def tiempo_en(self) -> str:
        """Devuelve el tiempo de trabajo en formato legible"""
        if not self.date_joined:
            return "-"
        inicio = _as_date(self.date_joined)
        fin = _as_date(self.fecha_termino_contrato) or timezone.localdate()
        if fin < inicio:
            return "0 días"
        r = relativedelta(fin, inicio)
        partes = []
        if r.years:  
            partes.append(f"{r.years} año{'s' if r.years != 1 else ''}")
        if r.months: 
            partes.append(f"{r.months} mes{'es' if r.months != 1 else ''}")
        partes.append(f"{r.days} día{'s' if r.days != 1 else ''}")
        return ", ".join(partes)


class AssignmentMixin(models.Model):
    """Mixin para funcionalidades relacionadas con asignaciones"""
    
    class Meta:
        abstract = True
    
    @property
    def asignaciones_activas_nuevas(self):
        """Asignaciones activas del trabajador"""
        try:
            hoy = timezone.localdate()
            return self.asignaciones_nuevas.filter(
                activa=True,
                fecha_inicio__lte=hoy
            ).filter(
                Q(fecha_fin__isnull=True) | Q(fecha_fin__gte=hoy)
            ).select_related(
                'organizacion', 
                'relacion_servicio__empresa_servicio', 
                'relacion_servicio__organizacion_cliente',
                'sede'
            )
        except:
            return self.asignaciones_nuevas.none() if hasattr(self, 'asignaciones_nuevas') else []
    
    @property
    def empresas_servicio_activas(self):
        """Empresas de servicio activas"""
        try:
            asignaciones = self.asignaciones_activas_nuevas
            if hasattr(asignaciones, 'exists') and asignaciones.exists():
                empresas = set()
                for a in asignaciones:
                    if a.relacion_servicio:
                        empresas.add(a.relacion_servicio.empresa_servicio)
                    elif a.organizacion.es_prestador_servicio:
                        empresas.add(a.organizacion)
                return list(empresas)
            return []
        except:
            return []
    
    @property
    def empresa_servicio_principal(self):
        """Empresa de servicio principal"""
        try:
            asignaciones = self.asignaciones_activas_nuevas
            if not hasattr(asignaciones, 'exists') or not asignaciones.exists():
                return None
            
            emp_porcentajes = {}
            for asig in asignaciones:
                emp = None
                if asig.relacion_servicio:
                    emp = asig.relacion_servicio.empresa_servicio
                elif asig.organizacion.es_prestador_servicio:
                    emp = asig.organizacion
                
                if emp:
                    emp_porcentajes[emp] = emp_porcentajes.get(emp, 0) + float(asig.porcentaje_tiempo)
            
            return max(emp_porcentajes.items(), key=lambda x: x[1])[0] if emp_porcentajes else None
        except:
            return None
    
    def get_porcentaje_organizacion(self, organizacion):
        """Obtiene el porcentaje de tiempo dedicado a una organización específica"""
        try:
            total = 0
            asignaciones = self.asignaciones_activas_nuevas
            if hasattr(asignaciones, 'exists') and asignaciones.exists():
                for asig in asignaciones:
                    if asig.sede.organizacion == organizacion:
                        total += float(asig.porcentaje_tiempo)
            return total
        except:
            return 0
    
    def trabaja_en_organizacion(self, organizacion):
        """Verifica si el usuario trabaja en una organización específica"""
        try:
            return organizacion in self.organizaciones_activas
        except:
            return False
    
    def trabaja_para_empresa_servicio(self, empresa_servicio):
        """Verifica si el usuario trabaja para una empresa de servicio específica"""
        try:
            return empresa_servicio in self.empresas_servicio_activas
        except:
            return False

    @property
    def asignaciones_activas(self):
        """Asignaciones activas (sistema legacy)"""
        hoy = timezone.localdate()
        return (self.asignaciones
                .select_related("empresa", "sede")
                .filter(fecha_inicio__lte=hoy)
                .filter(Q(fecha_fin__isnull=True) | Q(fecha_fin__gte=hoy)))
    
    @property
    def empresas_activas(self):
        """Empresas activas (sistema legacy)"""
        return list({a.empresa for a in self.asignaciones_activas})

    @property
    def sedes_activas(self):
        """Sedes activas (sistema legacy)"""
        return list({a.sede for a in self.asignaciones_activas})

    @property
    def empresa_actual(self):
        """
        Empresa actual (sistema legacy)
        Compat: si tienes una sola empresa activa por diseño (Fundaciones, GAE).
        Para SP podría haber 2; devuelve una o None.
        """
        emps = self.empresas_activas
        return emps[0] if emps else None