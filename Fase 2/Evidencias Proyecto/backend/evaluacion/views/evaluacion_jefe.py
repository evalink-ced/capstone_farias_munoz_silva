from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.utils import timezone
from evaluacion.models import EvaluacionJefe
from evaluacion.serializers import JefeEvaluacionSerializer
import logging
from evaluacion.utils.email_notifications import enviar_notificacion_retroalimentacion_completada

logger = logging.getLogger(__name__)

def _generar_pdf_response(evaluacion, request):
    from django.http import HttpResponse
    from django.template.loader import render_to_string
    from django.template import TemplateDoesNotExist
    from django.utils import timezone
    import os

    estructura = evaluacion.estructura_json or {}
    resp_map = {r.indicador: r.puntaje for r in evaluacion.respuestas.all()}
    areas, total_max, total_obtenido = [], 0, 0

    for area in estructura.get('areas', []):
        area_total, area_max = 0, 0
        competencias_detalle = []

        for comp in area.get('competencias', []):
            comp_total, comp_max = 0, 0
            indicadores_detalle = []

            for ind in comp.get('indicadores', []):
                niveles = ind.get('nvlindicadores', [])
                max_pts = max([n.get('puntaje', 0) for n in niveles]) if niveles else 0
                puntaje = resp_map.get(ind.get('id'), 0)

                comp_total += puntaje
                comp_max += max_pts
                area_total += puntaje
                area_max += max_pts
                total_obtenido += puntaje
                total_max += max_pts

                indicadores_detalle.append({
                    'id': ind.get('id'),
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
    nivel_logro = ("Destacado" if porcentaje_total >= 90 else
                   "Competente" if porcentaje_total >= 80 else
                   "Adecuado" if porcentaje_total >= 60 else
                   "Por mejorar")
    eval_name = getattr(evaluacion.tipo_evaluacion, "n_tipo_evaluacion", evaluacion.tipo_evaluacion_id)

    ev_nom_fn = getattr(evaluacion.persona, "get_full_name", None)
    evaluado_nombre = ev_nom_fn() if callable(ev_nom_fn) else getattr(evaluacion.persona, "username", "-")
    evdor_nom_fn = getattr(evaluacion.evaluador, "get_full_name", None)
    evaluador_nombre = evdor_nom_fn() if callable(evdor_nom_fn) else getattr(evaluacion.evaluador, "username", "-")

    context = {
        'evaluacion': evaluacion,
        'evaluado_nombre': evaluado_nombre,
        'evaluador_nombre': evaluador_nombre,
        'tipo_evaluacion_nombre': eval_name,
        'areas': areas,
        'total_obtenido': total_obtenido,
        'total_max': total_max,
        'porcentaje_total': porcentaje_total,
        'nivel_logro': nivel_logro,
        'estado_actual': evaluacion.get_estado_actual(),
        'today': timezone.now(),
        'text_destacar': (evaluacion.text_destacar or '').strip(),
        'text_mejorar': (evaluacion.text_mejorar or '').strip(),
        'retroalimentacion': (evaluacion.retroalimentacion or '').strip(),
    }

    try:
        import pdfkit
        try:
            html = render_to_string('evaluacion/informe_pdf.html', context)
        except TemplateDoesNotExist:
            html = "<html><body>Informe</body></html>"
        wkhtml_path = os.environ.get('WKHTMLTOPDF_PATH', r"C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe")
        config = pdfkit.configuration(wkhtmltopdf=wkhtml_path) if os.path.exists(wkhtml_path) else None
        options = {'encoding': 'UTF-8', 'quiet': '', 'enable-local-file-access': None, 'print-media-type': None}
        pdf_bytes = pdfkit.from_string(html, False, configuration=config, options=options)
        if pdf_bytes:
            resp = HttpResponse(pdf_bytes, content_type='application/pdf')
            resp['Content-Disposition'] = f'inline; filename="evaluacion_{evaluacion.id}.pdf"'
            return resp
    except Exception as e:
        logger.exception("Fallo pdfkit/wkhtmltopdf en evaluación %s: %s", evaluacion.id, str(e))

    try:
        from weasyprint import HTML
        try:
            html = render_to_string('evaluacion/informe_pdf.html', context)
        except TemplateDoesNotExist:
            html = "<html><body>Informe</body></html>"
        pdf_bytes = HTML(string=html, base_url=request.build_absolute_uri('/')).write_pdf()
        resp = HttpResponse(pdf_bytes, content_type='application/pdf')
        resp['Content-Disposition'] = f'inline; filename="evaluacion_{evaluacion.id}.pdf"'
        return resp
    except Exception as e:
        logger.exception("Fallo WeasyPrint al generar PDF de evaluación %s: %s", evaluacion.id, str(e))

    try:
        from io import BytesIO
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import cm
        from reportlab.lib import colors

        buf = BytesIO()
        c = canvas.Canvas(buf, pagesize=A4)
        width, height = A4
        margin = 2 * cm
        y = height - margin

        def ensure_space(needed):
            nonlocal y
            if y - needed < margin:
                c.showPage()
                y = height - margin

        def draw_card(x, top_y, w, h, fill="#ffffff", stroke="#e5e7eb"):
            c.setFillColor(colors.HexColor(fill))
            c.setStrokeColor(colors.HexColor(stroke))
            c.roundRect(x, top_y - h, w, h, 8, fill=1, stroke=1)

        def draw_text(x, y_, text, size=11, color="#111111", bold=False):
            c.setFillColor(colors.HexColor(color))
            c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
            c.drawString(x, y_, text)

        def draw_progress(x, y_, w, percent):
            c.setFillColor(colors.HexColor("#e5e7eb"))
            c.roundRect(x, y_ - 6, w, 6, 3, fill=1, stroke=0)
            p_w = max(0, min(w, w * (percent / 100.0)))
            c.setFillColor(colors.HexColor("#10b981"))
            c.roundRect(x, y_ - 6, p_w, 6, 3, fill=1, stroke=0)

        ensure_space(60)
        card_h = 60
        draw_card(margin, y, width - 2 * margin, card_h)
        draw_text(margin + 12, y - 18, "Docente de Asignatura", size=18, bold=True)
        draw_text(margin + 12, y - 36, f"Evaluado: {evaluado_nombre} · Evaluador: {evaluador_nombre}", size=11, color="#6b7280")
        draw_text(margin + 12, y - 50, f"Fecha evaluación: {evaluacion.fecha_evaluacion} · Inicio: {evaluacion.fecha_inicio.strftime('%Y-%m-%d %H:%M')}", size=11, color="#6b7280")
        draw_text(width - margin - 80, y - 20, f"ID #{evaluacion.id}", size=11)
        draw_text(width - margin - 180, y - 36, f"Tipo Informe: {eval_name}", size=11, color="#6b7280")
        y -= (card_h + 12)

        ensure_space(100)
        rf_h = 100
        draw_card(margin, y, width - 2 * margin, rf_h)
        draw_text(margin + 12, y - 18, "Resultado Final", size=14, bold=True)
        draw_text(margin + 12, y - 40, "Puntaje Total", size=11, color="#6b7280")
        draw_text(margin + 12, y - 56, f"{total_obtenido} / {total_max}", size=16, bold=True)
        px = margin + 180
        draw_text(px, y - 40, "Porcentaje", size=11, color="#6b7280")
        draw_text(px, y - 56, f"{porcentaje_total}%", size=16, bold=True)
        draw_progress(px, y - 66, 180, porcentaje_total)
        bx = px + 220
        draw_text(bx, y - 40, "Nivel de Logro", size=11, color="#6b7280")
        c.setFillColor(colors.HexColor("#e9f7ef"))
        c.setStrokeColor(colors.HexColor("#c7eadf"))
        c.roundRect(bx, y - 66, 120, 22, 11, fill=1, stroke=1)
        draw_text(bx + 10, y - 50, nivel_logro, size=12, color="#0f766e", bold=True)
        y -= (rf_h + 12)

        if areas:
            ensure_space(80)
            ra_h = 80 + (len(areas) // 2) * 64
            draw_card(margin, y, width - 2 * margin, ra_h)
            draw_text(margin + 12, y - 18, "Resumen por Áreas", size=14, bold=True)
            col_w = (width - 2 * margin - 24) / 2.0
            gap = 12
            gy = y - 40
            for i, a in enumerate(areas):
                col_x = margin + 12 + (col_w + gap) * (i % 2)
                ensure_space(64)
                draw_card(col_x, gy, col_w, 60, fill="#ffffff", stroke="#f3f4f6")
                draw_text(col_x + 10, gy - 20, f"{i+1}. {a['nombre']}", size=12, color="#6b7280")
                draw_progress(col_x + 10, gy - 30, col_w - 20, a['porcentaje'])
                draw_text(col_x + 10, gy - 48, f"Puntaje: {a['puntaje_text']} · {a['porcentaje']}%", size=11, color="#6b7280")
                if i % 2 == 1:
                    gy -= 72
            y -= (ra_h + 12)

        if areas:
            ensure_space(24)
            draw_card(margin, y, width - 2 * margin, 24, fill="#ffffff", stroke="#e5e7eb")
            draw_text(margin + 12, y - 16, "Detalle por Áreas y Competencias", size=14, bold=True)
            y -= (24 + 8)

            from textwrap import wrap
            for ai, a in enumerate(areas):
                ensure_space(20)
                draw_text(margin + 12, y - 14, f"{ai+1}. {a['nombre']} · {a['puntaje_text']} · {a['porcentaje']}%", size=12, bold=True)
                y -= 20

                for ci, c_ in enumerate(a['competencias']):
                    ensure_space(18)
                    draw_text(margin + 18, y - 12, f"Competencia {ci+1}: {c_.get('name') or c_.get('nombre') or 'Competencia'} · {c_['puntaje_text']} · {c_['porcentaje']}%", size=11, color="#374151")
                    y -= 16

                    for ind in c_['indicadores']:
                        ensure_space(16)
                        draw_text(margin + 24, y - 12, f"Indicador {ind.get('numero')}: {ind['nombre']} ({ind['puntaje']}/{ind['maximo']})", size=11)
                        y -= 16

                        if ind.get('descripcion'):
                            for line in wrap(ind['descripcion'], width=95):
                                ensure_space(12)
                                draw_text(margin + 28, y - 10, line, size=10, color="#6b7280")
                                y -= 12

                        for lvl in ind.get('niveles', []):
                            mark = "*" if lvl.get('seleccionado') else "-"
                            color = "#0f766e" if lvl.get('seleccionado') else "#6b7280"
                            ensure_space(12)
                            draw_text(margin + 32, y - 10, f"{mark} {lvl.get('nombre')} · {lvl.get('puntaje')}", size=10, color=color, bold=lvl.get('seleccionado') or False)
                            y -= 12
                            if lvl.get('descripcion'):
                                for line in wrap(lvl['descripcion'], width=92):
                                    ensure_space(10)
                                    draw_text(margin + 40, y - 9, line, size=9, color="#9ca3af")
                                    y -= 10
            y -= 6

        def draw_block_if_text(title, text):
            t = (text or "").strip()
            if not t:
                return
            ensure_space(120)
            h = 120
            draw_card(margin, y, width - 2 * margin, h)
            draw_text(margin + 12, y - 18, title, size=14, bold=True)
            c.setFont("Helvetica", 11)
            c.setFillColor(colors.HexColor("#111111"))
            ty = y - 36
            max_chars = 100
            for i in range(0, len(t), max_chars):
                ensure_space(18)
                c.drawString(margin + 12, ty, t[i:i+max_chars])
                ty -= 16
            y -= (h + 12)

        draw_block_if_text("Fortalezas Destacadas", context.get('text_destacar'))
        draw_block_if_text("Oportunidades de Mejora", context.get('text_mejorar'))
        draw_block_if_text("Retroalimentación", context.get('retroalimentacion'))

        c.showPage()
        c.save()
        buf.seek(0)
        resp = HttpResponse(buf.getvalue(), content_type="application/pdf")
        resp["Content-Disposition"] = f'inline; filename="evaluacion_{evaluacion.id}.pdf"'
        return resp
    except Exception as e2:
        logger.exception("Fallo ReportLab fallback en evaluación %s: %s", evaluacion.id, str(e2))
        from rest_framework.response import Response
        from rest_framework import status
        return Response({'error': 'No se pudo generar el PDF', 'details': str(e2)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EvaluacionViewSet(viewsets.ModelViewSet):
    serializer_class = JefeEvaluacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Solo las que yo evalúo
        qs = (EvaluacionJefe.objects
              .filter(evaluador=self.request.user)
              .select_related(
                  "persona", "persona__cargo", "persona__empresa",
                  "tipo_evaluacion"
              )
              .prefetch_related("respuestas")
              .order_by("-fecha_inicio"))

        # ✅ FILTROS ACTUALIZADOS PARA NUEVO FLUJO
        completado = self.request.query_params.get("completado")
        if completado is not None:
            c = completado.lower()
            if c in ("true", "1"):
                qs = qs.filter(completado=True)
            elif c in ("false", "0"):
                qs = qs.filter(completado=False)
        
        # ✅ FILTROS ACTUALIZADOS PARA USAR estado_firma
        estado = self.request.query_params.get("estado")
        if estado:
            if estado == "en_progreso":
                qs = qs.filter(completado=False)
            elif estado == "completada":
                qs = qs.filter(completado=True, retroalimentacion_completada=False)
            elif estado == "retroalimentacion_completada":
                qs = qs.filter(retroalimentacion_completada=True, cerrado_para_firma=False)
            elif estado == "pendiente_firma":
                qs = qs.filter(cerrado_para_firma=True, estado_firma='pendiente')
            elif estado == "finalizada":
                qs = qs.filter(estado_firma='firmado')
            elif estado == "denegada":
                qs = qs.filter(estado_firma='firmado_obs')
            
        return qs

    def perform_create(self, serializer):
        # 👉 El evaluador es el usuario logeado.
        # La persona evaluada viene en el JSON como persona_id (write_only en el serializer).
        serializer.save(evaluador=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = get_object_or_404(self.get_queryset(), pk=kwargs["pk"])
        return Response(self.get_serializer(instance).data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = get_object_or_404(self.get_queryset(), pk=kwargs["pk"])

        # ✅ LOGGING DETALLADO PARA CAPTURAR ERRORES
        try:
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            
            # ✅ AGREGAR CONTEXTO PARA VALIDACIÓN DE SNAPSHOT
            serializer.context['evaluacion_jefe'] = instance
            
            if not serializer.is_valid():
                logger.error(f"Error de validación en evaluación jefe {instance.id}: {serializer.errors}")
                return Response({
                    'error': 'Datos inválidos',
                    'details': serializer.errors,
                    'debug_info': {
                        'evaluacion_id': instance.id,
                        'tiene_snapshot': bool(instance.estructura_json),
                        'version_plantilla': instance.version_plantilla
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            # ✅ DEJA QUE EL SERIALIZER HAGA EL UPSERT DE RESPUESTAS
            serializer.save()
            
            # ✅ USAR MÉTODO DEL MODELO QUE USA SNAPSHOT
            instance.calcular_logro()
            
            # Actualizar campos de texto
            instance.text_mejorar = request.data.get('text_mejorar', '')
            instance.text_destacar = request.data.get('text_destacar', '')
            instance.retroalimentacion = request.data.get('retroalimentacion', '')
            instance.save(update_fields=['text_mejorar', 'text_destacar', 'retroalimentacion'])
            
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error inesperado en evaluación jefe {instance.id}: {str(e)}")
            return Response({
                'error': 'Error interno del servidor',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def completar_retroalimentacion(self, request, pk=None):
        """Completa la retroalimentación y permite cerrar para firma"""
        evaluacion = self.get_object()
        
        if not evaluacion.puede_completar_retroalimentacion():
            return Response({
                'error': 'No se puede completar retroalimentación',
                'estado_actual': evaluacion.get_estado_actual()
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Actualizar retroalimentación si se proporciona
        retroalimentacion = request.data.get('retroalimentacion', '')
        if retroalimentacion:
            evaluacion.retroalimentacion = retroalimentacion
        
        evaluacion.retroalimentacion_completada = True
        evaluacion.fecha_reunion = timezone.now()
        evaluacion.save(update_fields=['retroalimentacion_completada', 'retroalimentacion', 'fecha_reunion'])
        
        # ✅ ENVIAR NOTIFICACIÓN DE RETROALIMENTACIÓN COMPLETADA
        try:
            enviar_notificacion_retroalimentacion_completada(evaluacion)
            logger.info(f"Notificación de retroalimentación completada enviada para evaluación {evaluacion.id}")
        except Exception as e:
            logger.error(f"Error enviando notificación de retroalimentación completada para evaluación {evaluacion.id}: {str(e)}")
            # No fallar la operación principal por un error de notificación
        
        return Response({
            'message': 'Retroalimentación completada',
            'estado_actual': evaluacion.get_estado_actual()
        })
    
    @action(detail=True, methods=['post'])
    def cerrar_para_firma(self, request, pk=None):
        """Cierra la evaluación para que el evaluado pueda firmar"""
        evaluacion = self.get_object()
        
        if not evaluacion.puede_cerrar_para_firma():
            return Response({
                'error': 'No se puede cerrar para firma',
                'estado_actual': evaluacion.get_estado_actual()
            }, status=status.HTTP_400_BAD_REQUEST)
        
        evaluacion.cerrado_para_firma = True
        evaluacion.save(update_fields=['cerrado_para_firma'])
        
        return Response({
            'message': 'Evaluación cerrada para firma',
            'estado_actual': evaluacion.get_estado_actual()
        })

    @action(detail=True, methods=["get"], url_path="generar_pdf")
    def generar_pdf(self, request, pk=None):
        from django.http import HttpResponse
        from django.template.loader import render_to_string
        from django.template import TemplateDoesNotExist
        from django.utils import timezone
        import logging, os
        logger = logging.getLogger(__name__)

        evaluacion = self.get_object()

        estructura = evaluacion.estructura_json or {}
        resp_map = {r.indicador: r.puntaje for r in evaluacion.respuestas.all()}
        areas, total_max, total_obtenido = [], 0, 0

        # Construcción jerárquica mejorada: Área → Competencia → Indicador → Niveles
        for area in estructura.get('areas', []):
            area_total, area_max = 0, 0
            competencias_detalle = []
    
            for comp in area.get('competencias', []):
                comp_total, comp_max = 0, 0
                indicadores_detalle = []
    
                for ind in comp.get('indicadores', []):
                    niveles = ind.get('nvlindicadores', [])
                    max_pts = max([n.get('puntaje', 0) for n in niveles]) if niveles else 0
                    puntaje = resp_map.get(ind.get('id'), 0)
    
                    comp_total += puntaje
                    comp_max += max_pts
                    area_total += puntaje
                    area_max += max_pts
                    total_obtenido += puntaje
                    total_max += max_pts
    
                    indicadores_detalle.append({
                        'id': ind.get('id'),
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
                    # Asegurar un nombre visible de competencia
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
        nivel_logro = ("Destacado" if porcentaje_total >= 90 else
                       "Competente" if porcentaje_total >= 80 else
                       "Adecuado" if porcentaje_total >= 60 else
                       "Por mejorar")
        eval_name = getattr(evaluacion.tipo_evaluacion, "n_tipo_evaluacion", evaluacion.tipo_evaluacion_id)

        ev_nom_fn = getattr(evaluacion.persona, "get_full_name", None)
        evaluado_nombre = ev_nom_fn() if callable(ev_nom_fn) else getattr(evaluacion.persona, "username", "-")
        evdor_nom_fn = getattr(evaluacion.evaluador, "get_full_name", None)
        evaluador_nombre = evdor_nom_fn() if callable(evdor_nom_fn) else getattr(evaluacion.evaluador, "username", "-")

        context = {
            'evaluacion': evaluacion,
            'evaluado_nombre': evaluado_nombre,
            'evaluador_nombre': evaluador_nombre,
            'tipo_evaluacion_nombre': eval_name,
            'areas': areas,
            'total_obtenido': total_obtenido,
            'total_max': total_max,
            'porcentaje_total': porcentaje_total,
            'nivel_logro': nivel_logro,
            'estado_actual': evaluacion.get_estado_actual(),
            'today': timezone.now(),
            # NUEVO: secciones finales
            'text_destacar': (evaluacion.text_destacar or '').strip(),
            'text_mejorar': (evaluacion.text_mejorar or '').strip(),
            'retroalimentacion': (evaluacion.retroalimentacion or '').strip(),
        }

        # 1) pdfkit/wkhtmltopdf (si está instalado)
        try:
            import pdfkit, os
            try:
                html = render_to_string('evaluacion/informe_pdf.html', context)
            except TemplateDoesNotExist:
                html = "<html><body>Informe</body></html>"
            wkhtml_path = os.environ.get('WKHTMLTOPDF_PATH', r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe")
            config = pdfkit.configuration(wkhtmltopdf=wkhtml_path) if os.path.exists(wkhtml_path) else None
            options = {'encoding': 'UTF-8', 'quiet': '', 'enable-local-file-access': None, 'print-media-type': None}
            pdf_bytes = pdfkit.from_string(html, False, configuration=config, options=options)
            if pdf_bytes:
                resp = HttpResponse(pdf_bytes, content_type='application/pdf')
                resp['Content-Disposition'] = f'inline; filename="evaluacion_{evaluacion.id}.pdf"'
                return resp
        except Exception as e:
            logger.exception("Fallo pdfkit/wkhtmltopdf en evaluación %s: %s", evaluacion.id, str(e))

        # 2) WeasyPrint (si funcionara en tu entorno)
        try:
            from weasyprint import HTML
            try:
                html = render_to_string('evaluacion/informe_pdf.html', context)
            except TemplateDoesNotExist:
                html = "<html><body>Informe</body></html>"
            pdf_bytes = HTML(string=html, base_url=request.build_absolute_uri('/')).write_pdf()
            resp = HttpResponse(pdf_bytes, content_type='application/pdf')
            resp['Content-Disposition'] = f'inline; filename="evaluacion_{evaluacion.id}.pdf"'
            return resp
        except Exception as e:
            logger.exception("Fallo WeasyPrint al generar PDF de evaluación %s: %s", evaluacion.id, str(e))

        # 3) Fallback moderno con ReportLab (sin dependencias externas)
        try:
            from io import BytesIO
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import A4
            from reportlab.lib.units import cm
            from reportlab.lib import colors

            buf = BytesIO()
            c = canvas.Canvas(buf, pagesize=A4)
            width, height = A4
            margin = 2 * cm
            y = height - margin

            def ensure_space(needed):
                nonlocal y
                if y - needed < margin:
                    c.showPage()
                    y = height - margin

            def draw_card(x, top_y, w, h, fill="#ffffff", stroke="#e5e7eb"):
                c.setFillColor(colors.HexColor(fill))
                c.setStrokeColor(colors.HexColor(stroke))
                c.roundRect(x, top_y - h, w, h, 8, fill=1, stroke=1)

            def draw_text(x, y_, text, size=11, color="#111111", bold=False):
                c.setFillColor(colors.HexColor(color))
                c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
                c.drawString(x, y_, text)

            def draw_progress(x, y_, w, percent):
                c.setFillColor(colors.HexColor("#e5e7eb"))
                c.roundRect(x, y_ - 6, w, 6, 3, fill=1, stroke=0)
                p_w = max(0, min(w, w * (percent / 100.0)))
                c.setFillColor(colors.HexColor("#10b981"))
                c.roundRect(x, y_ - 6, p_w, 6, 3, fill=1, stroke=0)

            # Header card
            ensure_space(60)
            card_h = 60
            draw_card(margin, y, width - 2 * margin, card_h)
            draw_text(margin + 12, y - 18, "Docente de Asignatura", size=18, bold=True)
            draw_text(margin + 12, y - 36, f"Evaluado: {evaluado_nombre} · Evaluador: {evaluador_nombre}", size=11, color="#6b7280")
            draw_text(margin + 12, y - 50, f"Fecha evaluación: {evaluacion.fecha_evaluacion} · Inicio: {evaluacion.fecha_inicio.strftime('%Y-%m-%d %H:%M')}", size=11, color="#6b7280")
            draw_text(width - margin - 80, y - 20, f"ID #{evaluacion.id}", size=11)
            # Tipo Informe
            draw_text(width - margin - 180, y - 36, f"Tipo Informe: {eval_name}", size=11, color="#6b7280")
            y -= (card_h + 12)

            # Resultado Final card
            ensure_space(100)
            rf_h = 100
            draw_card(margin, y, width - 2 * margin, rf_h)
            draw_text(margin + 12, y - 18, "Resultado Final", size=14, bold=True)
            # Puntaje total
            draw_text(margin + 12, y - 40, "Puntaje Total", size=11, color="#6b7280")
            draw_text(margin + 12, y - 56, f"{total_obtenido} / {total_max}", size=16, bold=True)
            # Porcentaje + barra
            px = margin + 180
            draw_text(px, y - 40, "Porcentaje", size=11, color="#6b7280")
            draw_text(px, y - 56, f"{porcentaje_total}%", size=16, bold=True)
            draw_progress(px, y - 66, 180, porcentaje_total)
            # Nivel de logro badge
            bx = px + 220
            draw_text(bx, y - 40, "Nivel de Logro", size=11, color="#6b7280")
            c.setFillColor(colors.HexColor("#e9f7ef"))
            c.setStrokeColor(colors.HexColor("#c7eadf"))
            c.roundRect(bx, y - 66, 120, 22, 11, fill=1, stroke=1)
            draw_text(bx + 10, y - 50, nivel_logro, size=12, color="#0f766e", bold=True)
            y -= (rf_h + 12)

            # Resumen por Áreas card
            if areas:
                ensure_space(80)
                ra_h = 80 + (len(areas) // 2) * 64
                draw_card(margin, y, width - 2 * margin, ra_h)
                draw_text(margin + 12, y - 18, "Resumen por Áreas", size=14, bold=True)
                # grid 2 columnas
                col_w = (width - 2 * margin - 24) / 2.0
                gap = 12
                gy = y - 40
                for i, a in enumerate(areas):
                    col_x = margin + 12 + (col_w + gap) * (i % 2)
                    ensure_space(64)
                    # mini-card
                    draw_card(col_x, gy, col_w, 60, fill="#ffffff", stroke="#f3f4f6")
                    draw_text(col_x + 10, gy - 20, f"{i+1}. {a['nombre']}", size=12, color="#6b7280")
                    draw_progress(col_x + 10, gy - 30, col_w - 20, a['porcentaje'])
                    draw_text(col_x + 10, gy - 48, f"Puntaje: {a['puntaje_text']} · {a['porcentaje']}%", size=11, color="#6b7280")
                    if i % 2 == 1:
                        gy -= 72  # siguiente fila
                y -= (ra_h + 12)

            # NUEVO: Detalle por Áreas y Competencias
            if areas:
                ensure_space(24)
                draw_card(margin, y, width - 2 * margin, 24, fill="#ffffff", stroke="#e5e7eb")
                draw_text(margin + 12, y - 16, "Detalle por Áreas y Competencias", size=14, bold=True)
                y -= (24 + 8)

                from textwrap import wrap
                for ai, a in enumerate(areas):
                    ensure_space(20)
                    draw_text(margin + 12, y - 14, f"{ai+1}. {a['nombre']} · {a['puntaje_text']} · {a['porcentaje']}%", size=12, bold=True)
                    y -= 20

                    for ci, c_ in enumerate(a['competencias']):
                        ensure_space(18)
                        draw_text(margin + 18, y - 12, f"Competencia {ci+1}: {c_.get('name') or c_.get('nombre') or 'Competencia'} · {c_['puntaje_text']} · {c_['porcentaje']}%", size=11, color="#374151")
                        y -= 16

                        for ind in c_['indicadores']:
                            ensure_space(16)
                            draw_text(margin + 24, y - 12, f"Indicador {ind.get('numero')}: {ind['nombre']} ({ind['puntaje']}/{ind['maximo']})", size=11)
                            y -= 16

                            if ind.get('descripcion'):
                                for line in wrap(ind['descripcion'], width=95):
                                    ensure_space(12)
                                    draw_text(margin + 28, y - 10, line, size=10, color="#6b7280")
                                    y -= 12

                            for lvl in ind.get('niveles', []):
                                mark = "*" if lvl.get('seleccionado') else "-"
                                color = "#0f766e" if lvl.get('seleccionado') else "#6b7280"
                                ensure_space(12)
                                draw_text(margin + 32, y - 10, f"{mark} {lvl.get('nombre')} · {lvl.get('puntaje')}", size=10, color=color, bold=lvl.get('seleccionado') or False)
                                y -= 12
                                if lvl.get('descripcion'):
                                    for line in wrap(lvl['descripcion'], width=92):
                                        ensure_space(10)
                                        draw_text(margin + 40, y - 9, line, size=9, color="#9ca3af")
                                        y -= 10
                y -= 6

            # Secciones finales si hay contenido
            def draw_block_if_text(title, text):
                t = (text or "").strip()
                if not t:
                    return
                ensure_space(120)
                h = 120
                draw_card(margin, y, width - 2 * margin, h)
                draw_text(margin + 12, y - 18, title, size=14, bold=True)
                c.setFont("Helvetica", 11)
                c.setFillColor(colors.HexColor("#111111"))
                ty = y - 36
                max_chars = 100
                for i in range(0, len(t), max_chars):
                    ensure_space(18)
                    c.drawString(margin + 12, ty, t[i:i+max_chars])
                    ty -= 16
                y -= (h + 12)

            draw_block_if_text("Fortalezas Destacadas", context.get('text_destacar'))
            draw_block_if_text("Oportunidades de Mejora", context.get('text_mejorar'))
            draw_block_if_text("Retroalimentación", context.get('retroalimentacion'))

            c.showPage()
            c.save()
            buf.seek(0)
            resp = HttpResponse(buf.getvalue(), content_type="application/pdf")
            resp["Content-Disposition"] = f'inline; filename="evaluacion_{evaluacion.id}.pdf"'
            return resp
        except Exception as e2:
            logger.exception("Fallo ReportLab fallback en evaluación %s: %s", evaluacion.id, str(e2))
            return Response({'error': 'No se pudo generar el PDF', 'details': str(e2)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
def parse_bool(val, default=None):
    if val is None:
        return default
    v = str(val).lower()
    if v in ("true", "1", "t", "yes", "y"):  return True
    if v in ("false", "0", "f", "no", "n"):  return False
    return default



class MisEvaluacionesJefaturaViewSet(viewsets.ModelViewSet):

    serializer_class = JefeEvaluacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'post']  # ✅ AGREGAR POST PARA DENEGAR

    def get_queryset(self):
        qs = (
            EvaluacionJefe.objects
            .filter(persona=self.request.user)
            .select_related("persona", "persona__cargo", "persona__empresa", "tipo_evaluacion")
            .prefetch_related("respuestas")
            .order_by("-fecha_inicio")
        )

        # ✅ FILTROS ACTUALIZADOS PARA USAR estado_firma
        completado = parse_bool(self.request.query_params.get("completado"))
        if completado is not None:
            qs = qs.filter(completado=completado)

        # ✅ MANTENER COMPATIBILIDAD CON firmado PERO USAR estado_firma
        firmado = parse_bool(self.request.query_params.get("firmado"))
        if firmado is not None:
            if firmado:
                qs = qs.filter(estado_firma='firmado')
            else:
                qs = qs.exclude(estado_firma='firmado')
        
        # ✅ FILTRO POR ESTADO ACTUALIZADO
        estado = self.request.query_params.get("estado")
        if estado:
            if estado == "pendiente_firma":
                qs = qs.filter(cerrado_para_firma=True, estado_firma='pendiente')
            elif estado == "finalizada":
                qs = qs.filter(estado_firma='firmado')
            elif estado == "denegada":
                qs = qs.filter(estado_firma='firmado_obs')

        return qs
    
    def partial_update(self, request, *args, **kwargs):
        """
        Permite actualizar solo campos específicos como 'estado_firma'
        """
        instance = self.get_object()
        
        # ✅ LOGGING DETALLADO PARA DEBUGGING
        logger.info(f"PATCH request para evaluación {instance.id} por usuario {request.user.id}")
        logger.info(f"Datos recibidos: {request.data}")
        logger.info(f"Estado actual de la evaluación:")
        logger.info(f"  - completado: {instance.completado}")
        logger.info(f"  - retroalimentacion_completada: {instance.retroalimentacion_completada}")
        logger.info(f"  - cerrado_para_firma: {instance.cerrado_para_firma}")
        logger.info(f"  - estado_firma: {instance.estado_firma}")
        logger.info(f"  - puede_denegar(): {instance.puede_denegar()}")
        logger.info(f"  - puede_firmar(): {instance.puede_firmar()}")
        
        # ✅ CAMPOS PERMITIDOS ACTUALIZADOS
        allowed_fields = {'estado_firma', 'motivo_denegacion'}
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        # ✅ MANTENER COMPATIBILIDAD CON 'firmado' PARA EL FRONTEND
        if 'firmado' in request.data:
            if request.data['firmado']:
                data['estado_firma'] = 'firmado'
            # Si firmado=False, no cambiar el estado (podría estar firmado_obs)
        
        logger.info(f"Datos filtrados para actualizar: {data}")
        
        if not data:
            logger.warning(f"No se proporcionaron campos válidos. Datos originales: {request.data}")
            return Response({
                'error': 'No se proporcionaron campos válidos para actualizar',
                'allowed_fields': list(allowed_fields) + ['firmado'],  # Para compatibilidad
                'received_data': dict(request.data)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # ✅ VALIDACIONES ESPECÍFICAS
        if 'estado_firma' in data:
            if data['estado_firma'] == 'firmado' and not instance.puede_firmar():
                logger.warning(f"Intento de firmar evaluación {instance.id} que no puede ser firmada")
                return Response({
                    'error': 'No se puede firmar esta evaluación',
                    'estado_actual': instance.get_estado_actual(),
                    'puede_firmar': instance.puede_firmar(),
                    'debug_info': {
                        'cerrado_para_firma': instance.cerrado_para_firma,
                        'estado_firma': instance.estado_firma
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if data['estado_firma'] == 'firmado_obs' and not instance.puede_denegar():
                logger.warning(f"Intento de denegar evaluación {instance.id} que no puede ser denegada")
                return Response({
                    'error': 'No se puede denegar esta evaluación',
                    'estado_actual': instance.get_estado_actual(),
                    'puede_denegar': instance.puede_denegar(),
                    'debug_info': {
                        'cerrado_para_firma': instance.cerrado_para_firma,
                        'estado_firma': instance.estado_firma
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # ✅ VALIDACIÓN ADICIONAL PARA MOTIVO DE DENEGACIÓN
        if 'motivo_denegacion' in data and 'estado_firma' in data and data['estado_firma'] == 'firmado_obs':
            motivo = data.get('motivo_denegacion', '').strip()
            if not motivo:
                logger.warning(f"Intento de denegar evaluación {instance.id} sin motivo")
                return Response({
                    'error': 'El motivo de denegación es obligatorio'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if len(motivo) < 50:
                logger.warning(f"Intento de denegar evaluación {instance.id} con motivo muy corto: {len(motivo)} caracteres")
                return Response({
                    'error': 'El motivo de denegación debe tener al menos 50 caracteres',
                    'current_length': len(motivo)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            serializer = self.get_serializer(instance, data=data, partial=True)
            if not serializer.is_valid():
                logger.error(f"Error de validación del serializer para evaluación {instance.id}: {serializer.errors}")
                return Response({
                    'error': 'Error de validación',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer.save()
            
            logger.info(f"Usuario {request.user.id} actualizó exitosamente evaluación {instance.id}: {data}")
            
            return Response(serializer.data)
            
        except ValueError as ve:
            logger.error(f"Error de validación del modelo para evaluación {instance.id}: {str(ve)}")
            return Response({
                'error': 'Error de validación del modelo',
                'message': str(ve)
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error inesperado al actualizar evaluación {instance.id}: {str(e)}")
            return Response({
                'error': 'Error interno del servidor',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def denegar(self, request, pk=None):
        """
        Endpoint específico para denegar una evaluación
        """
        evaluacion = self.get_object()
        
        if not evaluacion.puede_denegar():
            return Response({
                'error': 'No se puede denegar esta evaluación',
                'estado_actual': evaluacion.get_estado_actual()
            }, status=status.HTTP_400_BAD_REQUEST)
        
        motivo = request.data.get('motivo_denegacion', '').strip()
        if not motivo:
            return Response({
                'error': 'El motivo de denegación es obligatorio'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(motivo) < 50:
            return Response({
                'error': 'El motivo de denegación debe tener al menos 50 caracteres'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            evaluacion.estado_firma = 'firmado_obs'
            evaluacion.motivo_denegacion = motivo
            evaluacion.save(update_fields=['estado_firma', 'motivo_denegacion'])
            
            logger.info(f"Usuario {request.user.id} denegó evaluación {evaluacion.id}")
            
            return Response({
                'message': 'Evaluación denegada exitosamente',
                'estado_actual': evaluacion.get_estado_actual(),
                'motivo_denegacion': motivo
            })
            
        except Exception as e:
            logger.error(f"Error al denegar evaluación {evaluacion.id}: {str(e)}")
            return Response({
                'error': 'Error interno del servidor',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=["get"], url_path="generar_pdf")
    def generar_pdf(self, request, pk=None):
        evaluacion = self.get_object()
        return _generar_pdf_response(evaluacion, request)
    
    def update(self, request, *args, **kwargs):
        """
        Deshabilitar PUT completo, solo permitir PATCH
        """
        return Response({
            'error': 'Método no permitido. Use PATCH para actualizaciones parciales.'
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def create(self, request, *args, **kwargs):
        """
        Deshabilitar creación
        """
        return Response({
            'error': 'No se permite crear evaluaciones desde este endpoint.'
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def destroy(self, request, *args, **kwargs):
        """
        Deshabilitar eliminación
        """
        return Response({
            'error': 'No se permite eliminar evaluaciones desde este endpoint.'
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)


