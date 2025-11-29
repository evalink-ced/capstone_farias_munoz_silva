import re
from itertools import cycle
from django.core.exceptions import ValidationError

def validate_rut(value):
    if not value or value == "rut":
        return value  # si está vacío o es "rut", retorna tal cual

    rut = value.replace(".", "").replace("-", "").upper()

    if not re.match(r'^\d{7,8}[0-9K]$', rut):
        raise ValidationError("Formato de RUT inválido. Debe ser 'XX.XXX.XXX-X'.")

    rut_body, verifier = rut[:-1], rut[-1]
    reverse_rut = map(int, reversed(rut_body))
    factors = cycle(range(2, 8))
    total = sum(d * f for d, f in zip(reverse_rut, factors))
    remainder = (-total) % 11
    verifier_calculated = 'K' if remainder == 10 else str(remainder)

    if verifier_calculated != verifier:
        raise ValidationError("Dígito verificador del RUT inválido.")

    # ✅ Retorna RUT limpio pero con guion
    return f"{rut_body}-{verifier}"
