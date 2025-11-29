from beneficio.models.asociacion import Asociacion
from institucion.models.empresa import Empresa

print("=== VERIFICACIÓN DE BENEFICIOS Y EMPRESAS ===")
print()

# Ver todas las empresas
empresas = Empresa.objects.all()
print(f"Total de empresas: {empresas.count()}")
for empresa in empresas:
    print(f"  - {empresa.empresa} (ID: {empresa.id})")
print()

# Ver todos los beneficios activos
beneficios = Asociacion.objects.filter(is_active=True)
print(f"Total de beneficios activos: {beneficios.count()}")
print()

for beneficio in beneficios:
    print(f"Beneficio: {beneficio.title} (ID: {beneficio.id})")
    empresas_asociadas = beneficio.empresas.all()
    print(f"  Empresas asociadas: {empresas_asociadas.count()}")
    if empresas_asociadas.count() > 0:
        for empresa in empresas_asociadas:
            print(f"    - {empresa.empresa} (ID: {empresa.id})")
    else:
        print(f"    - Sin empresas asociadas")
    print()

print("=== FIN DE VERIFICACIÓN ===")