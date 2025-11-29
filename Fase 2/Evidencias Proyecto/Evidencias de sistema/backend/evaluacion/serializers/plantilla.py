from django.db import transaction
from rest_framework import serializers
from evaluacion.models import TipoEvaluacion, AreaEvaluacion, Competencia, Indicador, NivelLogro

class NivelLogroSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)  # permitir upsert
    class Meta:
        model = NivelLogro
        fields = ['id','nombre','descripcion','nvl','puntaje']

class IndicadorSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    nvlindicadores = NivelLogroSerializer(many=True, required=False)

    class Meta:
        model = Indicador
        fields = ['id','numero','indicador','definicion','nvlindicadores']

class CompetenciaSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    indicadores = IndicadorSerializer(many=True, required=False)

    class Meta:
        model = Competencia
        fields = ['id','name','indicadores']

class AreaEvaluacionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    competencias = CompetenciaSerializer(many=True, required=False)

    class Meta:
        model = AreaEvaluacion
        fields = ['id','n_area','ponderacion','competencias']

MISSING = object()

class TipoEvaluacionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    areas = AreaEvaluacionSerializer(many=True, required=False)

    class Meta:
        model = TipoEvaluacion
        fields = ['id', 'n_tipo_evaluacion', 'areas', 'auto', 'ponderada']

    def create(self, validated_data):
        validated_data.pop('id', None)  # ← por si acaso
        areas_data = validated_data.pop('areas', [])
        with transaction.atomic():
            tipo = TipoEvaluacion.objects.create(**validated_data)
            self._upsert_areas(tipo, areas_data)  # tu helper
        return tipo


    def update(self, instance, validated_data):
        areas_data = validated_data.pop('areas', MISSING)
        instance.n_tipo_evaluacion = validated_data.get('n_tipo_evaluacion', instance.n_tipo_evaluacion)
        instance.auto = validated_data.get('auto', instance.auto)
        instance.ponderada = validated_data.get('ponderada', instance.ponderada)
        with transaction.atomic():
            instance.save()
            if areas_data is not MISSING:            # ← solo si vino 'areas'
                self._upsert_areas(instance, areas_data)
        return instance

    # ---------- helpers de upsert ----------
    def _upsert_areas(self, tipo, areas_data):
        existing = {a.id: a for a in tipo.areas.all()}
        seen_ids = set()

        for a in areas_data:
            comps_data = a.pop('competencias', MISSING)   # ← sentinela
            a_id = a.pop('id', None)

            if a_id and a_id in existing:
                area = existing[a_id]
                for k, v in a.items():
                    setattr(area, k, v)
                area.save()
            else:
                area = AreaEvaluacion.objects.create(tipo_evaluacion=tipo, **a)
            seen_ids.add(area.id)

            if comps_data is not MISSING:                # ← solo si vino
                self._upsert_competencias(area, comps_data)

        # elimina áreas solo si el cliente envió 'areas'
        ids_actuales = set(existing.keys())
        for a_id in ids_actuales - seen_ids:
            existing[a_id].delete()

    def _upsert_competencias(self, area, comps_data):
        existing = {c.id: c for c in area.competencias.all()}
        seen_ids = set()

        for c in comps_data:
            inds_data = c.pop('indicadores', MISSING)    # ← sentinela
            c_id = c.pop('id', None)

            if c_id and c_id in existing:
                comp = existing[c_id]
                for k, v in c.items():
                    setattr(comp, k, v)
                comp.save()
            else:
                comp = Competencia.objects.create(area=area, **c)
            seen_ids.add(comp.id)

            if inds_data is not MISSING:                 # ← solo si vino
                self._upsert_indicadores(comp, inds_data)

        for c_id in set(existing.keys()) - seen_ids:
            existing[c_id].delete()

    def _upsert_indicadores(self, comp, inds_data):
        existing = {i.id: i for i in comp.indicadores.all()}
        seen_ids = set()

        for i in inds_data:
            nvl_data = i.pop('nvlindicadores', MISSING)  # ← sentinela
            i_id = i.pop('id', None)

            if i_id and i_id in existing:
                ind = existing[i_id]
                for k, v in i.items():
                    setattr(ind, k, v)
                ind.save()
            else:
                ind = Indicador.objects.create(competencias=comp, **i)
            seen_ids.add(ind.id)

            if nvl_data is not MISSING:                  # ← solo si vino
                self._upsert_niveles(ind, nvl_data)

        for i_id in set(existing.keys()) - seen_ids:
            existing[i_id].delete()

    def _upsert_niveles(self, ind, niveles_data):
        existing = {n.id: n for n in ind.nvlindicadores.all()}
        seen_ids = set()

        for n in niveles_data:
            n_id = n.pop('id', None)
            if n_id and n_id in existing:
                lvl = existing[n_id]
                for k, v in n.items():
                    setattr(lvl, k, v)
                lvl.save()
            else:
                lvl = NivelLogro.objects.create(indicador=ind, **n)
            seen_ids.add(lvl.id)

        for n_id in set(existing.keys()) - seen_ids:
            existing[n_id].delete()