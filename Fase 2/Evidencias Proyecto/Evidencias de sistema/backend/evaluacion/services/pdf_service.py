import os
import logging
from django.template.loader import render_to_string
from django.template import TemplateDoesNotExist
from django.http import HttpResponse
from django.utils import timezone

logger = logging.getLogger(__name__)

class PDFService:
    @staticmethod
    def _get_respuestas(evaluacion):
        """
        Intenta obtener las respuestas independientemente del nombre de la relación inversa.
        Soporta EvaluacionJefe (respuestas) y Autoevaluacion (autoevaluacionrespuesta_set o similar).
        """
        posibles_nombres = [
            'respuestas', 
            'respuestas_autoevaluacion', 
            'autoevaluacionrespuesta_set', 
            'evaluacionrespuesta_set',
            'respuestas_set'
        ]
        
        for nombre in posibles_nombres:
            if hasattr(evaluacion, nombre):
                try:
                    manager = getattr(evaluacion, nombre)
                    return manager.all()
                except Exception:
                    continue
        return []

    @staticmethod
    def _build_context(evaluacion):
        estructura = evaluacion.estructura_json or {}
        
        # 1. Obtener respuestas de forma dinámica
        respuestas_qs = PDFService._get_respuestas(evaluacion)
        
        # 2. Mapeo seguro: ID Indicador -> Puntaje
        resp_map = {}
        for r in respuestas_qs:
            ind_id = None
            
            # Caso A: Tiene campo explícito 'indicador_id' (lo más común en DB)
            if hasattr(r, 'indicador_id'):
                ind_id = r.indicador_id
            
            # Caso B: Tiene atributo 'indicador' que puede ser Objeto o Int
            if not ind_id and hasattr(r, 'indicador'):
                val = r.indicador
                if isinstance(val, int): 
                    ind_id = val  # Es un ID numérico (causa del error anterior)
                elif hasattr(val, 'id'): 
                    ind_id = val.id # Es un objeto Django
            
            if ind_id:
                resp_map[ind_id] = r.puntaje

        areas, total_max, total_obtenido = [], 0, 0

        # --- Lógica de cálculo ---
        for area in estructura.get('areas', []):
            area_total, area_max = 0, 0
            competencias_detalle = []

            for comp in area.get('competencias', []):
                comp_total, comp_max = 0, 0
                indicadores_detalle = []

                for ind in comp.get('indicadores', []):
                    niveles = ind.get('nvlindicadores', [])
                    max_pts = max([n.get('puntaje', 0) for n in niveles]) if niveles else 0
                    
                    # Buscamos por ID (siempre entero en el JSON)
                    ind_json_id = ind.get('id')
                    puntaje = resp_map.get(ind_json_id, 0)

                    comp_total += puntaje
                    comp_max += max_pts
                    area_total += puntaje
                    area_max += max_pts
                    total_obtenido += puntaje
                    total_max += max_pts

                    indicadores_detalle.append({
                        'id': ind_json_id,
                        'numero': ind.get('numero'),
                        'nombre': ind.get('indicador'),
                        'descripcion': ind.get('definicion'),
                        'puntaje': puntaje,
                        'maximo': max_pts,
                        'niveles': [{
                            'nombre': lvl.get('nivel') or lvl.get('nombre') or lvl.get('n_nivel_indicador') or 'Nivel',
                            'puntaje': lvl.get('puntaje', 0),
                            'descripcion': lvl.get('definicion') or lvl.get('descripcion'),
                            'seleccionado': puntaje == lvl.get('puntaje', 0),
                        } for lvl in niveles],
                    })

                comp_porcentaje = round((comp_total / comp_max) * 100, 1) if comp_max else 0
                competencias_detalle.append({
                    'name': comp.get('competencia') or comp.get('name') or 'Competencia',
                    'puntaje_text': f"{comp_total} / {comp_max}",
                    'porcentaje': comp_porcentaje,
                    'indicadores': indicadores_detalle,
                })

            porcentaje = round((area_total / area_max) * 100, 1) if area_max else 0
            areas.append({
                'nombre': area.get('n_area'),
                'ponderacion': area.get('ponderacion', 0),
                'puntaje_text': f"{area_total} / {area_max}",
                'porcentaje': porcentaje,
                'competencias': competencias_detalle,
            })

        porcentaje_total = float(getattr(evaluacion, 'logro_obtenido', 0) or 0)
        
        # Helper para obtener nombres de forma segura
        def get_name(obj):
            if not obj: return "-"
            # Intentar método get_full_name
            fn = getattr(obj, "get_full_name", None)
            if callable(fn): return fn()
            # Intentar atributos comunes
            return getattr(obj, "username", getattr(obj, "first_name", str(obj)))

        # --- Detección Polimórfica de Evaluador ---
        # Si es EvaluacionJefe, tiene 'evaluador'. Si es Autoevaluacion, NO tiene 'evaluador'.
        if hasattr(evaluacion, 'evaluador') and evaluacion.evaluador:
            evaluador_nombre = get_name(evaluacion.evaluador)
        else:
            # Fallback para Autoevaluación
            evaluador_nombre = get_name(evaluacion.persona) + " (Autoevaluación)"

        # --- Detección Segura de Estado ---
        estado_actual = "Desconocido"
        if hasattr(evaluacion, 'get_estado_actual'):
            estado_actual = evaluacion.get_estado_actual()
        elif hasattr(evaluacion, 'completado'):
            estado_actual = 'Completado' if evaluacion.completado else 'En Progreso'

        return {
            'evaluacion': evaluacion,
            'evaluado_nombre': get_name(evaluacion.persona),
            'evaluador_nombre': evaluador_nombre,
            'tipo_evaluacion_nombre': getattr(evaluacion.tipo_evaluacion, "n_tipo_evaluacion", str(evaluacion.tipo_evaluacion_id)),
            'areas': areas,
            'total_obtenido': total_obtenido,
            'total_max': total_max,
            'porcentaje_total': porcentaje_total,
            'nivel_logro': PDFService._calcular_nivel_logro(porcentaje_total),
            'estado_actual': estado_actual,
            'today': timezone.now(),
            # Usamos getattr con valor por defecto vacío para campos opcionales
            'text_destacar': (getattr(evaluacion, 'text_destacar', '') or '').strip(),
            'text_mejorar': (getattr(evaluacion, 'text_mejorar', '') or '').strip(),
            'retroalimentacion': (getattr(evaluacion, 'retroalimentacion', '') or '').strip(),
        }

    @staticmethod
    def _calcular_nivel_logro(porcentaje):
        if porcentaje >= 90: return "Destacado"
        if porcentaje >= 80: return "Competente"
        if porcentaje >= 60: return "Adecuado"
        return "Insatisfactorio"

    @classmethod
    def generate(cls, evaluacion, request):
        try:
            context = cls._build_context(evaluacion)
            filename = f'evaluacion_{evaluacion.id}.pdf'

            # 1. PDFKit / Wkhtmltopdf
            try:
                import pdfkit
                try:
                    html = render_to_string('evaluacion/informe_pdf.html', context)
                except TemplateDoesNotExist:
                    html = f"<html><body><h1>Informe Evaluación {evaluacion.id}</h1><p>Template no encontrado</p></body></html>"
                
                wkhtml_path = os.environ.get('WKHTMLTOPDF_PATH', r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe")
                config = pdfkit.configuration(wkhtmltopdf=wkhtml_path) if os.path.exists(wkhtml_path) else None
                options = {'encoding': 'UTF-8', 'quiet': '', 'enable-local-file-access': None}
                
                pdf_bytes = pdfkit.from_string(html, False, configuration=config, options=options)
                if pdf_bytes:
                    return cls._create_response(pdf_bytes, filename)
            except Exception as e:
                logger.warning(f"Fallo PDFKit: {e}")

            # 2. Fallback ReportLab (Texto simple para debugging si todo falla)
            return cls._generate_simple_fallback(context, filename)

        except Exception as e:
            # Captura cualquier error de lógica (ej: campos faltantes) y lo loguea
            logger.exception(f"Error crítico generando PDF para evaluación {evaluacion.id}")
            # Retornar un error HTTP válido para que el frontend no se quede colgado
            from django.http import HttpResponseServerError
            return HttpResponseServerError(f"Error generando PDF: {str(e)}")

    @staticmethod
    def _create_response(content, filename):
        resp = HttpResponse(content, content_type='application/pdf')
        resp['Content-Disposition'] = f'inline; filename="{filename}"'
        return resp

    @staticmethod
    def _generate_simple_fallback(context, filename):
        from io import BytesIO
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4
        
        buf = BytesIO()
        c = canvas.Canvas(buf, pagesize=A4)
        c.drawString(100, 800, f"Informe de Evaluación: {context['evaluado_nombre']}")
        c.drawString(100, 780, f"ID: {context['evaluacion'].id}")
        c.drawString(100, 760, f"Puntaje: {context['porcentaje_total']}%")
        c.drawString(100, 740, "Nota: El renderizado HTML falló, este es un reporte de respaldo.")
        c.showPage()
        c.save()
        buf.seek(0)
        return PDFService._create_response(buf.getvalue(), filename)