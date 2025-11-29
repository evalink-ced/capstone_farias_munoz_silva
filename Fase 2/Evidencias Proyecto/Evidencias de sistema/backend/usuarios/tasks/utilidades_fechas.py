from datetime import timedelta

def calcular_fecha_habiles(fecha_limite, dias_para_expiracion):
    dias_habiles = 0
    fecha_aviso = fecha_limite

    while dias_habiles < dias_para_expiracion:
        fecha_aviso -= timedelta(days=1)
        if fecha_aviso.weekday() < 5:
            dias_habiles += 1

    return fecha_aviso
