from django import forms
from .models import Aeva, CompeIndicador, NvlIndicador, Competencia

class SolicitarForm(forms.ModelForm):
    class Meta:
        model = Competencia
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['aeva'].queryset = Aeva.objects.all()
        self.fields['compe_indicador'].queryset = CompeIndicador.objects.all()
        self.fields['nvl_indicador'].queryset = NvlIndicador.objects.all()
        self.fields['compe_indicador'].empty_label = "Seleccione un Indicador"
        self.fields['nvl_indicador'].empty_label = "Seleccione un Nivel de Logro"