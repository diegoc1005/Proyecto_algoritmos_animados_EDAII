# Laboratorio Visual EDA II — Capítulo 6: Archivos y Almacenamiento Externo

Plataforma interactiva de visualización de algoritmos de almacenamiento externo desarrollada desde cero en Python para la materia de **Estructuras de Datos y Algoritmos II** (Facultad de Ingeniería, UNAM).

> **Restricción Estricta:** Implementación pura desde cero, sin utilizar funciones nativas de ordenamiento ni bibliotecas automáticas (`sorted()`, `list.sort()`, `heapq`, `bisect`, `csv.reader`).

---

## Equipo
1. **Diego Córdova García (`@diegocg1005`)** — Ordenamiento Externo (*Mezcla Natural*, *Merge Sort 2-Vías*, *Distribución por Cubetas*)
2. **Dylan Osvaldo García Rayón (`@Dylan0751`)** — Indexación y CSV (*Escaneo Secuencial*, *Índice Denso*, *Parseo Manual CSV*)
3. **Mauro Alexis Robles de la Rosa (`@Pikastroso`)** — Sistemas de Archivos (*Puntero `seek` y `tell`*, *Asignación en Disco*, *RAID 0 vs RAID 1*)

---

## Cómo Ejecutar

Desde la terminal en la carpeta del proyecto:

```powershell
py -3 app.py
```

*(Si el entorno no cuenta con `Flask`, `app.py` lo detecta, lo instala de manera automática y lanza el navegador web en `http://127.0.0.1:5000`).*

---

## Estructura del Proyecto
- `app.py`: Servidor Flask y motor de ejecución algorítmica paso a paso en Python puro.
- `templates/index.html`: Interfaz web interactiva con estética industrial, métricas de hardware y telemetría en tiempo real.
- `datos/`: Archivos físicos sobre los que se ejecutan las llamadas reales de E/S (`empleados.dat` y `archivo_secuencial.txt`).
- `apuntes_cap_6_archivos.md`: Notas teóricas sobre arquitectura de archivos y memoria secundaria.
- `asignaci_n_de_algoritmos.md`: Distribución de algoritmos y responsabilidades por semana.

---

## Explicación de los Algoritmos (Semana 1)

### 1. Mezcla Natural (*Natural Merge Sort*)
* **Responsable:** Diego Córdova García
* **Propósito:** Resolver el ordenamiento de grandes volúmenes de datos en memoria secundaria (donde el acceso aleatorio es costoso), minimizando el número de lecturas y escrituras al aprovechar el orden parcial que ya existe en los datos. A diferencia de la Mezcla Directa (que divide rígidamente en bloques de tamaño 1, 2, 4...), la Mezcla Natural adapta dinámicamente el tamaño de sus particiones a las secuencias preordenadas del archivo.
* **Mecánica Paso a Paso:**
  1. **Fase 1 (Detección de Tramos / *Runs*):** Se recorre el arreglo de izquierda a derecha. Mientras $A[i] \ge A[i-1]$, el elemento se mantiene en el tramo actual. En el momento en que se detecta una inversión ($A[i] < A[i-1]$), se realiza un corte lógico y comienza un nuevo tramo.
  2. **Fase 2 (Fusión Iterativa de 2 Vías):** Se emparejan tramos consecutivos (por ejemplo, Tramo 1 con Tramo 2). Mediante dos punteros de comparación directa ($p_1, p_2$), se extrae secuencialmente el menor elemento hacia un arreglo de salida sin recurrir a bibliotecas de ordenamiento. Si queda un tramo impar sin pareja al final de la ronda, pasa directo a la siguiente fase.
  3. **Convergencia:** Las rondas de fusión continúan hasta consolidar un único tramo que contiene toda la secuencia ordenada.
* **Complejidad:**
  - Mejor caso: $\mathcal{O}(N)$ si los datos ya están ordenados (un solo tramo detectado en una pasada).
  - Caso promedio y peor caso: $\mathcal{O}(N \log k)$, donde $k$ es el número de tramos naturales iniciales ($k \le N$).

---

### 2. Escaneo Secuencial por Bloques (*Sequential Block Scan*)
* **Responsable:** Dylan Osvaldo García Rayón
* **Propósito:** Modelar fielmente el funcionamiento de los controladores de disco y sistemas de archivos reales. Los dispositivos de almacenamiento secundario no transfieren bytes o registros aislados; transfieren **bloques físicos** (páginas de 512 B o 4 KB) hacia un búfer en memoria RAM (*Buffer Pool*).
* **Mecánica Paso a Paso:**
  1. **Lectura Física por Lotes:** Lee registros estructurados desde el archivo real [`datos/empleados.dat`](datos/empleados.dat) en bloques de $B$ registros por operación de E/S ($I/O$).
  2. **Búsqueda en Búfer de RAM:** Con el bloque cargado en memoria principal, la CPU examina secuencialmente cada registro buscando la coincidencia con la clave solicitada a velocidad de memoria electrónica.
  3. **Telemetría y Rendimiento:** Se calcula en tiempo real el ahorro de operaciones de disco comparando el costo de leer bloque por bloque vs. la lectura ingenua registro por registro:
     $$\text{Ahorro de E/S} = 1 - \frac{\text{Lecturas físicas con Bloques}}{\text{Lecturas requeridas sin Bloques}}$$
* **Complejidad de E/S:**
  - Costo de transferencia: $\mathcal{O}(\lceil N / B \rceil)$ lecturas de disco, reduciendo los accesos a disco por un factor proporcional al tamaño del bloque $B$.

---

### 3. Puntero de Archivo (`seek`, `read`, `tell`)
* **Responsable:** Mauro Alexis Robles de la Rosa
* **Propósito:** Comprender y visualizar el acceso directo y aleatorio a nivel de byte dentro de un archivo binario o de texto ([`datos/archivo_secuencial.txt`](datos/archivo_secuencial.txt)). Esta capacidad es el fundamento de los índices externos (árboles B+, hashing extensible) y archivos de acceso aleatorio.
* **Mecánica y Operaciones POSIX:**
  1. **`tell()`:** Informa la posición absoluta actual del cursor de lectura/escritura (en bytes desde el inicio).
  2. **`seek(offset, whence)`:** Reposiciona el cursor dentro del descriptor del archivo según los 3 modos estándar del sistema operativo:
     - `whence = 0` (`SEEK_SET`): Posición absoluta referenciada al byte 0 (inicio del archivo).
     - `whence = 1` (`SEEK_CUR`): Desplazamiento relativo respecto a la posición actual del cursor.
     - `whence = 2` (`SEEK_END`): Desplazamiento relativo respecto al final del archivo.
  3. **`read(n_bytes)`:** Lee un flujo contiguo de $n$ bytes a partir de la posición actual del puntero y avanza el cursor automáticamente en $n$ posiciones.
* **Protección de Límites (*Clamping Guard*):** Valida que las operaciones no intenten posicionar el cursor antes del byte 0 ni excedan el tamaño físico del archivo, emulando la robustez de un sistema de archivos real.
