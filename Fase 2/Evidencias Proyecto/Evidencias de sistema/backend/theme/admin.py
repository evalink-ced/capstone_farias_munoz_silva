from django.contrib import admin
from django import forms
from .models import Theme
import re
from django.core.exceptions import ValidationError
from django.forms.widgets import MultiWidget, TextInput
from django.utils.safestring import mark_safe


HEX_PATTERN = r'^#(?:[0-9a-fA-F]{3}){1,2}$'
RGB_PATTERN = r'^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$'
RGBA_PATTERN = r'^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$'

def validate_color(value):
    if not (
        re.match(HEX_PATTERN, value) or
        re.match(RGB_PATTERN, value) or
        re.match(RGBA_PATTERN, value)
    ):
        raise ValidationError("Color inválido. Usa HEX (#ff0000), RGB o RGBA.")

class DualColorInput(MultiWidget):
    def __init__(self, attrs=None):
        widgets = [
            TextInput(attrs={"type": "color", "class": "color-picker"}),
            TextInput(attrs={"placeholder": "#RRGGBB o rgb(...)", "class": "color-text", "style": "width: 120px;"})
        ]
        super().__init__(widgets, attrs)

    def decompress(self, value):
        return [value, value]

    def render(self, name, value, attrs=None, renderer=None):
        rendered = super().render(name, value, attrs, renderer)
        script = f"""
        <script>
        (function() {{
            const widget = document.querySelectorAll('[name="{name}_0"], [name="{name}_1"]');
            const picker = widget[0];
            const text = widget[1];

            function hexFromRgb(rgb) {{
                const result = rgb.match(/\\d+/g);
                if (!result || result.length < 3) return "#000000";
                return "#" + result.slice(0, 3).map(x => ("0" + parseInt(x).toString(16)).slice(-2)).join("");
            }}

            picker.addEventListener("input", () => {{
                text.value = picker.value;
            }});

            text.addEventListener("input", () => {{
                const val = text.value.trim();
                if (/^#([0-9a-fA-F]{{3}}){{1,2}}$/.test(val)) {{
                    picker.value = val;
                }} else if (/^rgb\\(\\s*\\d{{1,3}}\\s*,\\s*\\d{{1,3}}\\s*,\\s*\\d{{1,3}}\\s*\\)$/.test(val)) {{
                    picker.value = hexFromRgb(val);
                }}
            }});
        }})();
        </script>
        """
        return mark_safe(rendered + script)

class DualColorField(forms.MultiValueField):
    def __init__(self, *args, **kwargs):
        fields = [
            forms.CharField(),
            forms.CharField(validators=[validate_color])
        ]
        super().__init__(fields=fields, widget=DualColorInput(), *args, **kwargs)

    def compress(self, data_list):
        return data_list[1]  # guarda el valor escrito, no el picker

class ThemeAdminForm(forms.ModelForm):
    primary_color = DualColorField()
    secondary_color = DualColorField()
    third_color = DualColorField()
    background_from = DualColorField()
    background_to = DualColorField()
    background_from_dark = DualColorField(required=False)
    background_to_dark = DualColorField(required=False)
    accent_color = DualColorField(required=False)

    class Meta:
        model = Theme
        fields = '__all__'

class ThemeAdmin(admin.ModelAdmin):
    form = ThemeAdminForm
    list_display = ('name', 'primary_color', 'secondary_color')
    search_fields = ('name',)  # Add this line

admin.site.register(Theme, ThemeAdmin)
