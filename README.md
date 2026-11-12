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
  - [`mezclaNatural.ts`](src/algorithms/mezclaNatural.ts): **(Semana 1)** Detección lineal de corridas naturales + fusión iterativa de 2 vías con dos punteros.
  - [`mergeSort2Vias.ts`](src/algorithms/mergeSort2Vias.ts): **(Semana 2)** Fusión clásica de dos cintas/archivos ordenados ($F_1$ y $F_2$) hacia una cinta de salida vacía ($F_0$) con telemetría de bloques E/S.
  - [`ordenamientoCubetas.ts`](src/algorithms/ordenamientoCubetas.ts): **(Semana 3)** Partición aritmética en $K$ cubetas por rango (*Scatter*), ordenamiento local en RAM (*Insertion Sort* manual) y concatenación directa (*Gather*).
  - [`escaneoSecuencial.ts`](src/algorithms/escaneoSecuencial.ts): **(Semana 1)** Parseo carácter por carácter y lectura por bloques físicos ($B$) hacia el *Buffer Pool* en RAM.
  - [`indiceDenso.ts`](src/algorithms/indiceDenso.ts): **(Semana 2)** Construcción de tabla de índice en RAM con búsqueda binaria $\mathcal{O}(\log N)$ y acceso directo a disco por offset.
  - [`parseoCSV.ts`](src/algorithms/parseoCSV.ts): **(Semana 3)** Máquina de estados finitos para análisis léxico de flujos CSV carácter por carácter con soporte de comillas.
  - [`punteroSeekTell.ts`](src/algorithms/punteroSeekTell.ts): **(Semana 1)** Emulador de descriptor binario de archivo (`Uint8Array`) con llamadas `seek(offset, whence)`, `read(n)` y `tell()`.
  - [`asignacionDisco.ts`](src/algorithms/asignacionDisco.ts): **(Semana 2)** Simulación de asignación Contigua, Enlazada e Indexada (Inodos) sobre bloques físicos.
  - [`raidSimulacion.ts`](src/algorithms/raidSimulacion.ts): **(Semana 3)** Simulador de controladora de hardware **RAID 0 (Striping)** vs **RAID 1 (Mirroring)** con prueba de tolerancia a fallos.
- `src/components/`: Componentes visuales en React (`MezclaView.tsx`, `MergeSort2ViasView.tsx`, `CubetasView.tsx`, `EscaneoView.tsx`, `IndiceDensoView.tsx`, `ParseoCSVView.tsx`, `SeekView.tsx`, `AsignacionDiscoView.tsx`, `RaidView.tsx`, `CodeTracerPanel.tsx`, `Sidebar.tsx`).
- `src/components/CodeTracerPanel.tsx`: **Trazador de Código en Vivo** redimensionable con el cursor que resalta en tiempo real la línea exacta de código (`►`) y el puntero de instrucción (`PC`) en cada paso de la animación.
- `src/types/algorithms.ts`: Interfaces y tipos estrictos de TypeScript para los estados y telemetría.
- `public/datos/`: Archivos físicos (`empleados.dat` y `archivo_secuencial.txt`) consumidos por la aplicación.
- `apuntes_cap_6_archivos.md`: Notas teóricas del Capítulo 6.
- `asignaci_n_de_algoritmos.md`: Asignación de temas y roles del equipo.

---

## Guía Didáctica de Algoritmos (Semanas 1, 2 y 3)

Esta sección está pensada para que cualquier estudiante pueda entender qué hace cada algoritmo, por qué existe y cómo funciona paso a paso.

---

### 1. Mezcla Natural (*Natural Merge Sort* - Semana 1)
* **Responsable:** Diego Córdova García (`src/algorithms/mezclaNatural.ts`)
* **Concepto Clave:** *Aprovechar el orden que ya existe por suerte.*

#### La Analogía de la Baraja y las Tijeras ✂️:
Caminas por la lista de izquierda a derecha. Mientras el siguiente número sea mayor o igual al actual, lo dejas en el mismo grupo. En cuanto se rompe el orden ($A[i] < A[i-1]$), cortas y formas una nueva corrida natural (*run*). Luego fusionas parejas de corridas de 2 en 2 hasta que quede una sola fila ordenada.

---

### 2. Merge Sort Externo: Mezcla de 2 Vías (*2-Way Run Merge* - Semana 2)
* **Responsable:** Diego Córdova García (`src/algorithms/mergeSort2Vias.ts`)
* **Concepto Clave:** *El corazón del ordenamiento en disco: fusionar dos flujos ordenados.*

#### ¿Qué problema resuelve?
En el ordenamiento externo, una vez que la memoria RAM particionó y ordenó bloques de datos en archivos auxiliares temporales (Cinta A / $F_1$ y Cinta B / $F_2$), se necesita un mecanismo para consolidarlos en un único archivo de salida (Cinta Salida / $F_0$) sin tener que cargar ambos archivos completos a la vez a la memoria RAM.

#### La Analogía de las Dos Filas de la Cafetería ☕:
Imagina dos filas de alumnos ordenados por estatura de menor a mayor:
* **Fila A:** `[2, 5, 8, 11, 14]`
* **Fila B:** `[1, 4, 7, 9, 12, 15]`

1. **Paso 1 — Comparar solo el frente de ambas filas:**  
   Miras al primero de la Fila A (`2`) y al primero de la Fila B (`1`).  
   ¿Quién es más bajo? El `1`. Entra a la cafetería (se escribe en $F_0$) y la Fila B avanza su turno.
2. **Paso 2 — Siguiente comparación:**  
   Ahora comparas al nuevo frente de B (`4`) contra el `2` de A. El `2` es menor, entra a la cafetería y avanza la Fila A.
3. **Paso 3 — Vaciar remanentes cuando una fila se acaba:**  
   Si la Fila A se queda sin alumnos primero, **ya no comparas nada**: dejas pasar a todos los que quedaron en la Fila B directamente en bloque, porque ya sabes que todos ellos son mayores que los que ya entraron.
4. **Costo de E/S por Bloques:**  
   Cada vez que un cabezal consume $B$ registros de una cinta, el sistema operativo lee un nuevo bloque físico de disco. Cada vez que la cinta de salida acumula $B$ registros, se vacía (*flush*) en bloque hacia el archivo final.

---

### 3. Ordenamiento por Distribución / Cubetas (*External Bucket Sort* - Semana 3)
* **Responsable:** Diego Córdova García (`src/algorithms/ordenamientoCubetas.ts`)
* **Concepto Clave:** *Divide por rangos aritméticos primero, ordena cajas pequeñas en RAM y concatena sin mezclar.*

#### ¿Qué problema resuelve?
Mientras que *Merge Sort* requiere múltiples pasadas de fusión comparando llaves ($\mathcal{O}(N \log N)$), el **Ordenamiento por Distribución** aprovecha el conocimiento del dominio de las claves (por ejemplo `[0..99]`) para particionar el archivo en $K$ sub-archivos o **cubetas** de rangos disjuntos en una sola lectura secuencial.

#### La Analogía del Correo Postal por Código Postal 📦:
1. **Fase 1 — Clasificación en Casilleros (*Scatter*):**  
   Llega un camión con cartas desordenadas del `0` al `99`. En lugar de compararlas todas entre sí, pones 4 cajas:
   * **Cubeta $B_0$:** `[0 – 24]`
   * **Cubeta $B_1$:** `[25 – 49]`
   * **Cubeta $B_2$:** `[50 – 74]`
   * **Cubeta $B_3$:** `[75 – 99]`  
   Calculas la caja destino en $\mathcal{O}(1)$ con la fórmula $b = \lfloor \frac{\text{valor} - \min}{\text{amplitud}} \rfloor$ y depositas cada carta en su caja.
2. **Fase 2 — Ordenamiento Interno en RAM (*Local Sort*):**  
   Cada caja ahora tiene muy pocos elementos y cabe holgadamente en memoria RAM, donde se ordena localmente con *Insertion Sort* manual.
3. **Fase 3 — Concatenación Directa (*Gather*):**  
   Como cualquier elemento de $B_0$ es menor que cualquiera de $B_1$, y así sucesivamente ($B_0 < B_1 < B_2 < B_3$), simplemente vacías las cajas en orden hacia la cinta de salida $F_0$ **sin hacer ni una sola comparación adicional entre cajas**.

---

### 4. Escaneo Secuencial por Bloques (*Sequential Block Scan* - Semana 1)
* **Responsable:** Dylan Osvaldo García Rayón (`src/algorithms/escaneoSecuencial.ts`)
* **Concepto Clave:** *No viajes al disco duro por cada registro; viaja en caja (Buffer).*
* Lee el archivo `empleados.dat` transfiriendo páginas de $B$ registros hacia el *Buffer Pool* en RAM, reduciendo los accesos a disco por un factor proporcional a $B$.

---

### 5. Búsqueda con Índice Denso (*Dense Index Binary Search* - Semana 2)
* **Responsable:** Dylan Osvaldo García Rayón (`src/algorithms/indiceDenso.ts`)
* **Concepto Clave:** *Tener un mapa ordenado en memoria para saltar directo a la dirección exacta.*
* **Mecánica:** Mantiene una tabla con una entrada por cada registro (`clave` y `offset`). Como las claves son mucho más pequeñas que los registros completos, la tabla cabe en RAM y se busca en $\mathcal{O}(\log N)$ con Búsqueda Binaria. Al hallar la clave, salta directamente al disco con un único acceso E/S al offset exacto.

---

### 6. Parseo Manual de CSV en Streaming (*Finite State Machine CSV Parser* - Semana 3)
* **Responsable:** Dylan Osvaldo García Rayón (`src/algorithms/parseoCSV.ts`)
* **Concepto Clave:** *Un autómata léxico que distingue comas separadoras de comas dentro de comillas.*
* Procesa carácter por carácter mediante 4 estados (`FUERA_CAMPO`, `EN_CAMPO_NORMAL`, `EN_CAMPO_COMILLAS`, `ESPERANDO_FIN_COMILLA`), construyendo una matriz 2D sin usar `.split()`.

---

### 7. Puntero de Archivo: `seek`, `read`, `tell` (Semana 1)
* **Responsable:** Mauro Alexis Robles de la Rosa (`src/algorithms/punteroSeekTell.ts`)
* **Concepto Clave:** *Mover tu dedo sobre un libro sin tener que leerlo todo.*
* Modela las primitivas POSIX sobre `Uint8Array`: `tell()` (consulta de posición), `read(n)` (lectura y avance) y `seek(offset, whence)` con modos `SEEK_SET`, `SEEK_CUR` y `SEEK_END`.

---

### 8. Asignación de Espacio en Disco: Contigua vs Enlazada vs Indexada (Semana 2)
* **Responsable:** Mauro Alexis Robles de la Rosa (`src/algorithms/asignacionDisco.ts`)
* **Concepto Clave:** *Cómo organiza el sistema operativo los bloques físicos de un archivo.*
* Contrasta la **Asignación Contigua** (rápida pero sufre fragmentación externa), la **Asignación Enlazada** (sin fragmentación externa pero lenta en acceso aleatorio por seguir punteros bloque a bloque) y la **Asignación Indexada / Inodo** (concentra todos los punteros en un bloque índice permitiendo acceso directo $\mathcal{O}(1)$ sin fragmentación externa).

---

### 9. Arquitectura RAID 0 (*Striping*) vs RAID 1 (*Mirroring*) (Semana 3)
* **Responsable:** Mauro Alexis Robles de la Rosa (`src/algorithms/raidSimulacion.ts`)
* **Concepto Clave:** *El dilema del almacenamiento en servidores: máxima velocidad/capacidad vs supervivencia ante fallas físicas.*
* **RAID 0 (*Striping*):** Intercala los bloques entre el Disco 0 (pares) y el Disco 1 (impares) mediante `disco = i mod 2`. Duplica la velocidad de transferencia y aprovecha el $100\%$ de la capacidad combinada, pero **no tiene redundancia**: si el Disco 1 falla, se pierde la mitad de los bloques y el archivo queda corrupto.
* **RAID 1 (*Mirroring*):** Escribe cada bloque de forma idéntica tanto en el Disco 0 como en el Disco 1 (Espejo). La capacidad útil es del $50\%$, pero ofrece **tolerancia total al fallo de un disco** (*failover* automático al disco sobreviviente).

---

### Resumen para el Examen / Preguntas del Profesor

| Pregunta del Profesor | Respuesta Clave |
| :--- | :--- |
| **¿En qué consiste la Mezcla de 2 Vías Externa?** | En combinar dos archivos o tramos previamente ordenados ($F_1$ y $F_2$) hacia un archivo de salida ($F_0$) leyendo secuencialmente mediante dos punteros y vaciando el remanente al final. |
| **¿Por qué la Mezcla de 2 Vías requiere $\mathcal{O}(N)$ comparaciones?** | Porque en cada comparación se coloca al menos un elemento en su posición definitiva en la salida, y cada elemento se evalúa a lo sumo una vez por pasada. |
| **¿Por qué en Ordenamiento por Cubetas la Fase 3 (Concatenación) no hace comparaciones entre cubetas?** | Porque las cubetas particionan el dominio en intervalos disjuntos y estrictamente crecientes ($B_0 < B_1 < \dots < B_{K-1}$); una vez ordenada cada cubeta en RAM, basta con adjuntarlas en orden. |
| **¿Qué ventaja tiene un Índice Denso frente al Escaneo Secuencial?** | El escaneo requiere recorrer en promedio $N/2$ registros en disco; el índice denso busca en RAM con Búsqueda Binaria $\mathcal{O}(\log N)$ y realiza una única operación de E/S al offset exacto. |
| **¿Qué diferencia crítica existe entre RAID 0 y RAID 1 cuando se avería un disco?** | En **RAID 0 (Striping)** se pierden todos los bloques alojados en ese disco y el archivo queda irrecuperable; en **RAID 1 (Mirroring)** la controladora redirige las lecturas al disco espejo sobreviviente sin perder datos. |
