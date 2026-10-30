# Laboratorio Visual EDA II — Capítulo 6: Archivos y Almacenamiento Externo

Plataforma interactiva de visualización de algoritmos de almacenamiento externo desarrollada desde cero en **React 18 + TypeScript + Vite** para la materia de **Estructuras de Datos y Algoritmos II** (Facultad de Ingeniería, UNAM).

> **Regla de Oro:** Implementación pura desde cero en TypeScript, sin utilizar funciones nativas de ordenamiento (`Array.prototype.sort()`) ni bibliotecas externas de ordenamiento o parseo CSV.

---

## Equipo
1. **Diego Córdova García (`@diegocg1005`)** — Ordenamiento Externo (*Mezcla Natural*, *Merge Sort 2-Vías*, *Distribución por Cubetas*)
2. **Dylan Osvaldo García Rayón (`@Dylan0751`)** — Indexación y CSV (*Escaneo Secuencial*, *Índice Denso*, *Parseo Manual CSV*)
3. **Mauro Alexis Robles de la Rosa (`@Pikastroso`)** — Sistemas de Archivos (*Puntero `seek` y `tell`*, *Asignación en Disco*, *RAID 0 vs RAID 1*)

---

## Cómo Ejecutar (React + TypeScript)

Desde la terminal en la carpeta del proyecto:

```powershell
npm install
npm run dev
```

*(Vite compilará el proyecto en TypeScript y abrirá automáticamente el navegador en `http://127.0.0.1:5173`).*

Para compilar la versión de producción y verificar tipos:
```powershell
npm run build
```

---

## Estructura del Proyecto
- `src/algorithms/`: Implementación pura en TypeScript desde cero de cada algoritmo:
  - [`mezclaNatural.ts`](src/algorithms/mezclaNatural.ts): Detección lineal de corridas naturales + fusión iterativa de 2 vías con dos punteros.
  - [`escaneoSecuencial.ts`](src/algorithms/escaneoSecuencial.ts): Parseo carácter por carácter y lectura por bloques físicos ($B$) hacia el *Buffer Pool* en RAM.
  - [`punteroSeekTell.ts`](src/algorithms/punteroSeekTell.ts): Emulador de descriptor binario de archivo (`Uint8Array`) con llamadas `seek(offset, whence)`, `read(n)` y `tell()`.
- `src/components/`: Componentes visuales en React (`MezclaView.tsx`, `EscaneoView.tsx`, `SeekView.tsx`, `Sidebar.tsx`).
- `src/types/algorithms.ts`: Interfaces y tipos estrictos de TypeScript para los estados y telemetría.
- `public/datos/`: Archivos físicos (`empleados.dat` y `archivo_secuencial.txt`) consumidos por la aplicación.
- `apuntes_cap_6_archivos.md`: Notas teóricas del Capítulo 6.
- `asignaci_n_de_algoritmos.md`: Asignación de temas y roles del equipo.

---

## Guía Didáctica de Algoritmos (Semana 1)

Esta sección está pensada para que cualquier estudiante pueda entender qué hace cada algoritmo, por qué existe y cómo funciona paso a paso.

---

### 1. Mezcla Natural (*Natural Merge Sort*)
* **Responsable:** Diego Córdova García (`src/algorithms/mezclaNatural.ts`)
* **Concepto Clave:** *Aprovechar el orden que ya existe por suerte.*

#### ¿Qué problema resuelve?
Imagina que tienes un archivo de 50 GB con calificaciones y tu computadora solo tiene 8 GB de RAM. No puedes cargar todo el archivo a la memoria para ordenarlo con QuickSort. Tienes que ordenarlo en el disco duro poco a poco.
* La **Mezcla Directa** divide rígidamente la lista en pedacitos de tamaño fijo (de 1 en 1, luego de 2 en 2, luego de 4 en 4...), ignorando si los datos ya venían medio ordenados.
* La **Mezcla Natural** es más inteligente: revisa la lista y busca pedazos que **ya estén ordenados de forma natural**.

#### La Analogía de la Baraja y las Tijeras ✂️:
Imagina que te reparten estos números:  
`[3, 7, 9,   2, 8,   1, 4, 6]`

1. **Paso 1 — Encontrar los Tramos (*Runs*):**  
   Caminas por la lista de izquierda a derecha. Mientras el siguiente número sea mayor o igual al actual, lo dejas en el mismo grupo:
   * Empiezas con `[3, 7, 9]`. El siguiente es `2` (¡se rompió el orden!). Haces un corte con tijeras ✂️.
   * El segundo grupo es `[2, 8]`. El siguiente es `1` (¡se rompió el orden!). Otro corte ✂️.
   * El tercer grupo es `[1, 4, 6]`.
   
   Resultado de la Fase 1: te quedan 3 tramos ordenados:  
   `Tramo A: [3, 7, 9]` | `Tramo B: [2, 8]` | `Tramo C: [1, 4, 6]`

2. **Paso 2 — Fusión de 2 Vías (*Merge*):**  
   Tomas parejas de tramos (ej. Tramo A y Tramo B) y los unes como si formaras una fila por estaturas:
   * Miras el frente de A (`3`) y el frente de B (`2`). ¿Quién es menor? El `2`. Lo mandas a la salida.
   * Ahora comparas `3` con `8`. ¿Quién es menor? El `3`. Lo mandas a la salida.
   * Ahora comparas `7` con `8`. Sale el `7`.
   * Ahora comparas `9` con `8`. Sale el `8`.
   * Finalmente sale el `9`.
   
   Resultado: `[2, 3, 7, 8, 9]`. ¡Ese nuevo tramo gigante ya está perfectamente ordenado!
3. **Paso 3 — Repetir:**  
   Se repite uniendo este resultado con el `Tramo C` hasta que **solo quede un único tramo final** con todos los elementos ordenados.

#### ¿Por qué es rápido?
Si la lista ya venía casi ordenada, solo detectará 1 o 2 tramos y terminará en una sola pasada ($\mathcal{O}(N)$), ahorrándole a la computadora horas de lectura y escritura en disco.

---

### 2. Escaneo Secuencial por Bloques (*Sequential Block Scan*)
* **Responsable:** Dylan Osvaldo García Rayón (`src/algorithms/escaneoSecuencial.ts`)
* **Concepto Clave:** *No viajes al disco duro por cada cosita; viaja en caja (Buffer).*

#### ¿Qué problema resuelve?
El procesador y la memoria RAM son millones de veces más veloces que un disco duro o SSD.  
Hacer una llamada al disco para leer **1 solo registro** toma mucho tiempo. Si un archivo tiene 1,000 registros y haces 1,000 llamadas al disco, el sistema se satura por culpa del cuello de botella de Entrada/Salida (E/S).

#### La Analogía de las Bolsas del Súper 📦:
Imagina que compraste 20 botellas de refresco y están en la cajuela de tu coche (el **disco duro**):
* **Método Ingenuo (registro por registro):**
  Vas al coche, agarras 1 botella, caminas hasta la cocina (la **RAM**), la revisas. No es la que buscas. Vuelves a caminar a la cajuela por la segunda... ¡Tuviste que dar **20 viajes caminando**!
* **Método por Bloques ($B = 4$):**
  Llevas una **caja** a la cajuela y metes 4 botellas juntas. En **1 solo viaje**, trajiste 4 botellas a la cocina. En la mesa de la cocina revisas las 4 en 2 segundos. Solo hiciste **5 viajes al coche**.

#### Cómo funciona en nuestro código:
1. El programa lee el archivo [`public/datos/empleados.dat`](public/datos/empleados.dat).
2. Transfiere un bloque completo de $B$ empleados a la vez (por ejemplo 2 o 4 registros) y lo guarda temporalmente en un **Buffer en RAM**.
3. Busca en memoria si el empleado que buscas está dentro de ese bloque.
4. Si no está, pide el siguiente bloque al disco.
5. **Métrica de Ahorro:** Calculamos el factor de ahorro de viajes al disco:
   $$\text{Ratio de Ahorro E/S} = \frac{\text{Inspecciones en RAM}}{\text{Transferencias Físicas de Bloque}}$$

---

### 3. Puntero de Archivo: `seek`, `read`, `tell`
* **Responsable:** Mauro Alexis Robles de la Rosa (`src/algorithms/punteroSeekTell.ts`)
* **Concepto Clave:** *Mover tu dedo sobre un libro sin tener que leerlo todo.*

#### ¿Qué problema resuelve?
Cuando abres un archivo de texto o binario (como [`public/datos/archivo_secuencial.txt`](public/datos/archivo_secuencial.txt)), la computadora tiene una aguja o cursor imaginario que apunta a un byte específico.  
Si tienes un archivo de 2 millones de caracteres y necesitas leer el carácter número 1,500,000, sería absurdo leer los primeros 1,499,999 caracteres uno por uno. Lo que quieres es **saltar directamente ahí**.

#### La Analogía del Libro con el Dedo Índice 👆:
Imagina una línea de texto guardada en el disco:  
`[E, D, A,  , I, I,  , 2, 0, 2, 6]`  
Cada letra tiene un número de byte (la posición 0, 1, 2, 3...).

Las 3 funciones básicas son:
1. **`tell()` — ¿En qué letra tengo el dedo puesto ahorita?**  
   Simplemente te dice la posición actual del cursor (`f_pos`).
2. **`read(n)` — Lee $n$ letras y avanza el dedo:**  
   Lee las siguientes $n$ letras a partir de donde estés y mueve tu dedo $n$ posiciones hacia adelante.
3. **`seek(offset, whence)` — Teletransporta el dedo:**  
   Mueve el cursor a donde le digas, usando 3 modos (`whence`):
   * **Modo 0 (`SEEK_SET`): Desde el inicio del archivo.**  
     `seek(5, 0)` pone el cursor exactamente en el byte 5 desde el principio.
   * **Modo 1 (`SEEK_CUR`): Desde donde estás ahorita.**  
     Si estabas en el byte 4 y ejecutas `seek(3, 1)`, el cursor se mueve 3 lugares hacia adelante (queda en el byte 7). Si pones un número negativo, retrocede.
   * **Modo 2 (`SEEK_END`): Desde el final del archivo.**  
     `seek(-4, 2)` coloca el cursor 4 bytes antes de que termine el archivo (útil para leer el final sin saber cuánto mide el archivo).

#### Seguridad implementada (*Clamping Guard*):
Si intentas hacer un `seek(-50)` hacia atrás del inicio o un `seek(9999)` más allá del final del archivo, el descriptor en TypeScript frena el puntero en los límites legales (byte `0` o `EOF`), evitando desbordamientos de memoria.

---

### Resumen para el Examen / Preguntas del Profesor

| Pregunta del Profesor | Respuesta Clave |
| :--- | :--- |
| **¿Por qué Mezcla Natural y no Mezcla Directa?** | Porque la Mezcla Natural detecta tramos que ya vienen ordenados (*runs*). En el mejor caso cuesta $\mathcal{O}(N)$, mientras que la directa siempre parte rígidamente y cuesta $\mathcal{O}(N \log N)$. |
| **¿Por qué leer por bloques en Escaneo Secuencial?** | Porque los discos leen por páginas físicas. Agrupar registros en un *Buffer* de RAM reduce drásticamente las operaciones lentas de E/S ($\lceil N/B \rceil$). |
| **¿Qué diferencia hay entre `seek(0, 0)` y `seek(0, 2)`?** | `seek(0, 0)` rebobina el archivo al primer byte (inicio), mientras que `seek(0, 2)` va al último byte (final). |
