# Asignación de Algoritmos - Equipo EDA II

**Proyecto:** Visualización interactiva en **React + TypeScript** de algoritmos de archivos (Capítulo 6).
**Regla Estricta:** No usar funciones nativas como `Array.prototype.sort()` ni bibliotecas externas de ordenamiento o CSV. Todo debe programarse desde cero en TypeScript puro.

## 1. Diego Córdova García (@diegocg1005) - Ordenamiento Externo
*   **Merge Sort Externo (Fase 2 - Mezcla de 2 vías):** Visualización de la fusión de dos arreglos previamente ordenados hacia un arreglo de salida vacío.
*   **Mezcla Natural:** Escaneo de un arreglo detectando rupturas de orden (marcador ✂️) para contabilizar corridas naturales y fusionarlas en pasadas sucesivas.
*   **Ordenamiento por Distribución (Cubetas):** Animación de distribución de elementos a distintos sub-arreglos (cajas) según su valor lógico.

## 2. García Rayón Dylan Osvaldo (@Dylan0751) - Indexación y CSV
*   **Escaneo Secuencial:** Animación de un puntero que lee bloque por bloque (página por página hacia un Buffer Pool en RAM) hasta hallar una clave.
*   **Búsqueda con Índice Denso:** Uso de un diccionario visual en pantalla que indica la posición exacta a saltar, evitando el escaneo.
*   **Parseo manual de CSV:** Animación de un lector que procesa una cadena de texto (*streaming*), detecta comas y va llenando una tabla 2D.

## 3. Robles de la Rosa Mauro Alexis (@Pikastroso) - Sistemas de Archivos
*   **Asignación de Espacio en Disco:** Interfaz que contraste visualmente llenar bloques contiguos vs enlazar bloques indexados esparcidos.
*   **Puntero de Archivo (`seek` y `tell`):** Flujo de bytes en pantalla donde un cursor avanza (`read`) o salta instantáneamente a un offset (`seek` con soporte `whence`: `SEEK_SET`, `SEEK_CUR`, `SEEK_END`).
*   **RAID 0 vs RAID 1:** Animación de cómo los datos entrantes se distribuyen intercalados (striping) o duplicados íntegramente (mirroring).
