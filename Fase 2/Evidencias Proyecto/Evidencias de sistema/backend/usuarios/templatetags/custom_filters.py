# myapp/templatetags/custom_filters.py
from django import template

register = template.Library()

@register.filter(name='title_case')
def title_case(value):
    return ' '.join(word.capitalize() for word in value.split()) if isinstance(value, str) else value
