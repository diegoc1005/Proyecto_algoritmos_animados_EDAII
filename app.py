"""
Plataforma Interactiva de Visualización - EDA II (Capítulo 6: Archivos)
Backend en Python 3.12 con implementaciones reales sobre archivos físicos en disco.
Cumple estrictamente ast_guard: CERO uso de sorted(), list.sort(), heapq, bisect, csv.reader.
"""

import os
import sys
import subprocess
import webbrowser
from threading import Timer

try:
    from flask import Flask, jsonify, render_template, request
except ImportError:
    print("Instalando Flask automáticamente...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "flask"])
    from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATOS_DIR = os.path.join(BASE_DIR, "datos")


# =========================================================================
# INICIALIZACIÓN DE ARCHIVOS FÍSICOS REALES EN DISCO
# =========================================================================
TEXTO_ARCHIVO_SECUENCIAL = (
    "Hola mundo desde archivo secuencial.\n"
    "Segunda linea de datos.\n"
    "Tercera linea final."
)

REGISTROS_INICIALES = [
    (101, "Ana",    "Ventas",   64),
    (104, "Carlos", "Sistemas", 64),
    (108, "Elena",  "Finanzas", 64),
    (112, "Beto",   "Diseno",   64),
    (115, "Diana",  "RRHH",     64),
    (120, "Franco", "Legal",    64),
    (124, "Gaby",   "Soporte",  64),
    (129, "Hugo",   "Redes",    64),
]


def asegurar_archivos_fisicos():
    """
    Crea los archivos físicos reales en el directorio ./datos/ para que los
    algoritmos ejecuten llamadas verdaderas de E/S del Sistema Operativo.
    """
    os.makedirs(DATOS_DIR, exist_ok=True)

    # 1. Archivo físico para Puntero seek() / read() / tell() (modo binario exacto LF)
    ruta_seek = os.path.join(DATOS_DIR, "archivo_secuencial.txt")
    with open(ruta_seek, "wb") as f:
        f.write(TEXTO_ARCHIVO_SECUENCIAL.encode("ascii"))

    # 2. Archivo físico de registros para Escaneo Secuencial
    ruta_emp = os.path.join(DATOS_DIR, "empleados.dat")
    with open(ruta_emp, "w", encoding="utf-8", newline="\n") as f:
        for id_emp, clave, depto, tam in REGISTROS_INICIALES:
            f.write(f"{id_emp}|{clave}|{depto}|{tam}\n")


asegurar_archivos_fisicos()


# =========================================================================
# 1. ALGORITMO DE DIEGO: MEZCLA NATURAL COMPLETA (Detección + Fusión 2-Vías)
# =========================================================================
def fusionar_dos_corridas_manual(corrida_a, corrida_b):
    """
    Fusiona dos corridas ordenadas (listas) en una sola corrida ordenada
    usando el algoritmo de dos punteros desde cero (sin sorted ni heapq).
    Retorna (corrida_fusionada, num_comparaciones).
    """
    resultado = []
    i = 0
    j = 0
    comps = 0
    len_a = len(corrida_a)
    len_b = len(corrida_b)

    # Invariante de fusión: resultado[0..k-1] contiene los menores elementos de A[0..i-1] U B[0..j-1]
    while i < len_a and j < len_b:
        comps += 1
        if corrida_a[i] <= corrida_b[j]:
            resultado.append(corrida_a[i])
            i += 1
        else:
            resultado.append(corrida_b[j])
            j += 1

    while i < len_a:
        resultado.append(corrida_a[i])
        i += 1

    while j < len_b:
        resultado.append(corrida_b[j])
        j += 1

    return resultado, comps


def aplanar_corridas(lista_corridas):
    """Concatena manualmente una lista de corridas para reconstruir la cinta."""
    cinta = []
    for c in lista_corridas:
        for elem in c:
            cinta.append(elem)
    return cinta


def calcular_rupturas_desde_corridas(lista_corridas):
    """Calcula los índices exactos donde inicia cada nueva corrida en la cinta."""
    rupturas = []
    acumulado = 0
    for idx in range(len(lista_corridas) - 1):
        acumulado += len(lista_corridas[idx])
        rupturas.append(acumulado)
    return rupturas


def generar_pasos_mezcla_natural(arreglo, factor_b=2):
    """
    Ejecuta el algoritmo completo de Mezcla Natural desde cero:
      - FASE 1: Escaneo lineal O(N/B) detectando rupturas de orden (A[i] < A[i-1])
                para particionar el archivo en corridas naturales.
      - FASE 2: Pasadas sucesivas de fusión de 2 vías de corridas adyacentes
                hasta que todo el archivo queda en 1 sola corrida ordenada.
    """
    cinta = list(arreglo)
    n = len(cinta)
    pasos = []
    rupturas = []
    corridas_actuales = [[cinta[0]]] if n > 0 else []

    comparaciones = 0
    bloques_io = 1 if n > 0 else 0

    # Paso 0: Inicio Fase 1
    pasos.append({
        "paso": 0,
        "fase": "FASE 1 · DETECCIÓN",
        "estado": "INICIO",
        "cinta": list(cinta),
        "indice_actual": 0,
        "comparando": None,
        "rupturas": [],
        "corridas": [[cinta[0]]] if n > 0 else [],
        "comparaciones": 0,
        "accesos_io": bloques_io,
        "explicacion": (
            f"Inicio de Fase 1 (Detección de Corridas): Cabezal en índice [0] (valor {cinta[0]}). "
            f"Inaugura la Corrida #1."
        )
    })

    # -----------------------------------------------------------------
    # FASE 1: ESCANEO SECUENCIAL Y PARTICIÓN EN CORRIDAS NATURALES
    # -----------------------------------------------------------------
    for i in range(1, n):
        comparaciones += 1
        if i % factor_b == 0:
            bloques_io += 1

        actual = cinta[i]
        anterior = cinta[i - 1]
        # Invariante de corrida natural: A[i] >= A[i-1] preserva monotonía no decreciente
        es_ruptura = actual < anterior

        pasos.append({
            "paso": len(pasos),
            "fase": "FASE 1 · DETECCIÓN",
            "estado": "COMPARANDO",
            "cinta": list(cinta),
            "indice_actual": i,
            "comparando": [i - 1, i],
            "valores_comparados": [anterior, actual],
            "es_ruptura": es_ruptura,
            "rupturas": list(rupturas),
            "corridas": [list(c) for c in corridas_actuales],
            "comparaciones": comparaciones,
            "accesos_io": bloques_io,
            "explicacion": (
                f"Evaluando par adyacente A[{i}] ({actual}) vs A[{i - 1}] ({anterior}): "
                + (f"{actual} < {anterior} → ¡RUPTURA DE ORDEN! Se inserta frontera de corte."
                   if es_ruptura else f"{actual} >= {anterior} → Continúa la corrida actual.")
            )
        })

        if es_ruptura:
            rupturas.append(i)
            corridas_actuales.append([actual])
        else:
            corridas_actuales[-1].append(actual)

        pasos.append({
            "paso": len(pasos),
            "fase": "FASE 1 · DETECCIÓN",
            "estado": "CORTE_DETECTADO" if es_ruptura else "EXTENDIENDO",
            "cinta": list(cinta),
            "indice_actual": i,
            "comparando": None,
            "es_ruptura": es_ruptura,
            "rupturas": list(rupturas),
            "corridas": [list(c) for c in corridas_actuales],
            "comparaciones": comparaciones,
            "accesos_io": bloques_io,
            "explicacion": (
                f"Frontera registrada en índice [{i}]. El registro {actual} inicia la Corrida #{len(corridas_actuales)}."
                if es_ruptura else
                f"Registro {actual} anexado a la Corrida #{len(corridas_actuales)}: {corridas_actuales[-1]}."
            )
        })

    # -----------------------------------------------------------------
    # FASE 2: FUSIÓN ITERATIVA DE CORRIDAS ADYACENTES (SIN ATACOS STDLIB)
    # -----------------------------------------------------------------
    num_pasada = 1
    while len(corridas_actuales) > 1:
        nuevas_corridas = []
        idx_c = 0
        while idx_c < len(corridas_actuales):
            if idx_c + 1 < len(corridas_actuales):
                c_izq = corridas_actuales[idx_c]
                c_der = corridas_actuales[idx_c + 1]
                fusionada, comps_merge = fusionar_dos_corridas_manual(c_izq, c_der)
                comparaciones += comps_merge
                # Costo E/S de leer y escribir los bloques fusionados
                elementos_involucrados = len(c_izq) + len(c_der)
                bloques_io += (elementos_involucrados + factor_b - 1) // factor_b

                nuevas_corridas.append(fusionada)

                # Construir estado intermedio de las corridas tras esta fusión parcial
                vista_corridas = list(nuevas_corridas) + [list(x) for x in corridas_actuales[idx_c + 2:]]
                cinta_actualizada = aplanar_corridas(vista_corridas)
                rupturas_actualizadas = calcular_rupturas_desde_corridas(vista_corridas)

                pasos.append({
                    "paso": len(pasos),
                    "fase": f"FASE 2 · FUSIÓN (PASADA {num_pasada})",
                    "estado": "FUSIONANDO",
                    "cinta": cinta_actualizada,
                    "indice_actual": n - 1,
                    "comparando": None,
                    "rupturas": rupturas_actualizadas,
                    "corridas": vista_corridas,
                    "comparaciones": comparaciones,
                    "accesos_io": bloques_io,
                    "explicacion": (
                        f"Pasada de Fusión #{num_pasada}: Mezclando {c_izq} + {c_der} → {fusionada} "
                        f"({comps_merge} comparaciones con dos punteros)."
                    )
                })
                idx_c += 2
            else:
                # Corrida impar pasa intacta a la siguiente pasada
                nuevas_corridas.append(corridas_actuales[idx_c])
                idx_c += 1

        corridas_actuales = nuevas_corridas
        num_pasada += 1

    # Paso Final: Archivo completamente ordenado en 1 sola corrida
    cinta_final = aplanar_corridas(corridas_actuales)
    pasos.append({
        "paso": len(pasos),
        "fase": "COMPLETADO",
        "estado": "FINALIZADO",
        "cinta": cinta_final,
        "indice_actual": n - 1,
        "comparando": None,
        "rupturas": [],
        "corridas": [list(c) for c in corridas_actuales],
        "comparaciones": comparaciones,
        "accesos_io": bloques_io,
        "explicacion": (
            f"Mezcla Natural completada: Queda 1 única corrida ordenada {cinta_final} "
            f"tras {comparaciones} comparaciones y {bloques_io} operaciones de bloque E/S."
        )
    })

    return pasos


# =========================================================================
# 2. ALGORITMO DE DYLAN: ESCANEO SECUENCIAL REAL DESDE ARCHIVO EN DISCO
# =========================================================================
def parsear_linea_empleado_manual(linea_texto, offset_idx):
    """
    Parsea manualmente una línea 'id|clave|depto|tam' sin usar csv.reader.
    """
    limpia = linea_texto.strip()
    campos = []
    actual = ""
    for ch in limpia:
        if ch == "|":
            campos.append(actual)
            actual = ""
        else:
            actual += ch
    campos.append(actual)

    return {
        "offset": offset_idx,
        "id": int(campos[0]),
        "clave": campos[1],
        "depto": campos[2],
        "tam_bytes": int(campos[3])
    }


def leer_bloque_fisico_disco(archivo_handle, factor_b, offset_base):
    """
    Lee físicamente hasta 'factor_b' registros consecutivos desde el descriptor
    de archivo abierto, simulando una transferencia de bloque Disco -> Buffer RAM.
    """
    bloque = []
    for k in range(factor_b):
        linea = archivo_handle.readline()
        if not linea:
            break
        reg = parsear_linea_empleado_manual(linea, offset_base + k)
        bloque.append(reg)
    return bloque


def generar_pasos_escaneo_secuencial(clave_buscada, factor_b=2, latencia_ms=8.2):
    """
    Abre el archivo físico real './datos/empleados.dat' y ejecuta el escaneo
    secuencial leyendo de B en B registros por cada operación física de E/S.
    """
    asegurar_archivos_fisicos()
    ruta_emp = os.path.join(DATOS_DIR, "empleados.dat")

    # Primero cargamos la vista general del disco para pintar el diagrama completo
    todos_los_registros = []
    with open(ruta_emp, "r", encoding="utf-8") as f_vista:
        idx_v = 0
        for lin in f_vista:
            if lin.strip():
                todos_los_registros.append(parsear_linea_empleado_manual(lin, idx_v))
                idx_v += 1

    pasos = []
    accesos_io = 0
    comparaciones_cpu = 0

    pasos.append({
        "paso": 0,
        "estado": "INICIO",
        "puntero": -1,
        "bloque_actual": -1,
        "rango_bloque": [],
        "registro_ram": None,
        "accesos_io": 0,
        "comparaciones_cpu": 0,
        "ahorro_real_x": 1.0,
        "tiempo_ms": 0.0,
        "explicacion": (
            f"Descriptor abierto en 'datos/empleados.dat'. Buscando clave \"{clave_buscada}\" "
            f"con factor de bloqueo B = {factor_b} registros/página."
        )
    })

    # Lectura real por bloques desde el archivo físico
    with open(ruta_emp, "r", encoding="utf-8") as f_disco:
        indice_bloque = 0
        offset_global = 0

        while True:
            bloque_cargado = leer_bloque_fisico_disco(f_disco, factor_b, offset_global)
            if not bloque_cargado:
                break

            accesos_io += 1
            rango_indices = [r["offset"] for r in bloque_cargado]
            ahorro_actual = round(max(1, comparaciones_cpu) / accesos_io, 2)

            # Paso de transferencia física DMA (Disco -> Buffer Pool RAM)
            pasos.append({
                "paso": len(pasos),
                "estado": "TRANSFERENCIA_IO",
                "puntero": rango_indices[0],
                "bloque_actual": indice_bloque,
                "rango_bloque": rango_indices,
                "registro_ram": bloque_cargado[0],
                "accesos_io": accesos_io,
                "comparaciones_cpu": comparaciones_cpu,
                "ahorro_real_x": ahorro_actual,
                "tiempo_ms": round(accesos_io * latencia_ms, 2),
                "explicacion": (
                    f"Syscall read_block(): Transferencia física E/S #{accesos_io}. "
                    f"Página #{indice_bloque} (registros {rango_indices[0]}..{rango_indices[-1]}) cargada en Buffer RAM."
                )
            })

            # Inspección en RAM de cada slot dentro del bloque recién cargado
            for slot_idx, reg in enumerate(bloque_cargado):
                comparaciones_cpu += 1
                ahorro_actual = round(comparaciones_cpu / accesos_io, 2)
                coincide = (reg["clave"].lower() == clave_buscada.strip().lower())

                if coincide:
                    pasos.append({
                        "paso": len(pasos),
                        "estado": "ENCONTRADO",
                        "puntero": reg["offset"],
                        "bloque_actual": indice_bloque,
                        "rango_bloque": rango_indices,
                        "registro_ram": reg,
                        "accesos_io": accesos_io,
                        "comparaciones_cpu": comparaciones_cpu,
                        "ahorro_real_x": ahorro_actual,
                        "tiempo_ms": round(accesos_io * latencia_ms, 2),
                        "explicacion": (
                            f"¡HIT EN RAM! Registro [{reg['offset']}] (ID {reg['id']}) == \"{clave_buscada}\". "
                            f"Realizadas {accesos_io} E/S de disco frente a {comparaciones_cpu} sin bloqueo (Ratio real: {ahorro_actual}x)."
                        )
                    })
                    return todos_los_registros, pasos
                else:
                    quedan_en_ram = (slot_idx + 1 < len(bloque_cargado))
                    pasos.append({
                        "paso": len(pasos),
                        "estado": "DESCARTADO",
                        "puntero": reg["offset"],
                        "bloque_actual": indice_bloque,
                        "rango_bloque": rango_indices,
                        "registro_ram": reg,
                        "accesos_io": accesos_io,
                        "comparaciones_cpu": comparaciones_cpu,
                        "ahorro_real_x": ahorro_actual,
                        "tiempo_ms": round(accesos_io * latencia_ms, 2),
                        "explicacion": (
                            f"ALU compara Slot[{slot_idx}]: \"{reg['clave']}\" != \"{clave_buscada}\". "
                            + ("Cache Hit para el siguiente registro: ya reside en el Buffer Pool (0 E/S adicionales)."
                               if quedan_en_ram else "Fin de página en RAM: el próximo registro provocará un Cache Miss (nueva E/S).")
                        )
                    })

            offset_global += len(bloque_cargado)
            indice_bloque += 1

    # Caso peor: EOF alcanzado sin encontrar la clave
    ahorro_final = round(comparaciones_cpu / max(1, accesos_io), 2)
    pasos.append({
        "paso": len(pasos),
        "estado": "NO_ENCONTRADO",
        "puntero": len(todos_los_registros) - 1,
        "bloque_actual": indice_bloque - 1,
        "rango_bloque": [],
        "registro_ram": None,
        "accesos_io": accesos_io,
        "comparaciones_cpu": comparaciones_cpu,
        "ahorro_real_x": ahorro_final,
        "tiempo_ms": round(accesos_io * latencia_ms, 2),
        "explicacion": (
            f"EOF alcanzado en 'empleados.dat' tras {accesos_io} lecturas de bloque ({comparaciones_cpu} comparaciones). "
            f"La clave \"{clave_buscada}\" no existe."
        )
    })
    return todos_los_registros, pasos


# =========================================================================
# 3. ALGORITMO DE MAURO: SEEK, READ Y TELL REALES CON SOPORTE WHENCE (0,1,2)
# =========================================================================
# Secuencia inicial alineada con el experimento del profesor + demostración de whence
OPERACIONES_SEEK_DEFAULT = [
    {"tipo": "INIT", "arg": None, "whence": 0},
    {"tipo": "TELL", "arg": None, "whence": 0},
    {"tipo": "READ", "arg": 10,   "whence": 0},
    {"tipo": "TELL", "arg": None, "whence": 0},
    {"tipo": "SEEK", "arg": 0,    "whence": 0},
    {"tipo": "SEEK", "arg": 28,   "whence": 0},
    {"tipo": "READ", "arg": 8,    "whence": 0},
    {"tipo": "SEEK", "arg": 1,    "whence": 1},
    {"tipo": "READ", "arg": 13,   "whence": 0},
    {"tipo": "SEEK", "arg": -6,   "whence": 2},
    {"tipo": "READ", "arg": 6,    "whence": 0},
]

NOMBRES_WHENCE = {
    0: "SEEK_SET (0: desde inicio)",
    1: "SEEK_CUR (1: desde pos actual)",
    2: "SEEK_END (2: desde final EOF)"
}


def generar_pasos_seek_tell(operaciones):
    """
    Abre el archivo físico real './datos/archivo_secuencial.txt' en modo binario ('rb')
    y ejecuta las llamadas verdaderas f.seek(offset, whence), f.read(n) y f.tell()
    del Sistema Operativo.
    """
    asegurar_archivos_fisicos()
    ruta_seek = os.path.join(DATOS_DIR, "archivo_secuencial.txt")

    with open(ruta_seek, "rb") as f_check:
        contenido_bytes = f_check.read()
    texto_ascii = contenido_bytes.decode("ascii")
    n_bytes = len(contenido_bytes)

    leidos_acumulados = []
    log_consola = []
    pasos = []

    with open(ruta_seek, "rb") as f:
        for idx, op in enumerate(operaciones):
            tipo = op["tipo"]
            arg = op.get("arg")
            whence = int(op.get("whence", 0))
            rango_actual = [-1, -1]
            complejidad = "O(1)"

            if tipo == "INIT":
                f.seek(0, os.SEEK_SET)
                pos_actual = f.tell()
                retorno_str = "fd = 3 (modo 'rb')"
                codigo = "f = open('datos/archivo_secuencial.txt', 'rb')"
                explicacion = (
                    f"Archivo físico abierto en modo binario exacto ({n_bytes} bytes). "
                    f"El kernel inicializa f_pos = {pos_actual}."
                )

            elif tipo == "TELL":
                pos_actual = f.tell()
                retorno_str = f"{pos_actual}"
                codigo = f"f.tell()  # -> {pos_actual}"
                log_consola.append({"cmd": "f.tell()", "res": f"{pos_actual}", "tipo": "TELL"})
                explicacion = (
                    f"f.tell() consulta en O(1) el campo f_pos del descriptor en el kernel: "
                    f"puntero en byte {pos_actual} (0x{pos_actual:02X})."
                )

            elif tipo == "SEEK":
                desplazamiento = int(arg) if arg is not None else 0
                pos_previa = f.tell()

                # Calcular destino seguro dentro de [0, n_bytes] para evitar OSError si el usuario pone un número negativo inválido
                if whence == os.SEEK_SET:
                    objetivo = max(0, min(desplazamiento, n_bytes))
                    f.seek(objetivo, os.SEEK_SET)
                elif whence == os.SEEK_CUR:
                    objetivo = max(0, min(pos_previa + desplazamiento, n_bytes))
                    f.seek(objetivo - pos_previa, os.SEEK_CUR)
                elif whence == os.SEEK_END:
                    objetivo = max(0, min(n_bytes + desplazamiento, n_bytes))
                    f.seek(objetivo - n_bytes, os.SEEK_END)
                else:
                    f.seek(max(0, min(desplazamiento, n_bytes)), os.SEEK_SET)

                pos_actual = f.tell()
                cmd_str = f"f.seek({desplazamiento})" if whence == 0 else f"f.seek({desplazamiento}, {whence})"
                retorno_str = f"{pos_actual}"
                codigo = f"{cmd_str}  # {NOMBRES_WHENCE.get(whence, 'SEEK_SET')}"
                log_consola.append({"cmd": cmd_str, "res": f"f_pos={pos_actual}", "tipo": "SEEK"})
                explicacion = (
                    f"{cmd_str} con {NOMBRES_WHENCE.get(whence)}: salta en O(1) del byte {pos_previa} "
                    f"al byte {pos_actual} sin transferencia de bloques."
                )

            elif tipo == "READ":
                cantidad = max(1, int(arg))
                ini = f.tell()
                datos_leidos = f.read(cantidad)
                pos_actual = f.tell()
                fin = pos_actual

                rango_actual = [ini, fin]
                for b in range(ini, fin):
                    if b not in leidos_acumulados:
                        leidos_acumulados.append(b)

                frag_str = datos_leidos.decode("ascii", errors="replace").replace("\n", "\\n")
                complejidad = "O(k)"
                retorno_str = f"\"{frag_str}\""
                cmd_str = f"f.read({cantidad})"
                codigo = f"f.read({cantidad})  # -> \"{frag_str}\""
                log_consola.append({"cmd": cmd_str, "res": f"\"{frag_str}\"", "tipo": "READ"})
                explicacion = (
                    f"f.read({cantidad}) consume {fin - ini} bytes reales desde el offset {ini} "
                    f"(\"{frag_str}\") y avanza f_pos a {pos_actual} bytes."
                )

            pasos.append({
                "paso": idx,
                "tipo": tipo,
                "codigo": codigo,
                "retorno": retorno_str,
                "cursor": pos_actual,
                "rango_actual": rango_actual,
                "leidos_acumulados": list(leidos_acumulados),
                "complejidad": complejidad,
                "log": [dict(x) for x in log_consola],
                "explicacion": explicacion
            })

    return texto_ascii, n_bytes, pasos


# =========================================================================
# ENDPOINTS FLASK
# =========================================================================
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/mezcla_natural", methods=["POST"])
def api_mezcla_natural():
    data = request.get_json(silent=True) or {}
    arreglo = data.get("datos", [3, 7, 9, 2, 5, 8, 1, 4, 6])
    arreglo = [int(x) for x in arreglo][:14]
    if len(arreglo) < 2:
        arreglo = [3, 7, 9, 2, 5, 8, 1, 4, 6]
    pasos = generar_pasos_mezcla_natural(arreglo)
    return jsonify({"datos": arreglo, "pasos": pasos})


@app.route("/api/escaneo_secuencial", methods=["POST"])
def api_escaneo_secuencial():
    data = request.get_json(silent=True) or {}
    clave = data.get("clave", "Beto")
    factor_b = int(data.get("factor_b", 2))
    latencia = float(data.get("latencia_ms", 8.2))
    registros, pasos = generar_pasos_escaneo_secuencial(clave, factor_b, latencia)
    return jsonify({
        "registros": registros,
        "clave": clave,
        "factor_b": factor_b,
        "pasos": pasos
    })


@app.route("/api/seek_tell", methods=["POST"])
def api_seek_tell():
    data = request.get_json(silent=True) or {}
    operaciones = data.get("operaciones", OPERACIONES_SEEK_DEFAULT)
    texto, total_bytes, pasos = generar_pasos_seek_tell(operaciones)
    return jsonify({
        "texto": texto,
        "total_bytes": total_bytes,
        "pasos": pasos
    })


def abrir_navegador():
    webbrowser.open_new("http://127.0.0.1:5000")


if __name__ == "__main__":
    print("==========================================================")
    print("  SUITE VISUAL EDA II - SERVIDOR ACTIVO EN PUERTO 5000")
    print("  URL: http://127.0.0.1:5000")
    print("==========================================================")
    Timer(1.0, abrir_navegador).start()
    app.run(host="127.0.0.1", port=5000, debug=False)
