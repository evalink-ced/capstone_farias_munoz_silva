# evaluacion/views/mixto_views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from evaluacion.models import (
    JefeEvaluacionAsignadaDetalle,
    EvaluacionAsignada,
    Autoevaluacion,
    EvaluacionJefe,
)
from evaluacion.serializers.mixto_serializers import EvaluacionMixtaSerializer
from evaluacion.serializers.asignar import UsuarioSerializer


class EvaluacionMixtaViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        q = (request.query_params.get("q") or "").strip().lower()
        tipo = (request.query_params.get("tipo") or "").strip()
        anio = (request.query_params.get("anio") or "").strip()
        scope = (request.query_params.get("scope") or "me").strip().lower()

        import re

        def _norm_period(value: str) -> str:
            v = str(value or "").strip().lower()
            m_year = re.search(r"(20\d{2})", v)
            year = m_year.group(1) if m_year else None
            m_month = re.search(r"\b(0[1-9]|1[0-2])\b", v)
            month = m_month.group(1) if m_month else None
            if not month:
                months = {
                    "enero": "01",
                    "febrero": "02",
                    "marzo": "03",
                    "abril": "04",
                    "mayo": "05",
                    "junio": "06",
                    "julio": "07",
                    "agosto": "08",
                    "septiembre": "09",
                    "setiembre": "09",
                    "octubre": "10",
                    "noviembre": "11",
                    "diciembre": "12",
                }
                for name, num in months.items():
                    if name in v:
                        month = num
                        break
            if year and month:
                return f"{month}-{year}"
            return v

        base_qs = JefeEvaluacionAsignadaDetalle.objects.select_related(
            "asignacion",
            "asignacion__tipo_evaluacion",
            "persona",
            "evaluador",
        )
        group_obj = getattr(request.user, "group", None)
        can_view_all = bool(getattr(group_obj, "is_staff", False) or getattr(request.user, "is_superuser", False))
        if scope == "all" and not can_view_all:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)
        detalles = base_qs.all() if (scope == "all" and can_view_all) else base_qs.filter(evaluador=request.user)

        agrupados = {}
        for detalle in detalles:
            asign = detalle.asignacion
            tipo_jefe = asign.tipo_evaluacion
            periodo = asign.fecha_evaluacion
            periodo_norm = _norm_period(periodo)

            if tipo and getattr(tipo_jefe, "n_tipo_evaluacion", None) != tipo:
                continue

            if anio:
                try:
                    periodo_anio = (_norm_period(periodo) or "")[-4:]
                    if periodo_anio != anio:
                        continue
                except Exception:
                    continue

            jefe_cands = (
                EvaluacionJefe.objects.filter(
                    persona=detalle.persona,
                    tipo_evaluacion=tipo_jefe,
                    evaluador=detalle.evaluador,
                )
                .order_by("-id")
            )
            jefe_eval = None
            for je in jefe_cands:
                if _norm_period(je.fecha_evaluacion) == periodo_norm and je.completado:
                    jefe_eval = je
                    break
            if not jefe_eval:
                continue

            asign_cands = (
                EvaluacionAsignada.objects.filter(
                    personas_asignadas=detalle.persona,
                )
                .select_related("tipo_evaluacion", "auto_tipo_evaluacion")
                .order_by("-id")
            )
            asign_auto = None
            for aa in asign_cands:
                if _norm_period(aa.fecha_evaluacion) == periodo_norm and (
                    getattr(aa, "auto_tipo_evaluacion", None) == tipo_jefe or True
                ):
                    asign_auto = aa
                    break
            if not asign_auto or not getattr(asign_auto, "tipo_evaluacion", None):
                continue

            auto_cands = (
                Autoevaluacion.objects.filter(
                    persona=detalle.persona,
                    tipo_evaluacion=asign_auto.tipo_evaluacion,
                    completado=True,
                )
                .select_related("persona", "tipo_evaluacion")
                .order_by("-id")
            )
            auto_eval = None
            for ae in auto_cands:
                if _norm_period(ae.fecha_evaluacion) == periodo_norm:
                    auto_eval = ae
                    break
            if not auto_eval:
                continue

            if q:
                persona_nombre = f"{getattr(detalle.persona, 'first_name', '')} {getattr(detalle.persona, 'last_name', '')}".strip().lower()
                evaluador_nombre = f"{getattr(detalle.evaluador, 'first_name', '')} {getattr(detalle.evaluador, 'last_name', '')}".strip().lower()
                tipo_nombre = (getattr(tipo_jefe, "n_tipo_evaluacion", "") or "").lower()
                periodo_s = (periodo_norm or str(periodo)).lower()
                if not (
                    q in persona_nombre
                    or q in evaluador_nombre
                    or q in tipo_nombre
                    or q in periodo_s
                ):
                    continue

            key = asign.id
            if key not in agrupados:
                agrupados[key] = {
                    "id": asign.id,
                    "tipo_evaluacion": {
                        "id": getattr(tipo_jefe, "id", None),
                        "n_tipo_evaluacion": getattr(tipo_jefe, "n_tipo_evaluacion", None),
                        "auto": getattr(tipo_jefe, "auto", False),
                        "ponderada": getattr(tipo_jefe, "ponderada", False),
                    },
                    "fecha_evaluacion": periodo,
                    "detalles": [],
                }

            agrupados[key]["detalles"].append(
                {
                    "id": detalle.id,
                    "persona": UsuarioSerializer(detalle.persona).data,
                    "evaluador": UsuarioSerializer(detalle.evaluador).data,
                }
            )

        data = [v for v in agrupados.values() if v["detalles"]]
        return Response(data)

    def retrieve(self, request, pk=None):
        group_obj = getattr(request.user, "group", None)
        can_view_any = bool(getattr(group_obj, "is_staff", False) or getattr(request.user, "is_superuser", False))
        lookup = {"pk": pk}
        if not can_view_any:
            lookup["evaluador"] = request.user
        detalle = get_object_or_404(
            JefeEvaluacionAsignadaDetalle.objects.select_related(
                "asignacion", "asignacion__tipo_evaluacion",
                "persona", "evaluador"
            ),
            **lookup
        )
        asign_jefe = detalle.asignacion
        tipo_jefe = asign_jefe.tipo_evaluacion
        periodo = asign_jefe.fecha_evaluacion
        persona = detalle.persona

        # 2) Asignación AUTO (pareo por tipo + período + persona; con fallback)
        asign_auto = (
            EvaluacionAsignada.objects
            .filter(
                auto_tipo_evaluacion=tipo_jefe,
                fecha_evaluacion=periodo,
                personas_asignadas=persona
            )
            .select_related("tipo_evaluacion")
            .first()
        ) or (
            EvaluacionAsignada.objects
            .filter(
                fecha_evaluacion=periodo,
                personas_asignadas=persona
            )
            .select_related("tipo_evaluacion", "auto_tipo_evaluacion")
            .order_by("-id")
            .first()
        )

        # 3) Autoevaluación - CORREGIDO: usar campos correctos del modelo
        auto = None
        if asign_auto:
            auto = (
                Autoevaluacion.objects
                .filter(
                    persona=persona,
                    tipo_evaluacion=asign_auto.tipo_evaluacion,
                    fecha_evaluacion=periodo
                )
                .select_related("persona", "tipo_evaluacion")
                .prefetch_related("respuestas")
                .first()
            )
        if not auto and asign_auto and getattr(asign_auto, "tipo_evaluacion", None):
            auto = (
                Autoevaluacion.objects
                .filter(
                    persona=persona,
                    tipo_evaluacion=asign_auto.tipo_evaluacion,
                    fecha_evaluacion=periodo
                )
                .select_related("persona", "tipo_evaluacion")
                .prefetch_related("respuestas")
                .first()
            )

        # 4) Evaluación Jefatura
        jefe = (
            EvaluacionJefe.objects
            .filter(
                persona=persona,
                tipo_evaluacion=tipo_jefe,
                fecha_evaluacion=periodo,
                evaluador=detalle.evaluador,
            )
            .select_related("persona", "evaluador", "tipo_evaluacion")
            .prefetch_related("respuestas")
            .order_by("-id")
            .first()
        )

        # ---------- helpers ----------
        def _rel(obj, *names):
            for n in names:
                rel = getattr(obj, n, None)
                if rel is not None:
                    try:
                        return rel.all() if hasattr(rel, "all") else rel
                    except Exception:
                        return rel
            return []

        def _ordered(qs_or_iter, *by):
            try:
                for f in (by or ("orden", "posicion", "numero", "id")):
                    try:
                        return list(qs_or_iter.order_by(f))
                    except Exception:
                        continue
                return list(qs_or_iter)
            except Exception:
                return list(qs_or_iter)

        def _nombre(obj, *candidatos):
            if not obj:
                return None
            for c in candidatos:
                v = getattr(obj, c, None)
                if v:
                    return str(v)
            return None

        # 5) Plantilla AUTO (para recorrer en paralelo si existe)
        tipo_auto = (
            getattr(asign_auto, "tipo_evaluacion", None)
            or getattr(auto, "tipo_evaluacion", None)
        )

        # 6) Mapas por POSICIÓN - CORREGIDO: usar estructura_json si existe
        def mapear_por_posicion(evaluacion):
            if not evaluacion:
                return {}
            
            # ✅ USAR estructura_json si existe (para evaluaciones con snapshot)
            if hasattr(evaluacion, 'estructura_json') and evaluacion.estructura_json:
                pos = {}
                idx = 0
                for area in evaluacion.estructura_json.get('areas', []):
                    for comp in area.get('competencias', []):
                        for ind in comp.get('indicadores', []):
                            rid = ind['id']
                            r = evaluacion.respuestas.filter(indicador=rid).first()
                            pos[idx] = r.puntaje if r else None
                            idx += 1
                return pos
            
            # Fallback al método original si no hay estructura_json
            if not getattr(evaluacion, "tipo_evaluacion", None):
                return {}
            pos = {}
            idx = 0
            for area in _ordered(_rel(evaluacion.tipo_evaluacion, "areas", "areas_evaluacion", "area_set"), "orden", "id"):
                for comp in _ordered(_rel(area, "competencias", "competencias_evaluacion", "competencia_set"), "orden", "id"):
                    for ind in _ordered(_rel(comp, "indicadores", "indicadores_evaluacion", "indicador_set"), "orden", "numero", "id"):
                        rid = getattr(ind, "id", None)
                        r = evaluacion.respuestas.filter(indicador=rid).first() if rid is not None else None
                        pos[idx] = r.puntaje if r else None
                        idx += 1
            return pos

        pa_map = mapear_por_posicion(auto)  # Auto
        pj_map = mapear_por_posicion(jefe)  # Jefe

        # 7) Plantilla base (usamos jefatura como "oficial")
        tipo_base = tipo_jefe or tipo_auto
        if not tipo_base:
            return Response({"detail": "No se encontró una plantilla base (tipo_evaluacion)."}, status=404)

        # 8) Recorrido paralelo POR POSICIÓN y acumuladores de totales
        # ✅ USAR estructura_json si existe, sino usar plantilla actual
        if jefe and hasattr(jefe, 'estructura_json') and jefe.estructura_json:
            areas_j = jefe.estructura_json.get('areas', [])
        else:
            areas_j = _ordered(_rel(tipo_jefe, "areas", "areas_evaluacion", "area_set"), "orden", "id")
            
        if auto and hasattr(auto, 'estructura_json') and auto.estructura_json:
            areas_a = auto.estructura_json.get('areas', [])
        elif tipo_auto:
            areas_a = _ordered(_rel(tipo_auto, "areas", "areas_evaluacion", "area_set"), "orden", "id")
        else:
            areas_a = []
            
        n_areas = min(len(areas_j), len(areas_a)) if areas_a else len(areas_j)

        areas_data = []
        idx_pos = 0
        comparables_respondidos_auto = 0
        comparables_respondidos_jefe = 0

        total_max_posible = 0.0
        auto_pts_sum = 0.0
        jefe_pts_sum = 0.0

        for i in range(n_areas):
            area_j = areas_j[i]
            area_a = areas_a[i] if areas_a else None
            
            # Manejar tanto dict (estructura_json) como objetos (plantilla)
            if isinstance(area_j, dict):
                nombre_area = area_j.get("n_area", "Área")
                comps_j = area_j.get("competencias", [])
            else:
                nombre_area = getattr(area_j, "n_area", None) or "Área"
                comps_j = _ordered(_rel(area_j, "competencias", "competencias_evaluacion", "competencia_set"), "orden", "id")
            
            if isinstance(area_a, dict):
                comps_a = area_a.get("competencias", [])
            elif area_a:
                comps_a = _ordered(_rel(area_a, "competencias", "competencias_evaluacion", "competencia_set"), "orden", "id")
            else:
                comps_a = []
                
            n_comps = min(len(comps_j), len(comps_a)) if comps_a else len(comps_j)

            comps_data = []
            for j in range(n_comps):
                comp_j = comps_j[j]
                comp_a = comps_a[j] if comps_a else None
                
                if isinstance(comp_j, dict):
                    nombre_comp = comp_j.get("name", "Competencia")
                    inds_j = comp_j.get("indicadores", [])
                else:
                    nombre_comp = getattr(comp_j, "name", None) or "Competencia"
                    inds_j = _ordered(_rel(comp_j, "indicadores", "indicadores_evaluacion", "indicador_set"), "orden", "numero", "id")
                
                if isinstance(comp_a, dict):
                    inds_a = comp_a.get("indicadores", [])
                elif comp_a:
                    inds_a = _ordered(_rel(comp_a, "indicadores", "indicadores_evaluacion", "indicador_set"), "orden", "numero", "id")
                else:
                    inds_a = []
                    
                n_inds = min(len(inds_j), len(inds_a)) if inds_a else len(inds_j)

                inds_data = []
                for k in range(n_inds):
                    ind_j = inds_j[k]
                    ind_a = inds_a[k] if inds_a else None

                    if isinstance(ind_j, dict):
                        numero = ind_j.get("numero")
                        ind_id = ind_j.get("id")
                        niveles_data = ind_j.get("nvlindicadores", [])
                    else:
                        numero = getattr(ind_j, "numero", None)
                        ind_id = getattr(ind_j, "id", None)
                        niveles = getattr(ind_j, "nvlindicadores", None)
                        niveles_data = niveles.all() if hasattr(niveles, "all") else (niveles or [])
                    
                    display = f"Indicador {numero}" if numero is not None else "Indicador"

                    pa = pa_map.get(idx_pos)
                    pj = pj_map.get(idx_pos)

                    # Máximo posible de este indicador
                    max_puntaje = 0.0
                    try:
                        if isinstance(niveles_data, list) and niveles_data:
                            if isinstance(niveles_data[0], dict):
                                vals = [float(n.get('puntaje', 0)) for n in niveles_data]
                            else:
                                vals = [float(n.puntaje) for n in niveles_data]
                            max_puntaje = min(max(vals), 4.0)  # tope 4
                        else:
                            max_puntaje = 4.0
                    except Exception:
                        max_puntaje = 4.0

                    total_max_posible += max_puntaje
                    if pa is not None:
                        auto_pts_sum += float(pa)
                        comparables_respondidos_auto += 1
                    if pj is not None:
                        jefe_pts_sum += float(pj)
                        comparables_respondidos_jefe += 1

                    delta = (pj - pa) if (pa is not None and pj is not None) else None
                    idx_pos += 1

                    inds_data.append({
                        "id": ind_id,
                        "nombre": ind_j.get("indicador") if isinstance(ind_j, dict) else getattr(ind_j, "indicador", None),
                        "puntaje_auto": pa,
                        "puntaje_jefe": pj,
                        "delta": delta,
                    })

                comps_data.append({
                    "id": comp_j.get("id") if isinstance(comp_j, dict) else getattr(comp_j, "id", None),
                    "nombre": nombre_comp,
                    "indicadores": inds_data
                })

            areas_data.append({
                "id": area_j.get("id") if isinstance(area_j, dict) else getattr(area_j, "id", None),
                "nombre": nombre_area,
                "competencias": comps_data
            })

        # 9) Totales y porcentajes - USAR logro_obtenido directamente
        def _pct(part, total):
            if part is None or total is None or total <= 0:
                return None
            return round((part / total) * 100.0, 2)

        # Asegurar que logro_obtenido esté actualizado
        if auto and hasattr(auto, 'calcular_logro'):
            auto.calcular_logro()
            auto.refresh_from_db()
            
        if jefe and hasattr(jefe, 'calcular_logro'):
            jefe.calcular_logro()
            jefe.refresh_from_db()
            
        # Usar logro_obtenido de las evaluaciones en lugar de cálculo manual
        auto_pct = getattr(auto, 'logro_obtenido', None) if auto else None
        jefe_pct = getattr(jefe, 'logro_obtenido', None) if jefe else None
        
        # ✅ CORREGIDO: Usar suma real de puntajes en lugar de conversión artificial
        auto_pts = auto_pts_sum if auto_pts_sum > 0 else None
        jefe_pts = jefe_pts_sum if jefe_pts_sum > 0 else None
        max_pts = total_max_posible if total_max_posible > 0 else None

        # Calcular deltas usando los valores reales de puntos
        delta_pct = (float(jefe_pct) - float(auto_pct)) if (auto_pct is not None and jefe_pct is not None) else None
        delta_pts = (jefe_pts - auto_pts) if (auto_pts is not None and jefe_pts is not None) else None

        # Conteo restringido solo a los indicadores comparados (idx_pos)
        respondidos_auto = comparables_respondidos_auto
        respondidos_jefe = comparables_respondidos_jefe

        # 10) Payload
        payload = {
            "tipo_evaluacion_id": tipo_base.id,
            "tipo_evaluacion": _nombre(tipo_base, "n_tipo_evaluacion", "nombre") or str(tipo_base.id),

            "persona_id": persona.id if persona else None,
            "persona_nombre": f"{getattr(persona, 'first_name', '')} {getattr(persona, 'last_name', '')}".strip() if persona else None,
            "evaluador_id": detalle.evaluador_id if jefe else None,
            "evaluador_nombre": f"{getattr(detalle.evaluador, 'first_name', '')} {getattr(detalle.evaluador, 'last_name', '')}".strip()
                                if (jefe and getattr(detalle, 'evaluador', None)) else None,

            "fecha_evaluacion": periodo,

            "evaluacion_auto_id": getattr(auto, "id", None),
            "evaluacion_auto_nombre": _nombre(getattr(asign_auto, "tipo_evaluacion", None) or getattr(auto, "tipo_evaluacion", None) or tipo_base,
                                              "n_tipo_evaluacion", "nombre"),
            "evaluacion_jefe_id": getattr(jefe, "id", None),
            "evaluacion_jefe_nombre": _nombre(tipo_jefe, "n_tipo_evaluacion", "nombre"),

            "areas": areas_data,
            "resumen": {
                # puntos calculados desde logro_obtenido
                "auto_pts": auto_pts,
                "jefe_pts": jefe_pts,
                "max_pts": max_pts,
                "delta_pts": delta_pts,
                # porcentajes desde logro_obtenido
                "auto_pct": float(auto_pct) if auto_pct is not None else None,
                "jefe_pct": float(jefe_pct) if jefe_pct is not None else None,
                "delta_pct": delta_pct,
                # conteo de ítems respondidos
                "respondidos_auto": respondidos_auto,
                "respondidos_jefe": respondidos_jefe,
                # totales y flags de estado
                "comparables_total": idx_pos,
                "auto_completado": bool(getattr(auto, "completado", False)) if auto else False,
                "jefe_completado": bool(getattr(jefe, "completado", False)) if jefe else False,
            }
        }

        return Response(EvaluacionMixtaSerializer(payload).data)
