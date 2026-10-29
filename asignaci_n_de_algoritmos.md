# Asignación de Algoritmos - Equipo EDA II

**Proyecto:** Visualización interactiva en Pygame de algoritmos de archivos (Capítulo 6).
**Regla Estricta:** No usar funciones nativas como `sorted()`, `list.sort()`, `heapq`, ni bibliotecas externas. Todo debe programarse desde cero.

## 1. Diego Córdova García (@diegocg1005) - Ordenamiento Externo
*   **Merge Sort Externo (Fase 2 - Mezcla de 2 vías):** Visualización de la fusión de dos arreglos previamente ordenados hacia un arreglo de salida vacío.
*   **Mezcla Natural:** Escaneo de un arreglo detectando rupturas de orden (marcador ✂️) para contabilizar corridas naturales.
*   **Ordenamiento por Distribución (Cubetas):** Animación de distribución de elementos a distintos sub-arreglos (cajas) según su valor lógico.

## 2. García Rayón Dylan Osvaldo (@Dylan0751) - Indexación y CSV
*   **Escaneo Secuencial:** Animación de un puntero que lee bloque por bloque (celda por celda) hasta hallar una clave.
*   **Búsqueda con Índice Denso:** Uso de un diccionario visual en pantalla que indica la posición exacta a saltar, evitando el escaneo.
*   **Parseo manual de CSV:** Animación de un lector que procesa una cadena de texto (*streaming*), detecta comas y va llenando una tabla 2D.

## 3. Robles de la Rosa Mauro Alexis (@Pikastroso) - Sistemas de Archivos
*   **Asignación de Espacio en Disco:** Interfaz que contraste visualmente llenar bloques contiguos vs enlazar bloques indexados esparcidos.
*   **Puntero de Archivo (`seek` y `tell`):** Texto o barra en pantalla donde un cursor avanza lentamente (`read`) o salta instantáneamente a un offset (`seek`).
*   **RAID 0 vs RAID 1:** Animación de cómo los datos entrantes se distribuyen intercalados (striping) o duplicados íntegramente (mirroring).