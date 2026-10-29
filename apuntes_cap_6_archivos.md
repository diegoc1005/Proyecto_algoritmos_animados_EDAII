# Capítulo 6: Archivos, Almacenamiento Externo y E/S
*Notas estructuradas basadas en el material del curso.*

## 1. Almacenamiento Externo
*   **Intuición:** La RAM es rápida pero volátil y limitada; el disco es lento pero grande y persistente.
*   **Jerarquía de Memoria:** CPU (~1ns) -> Caché (1-20ns) -> RAM (50-100ns) -> SSD (0.1ms) -> HDD (5-10ms).
*   **E/S (Entrada/Salida):** Se lee/escribe por **bloques** (típicamente 4KB), no por bytes sueltos.
*   **Secuencial vs Aleatorio:** Acceso secuencial amortiza el costo del `seek` (movimiento del cabezal). El aleatorio paga `seek` por cada acceso.
*   **Costo de E/S (Factor B):** Leer registro a registro cuesta $O(n)$. Leer por bloques (agrupando $B$ registros) cuesta $O(n/B)$. 
*   **Buffer Pool:** Caché en RAM para bloques de disco usando política de reemplazo LRU (Least Recently Used) para minimizar *misses*.

## 2. Archivos Secuenciales
*   **Escaneo:** Búsqueda lineal, $O(n/B)$ lecturas. 
*   **Puntero de Archivo:** Se maneja con `read()` (avanza el puntero), `seek(offset)` (salta $O(1)$) y `tell()` (reporta posición).
*   **Procesamiento por Chunks (Streaming):** Leer en fragmentos de tamaño fijo mantiene la memoria RAM en $O(1)$.

## 3. Archivos Indexados
*   **Concepto:** Estructura auxiliar que mapea llaves a posiciones físicas para evitar escaneos lineales. Reduce el tiempo a $O(1)$ (Hash) o $O(\log n)$ (Árboles B).
*   **Tipos de Índices:**
    *   *Primario:* Define el orden físico.
    *   *Secundario:* Campos no únicos, no altera orden físico.
    *   *Clustered:* Reordena registros contiguos físicamente.
    *   *Denso:* Una entrada por registro. / *Disperso:* Una por bloque.
*   **Árboles B en Disco:** Nodos anchos (una página por nodo) que minimizan la altura del árbol y por ende las lecturas a disco $O(\log_t n)$.

## 4. Archivos CSV
*   Formato tabular delimitado por comas. Primer fila: encabezados. Resto: registros por fila, campos por columna.

## 5. Ordenamiento Externo
*   **Objetivo:** Ordenar archivos que no caben en RAM minimizando pasadas de lectura/escritura ($O(2N/B)$ por pasada).
*   **Merge Sort Externo:** Fase 1 (crear corridas ordenadas internas en RAM) y Fase 2 (mezclar $k$-vías).
*   **Mezcla Natural:** Aprovecha el orden parcial escaneando y detectando "corridas naturales".
*   **Mezcla Polifase:** Distribuye corridas en $k$ cintas usando Fibonacci; optimiza rotando la cinta de salida.
*   **Ordenamiento por Distribución:** Particiona datos en rangos fijos (cubetas), ordena localmente y concatena $O(N/B)$.

## 6. Sistema de Archivos
*   **Asignación de Espacio:** Contigua (rápida, fragmentada), Enlazada (flexible, lenta en aleatorio), Indexada (Inodos, estándar moderno).
*   **RAID:** Nivel 0 (Striping/velocidad), Nivel 1 (Mirroring/redundancia), Nivel 5 (Paridad distribuida).
*   **Páginas de BD:** Bloques de 4-16KB con Header, Slot Directory y espacio libre al final para inserts.
*   **LFS (Log-Structured):** Escritura secuencial rápida (*append-only*). Las actualizaciones dejan basura que el *Garbage Collector* compacta.
*   **Compresión:** Trade-off donde se gasta CPU para ahorrar espacio físico y operaciones de E/S.