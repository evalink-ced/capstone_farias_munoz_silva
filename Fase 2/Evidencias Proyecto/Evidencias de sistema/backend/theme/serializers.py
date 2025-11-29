from rest_framework import serializers
from .models import Theme

class ThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theme
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'primary_color': {'required': True},
            'secondary_color': {'required': True},
            'third_color': {'required': False, 'allow_blank': True},
            'background_from': {'required': True},
            'background_to': {'required': True}
        }