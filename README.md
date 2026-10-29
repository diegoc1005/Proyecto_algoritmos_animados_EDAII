# Laboratorio Visual EDA II — Capítulo 6: Archivos y Almacenamiento Externo

Plataforma interactiva de visualización de algoritmos de almacenamiento externo desarrollada desde cero en Python (cumpliendo la restricción estricta sin `sorted()`, `list.sort()`, `heapq` ni `csv.reader`).

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

*(Si la computadora no tiene `flask` instalado, `app.py` lo instala automáticamente y abre el navegador en `http://127.0.0.1:5000`).*

---

## Estructura del Proyecto
- `app.py`: Servidor y motor algorítmico en Python puro con las máquinas de estado paso a paso.
- `templates/index.html`: Interfaz web interactiva con telemetría en tiempo real.
- `datos/`: Archivos físicos reales (`empleados.dat` y `archivo_secuencial.txt`) sobre los que operan las llamadas de E/S.
