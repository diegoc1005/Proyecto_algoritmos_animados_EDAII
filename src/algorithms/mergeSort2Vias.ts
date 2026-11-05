import { StepMerge2Vias } from '../types/algorithms';

/**
 * MERGE SORT EXTERNO: FASE 2 - MEZCLA DE 2 VÍAS (2-WAY RUN MERGE)
 * Responsable: Diego Córdova García (@diegocg1005)
 * 
 * Regla Estricta: Implementación pura desde cero en TypeScript.
 * CERO uso de Array.prototype.sort(), heapq ni librerías externas.
 * 
 * Modela el proceso físico en almacenamiento externo:
 * - Dos archivos auxiliares previamente ordenados en memoria secundaria (Cinta A / F1 y Cinta B / F2).
 * - Dos cabezales/punteros de lectura en RAM (punteroA y punteroB).
 * - Comparación elemento a elemento eligiendo el menor hacia el buffer de salida (Cinta Salida / F0).
 * - Volcado en bloque del remanente de la cinta que no se agotó.
 * - Conteo exacto de lecturas y escrituras físicas por bloques I/O (factor B).
 */

function clonarArreglo(arr: number[]): number[] {
  const copia: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    copia.push(arr[i]);
  }
  return copia;
}

/**
 * Ordena manualmente un arreglo mediante inserción simple,
 * garantizando que las dos cintas de entrada siempre inicien ordenadas
 * SIN invocar Array.prototype.sort().
 */
export function asegurarArregloOrdenadoManual(arr: number[]): number[] {
  const res = clonarArreglo(arr);
  for (let i = 1; i < res.length; i++) {
    const val = res[i];
    let j = i - 1;
    while (j >= 0 && res[j] > val) {
      res[j + 1] = res[j];
      j--;
    }
    res[j + 1] = val;
  }
  return res;
}

export function generarPasosMerge2Vias(
  datosA: number[],
  datosB: number[],
  factorB: number = 2
): StepMerge2Vias[] {
  const cintaA = asegurarArregloOrdenadoManual(datosA);
  const cintaB = asegurarArregloOrdenadoManual(datosB);
  const cintaSalida: number[] = [];
  const pasos: StepMerge2Vias[] = [];

  let pA = 0;
  let pB = 0;
  let comparaciones = 0;
  let lecturasIo = 0;
  let escriturasIo = 0;

  // Si ambas cintas tienen datos, se realiza al menos 1 lectura inicial por bloque en cada cinta
  if (cintaA.length > 0) lecturasIo += 1;
  if (cintaB.length > 0) lecturasIo += 1;

  // Paso 0: Estado inicial de las 3 cintas
  pasos.push({
    paso: 0,
    estado: 'INICIO',
    cintaA: clonarArreglo(cintaA),
    cintaB: clonarArreglo(cintaB),
    cintaSalida: [],
    punteroA: 0,
    punteroB: 0,
    elementoSeleccionado: null,
    comparaciones: 0,
    accesos_io_lectura: lecturasIo,
    accesos_io_escritura: 0,
    explicacion: `Inicio de Mezcla de 2 Vías Externa: Cinta A (${cintaA.length} registros) y Cinta B (${cintaB.length} registros) cargadas en cabezales. Cinta de Salida vacía.`
  });

  // Bucle principal: Comparación con dos punteros
  while (pA < cintaA.length && pB < cintaB.length) {
    const valA = cintaA[pA];
    const valB = cintaB[pB];
    comparaciones += 1;

    // Paso de comparación en ALU
    pasos.push({
      paso: pasos.length,
      estado: 'COMPARANDO',
      cintaA: clonarArreglo(cintaA),
      cintaB: clonarArreglo(cintaB),
      cintaSalida: clonarArreglo(cintaSalida),
      punteroA: pA,
      punteroB: pB,
      elementoSeleccionado: null,
      comparaciones,
      accesos_io_lectura: lecturasIo,
      accesos_io_escritura: escriturasIo,
      explicacion: `Comparando cabezales: Cinta A[${pA}] = ${valA} vs Cinta B[${pB}] = ${valB}. ${valA <= valB ? `${valA} ≤ ${valB} → Seleccionado elemento de Cinta A.` : `${valB} < ${valA} → Seleccionado elemento de Cinta B.`}`
    });

    if (valA <= valB) {
      cintaSalida.push(valA);
      if (cintaSalida.length % factorB === 0) {
        escriturasIo += 1;
      }
      pA += 1;
      if (pA < cintaA.length && pA % factorB === 0) {
        lecturasIo += 1;
      }

      pasos.push({
        paso: pasos.length,
        estado: 'EMITIENDO_A',
        cintaA: clonarArreglo(cintaA),
        cintaB: clonarArreglo(cintaB),
        cintaSalida: clonarArreglo(cintaSalida),
        punteroA: pA,
        punteroB: pB,
        elementoSeleccionado: { valor: valA, origen: 'A' },
        comparaciones,
        accesos_io_lectura: lecturasIo,
        accesos_io_escritura: escriturasIo,
        explicacion: `Valor ${valA} transferido de Cinta A al Buffer de Salida. Cabezal A avanza a posición [${pA}].`
      });
    } else {
      cintaSalida.push(valB);
      if (cintaSalida.length % factorB === 0) {
        escriturasIo += 1;
      }
      pB += 1;
      if (pB < cintaB.length && pB % factorB === 0) {
        lecturasIo += 1;
      }

      pasos.push({
        paso: pasos.length,
        estado: 'EMITIENDO_B',
        cintaA: clonarArreglo(cintaA),
        cintaB: clonarArreglo(cintaB),
        cintaSalida: clonarArreglo(cintaSalida),
        punteroA: pA,
        punteroB: pB,
        elementoSeleccionado: { valor: valB, origen: 'B' },
        comparaciones,
        accesos_io_lectura: lecturasIo,
        accesos_io_escritura: escriturasIo,
        explicacion: `Valor ${valB} transferido de Cinta B al Buffer de Salida. Cabezal B avanza a posición [${pB}].`
      });
    }
  }

  // Volcado de remanentes en Cinta A si B terminó primero
  while (pA < cintaA.length) {
    const valRemA = cintaA[pA];
    cintaSalida.push(valRemA);
    if (cintaSalida.length % factorB === 0) {
      escriturasIo += 1;
    }
    pA += 1;
    if (pA < cintaA.length && pA % factorB === 0) {
      lecturasIo += 1;
    }

    pasos.push({
      paso: pasos.length,
      estado: 'VACIANDO_RESTANTE_A',
      cintaA: clonarArreglo(cintaA),
      cintaB: clonarArreglo(cintaB),
      cintaSalida: clonarArreglo(cintaSalida),
      punteroA: pA,
      punteroB: pB,
      elementoSeleccionado: { valor: valRemA, origen: 'A' },
      comparaciones,
      accesos_io_lectura: lecturasIo,
      accesos_io_escritura: escriturasIo,
      explicacion: `Cinta B agotada (EOF). Vaciando remanente ${valRemA} de Cinta A directamente a la salida (0 comparaciones adicionales).`
    });
  }

  // Volcado de remanentes en Cinta B si A terminó primero
  while (pB < cintaB.length) {
    const valRemB = cintaB[pB];
    cintaSalida.push(valRemB);
    if (cintaSalida.length % factorB === 0) {
      escriturasIo += 1;
    }
    pB += 1;
    if (pB < cintaB.length && pB % factorB === 0) {
      lecturasIo += 1;
    }

    pasos.push({
      paso: pasos.length,
      estado: 'VACIANDO_RESTANTE_B',
      cintaA: clonarArreglo(cintaA),
      cintaB: clonarArreglo(cintaB),
      cintaSalida: clonarArreglo(cintaSalida),
      punteroA: pA,
      punteroB: pB,
      elementoSeleccionado: { valor: valRemB, origen: 'B' },
      comparaciones,
      accesos_io_lectura: lecturasIo,
      accesos_io_escritura: escriturasIo,
      explicacion: `Cinta A agotada (EOF). Vaciando remanente ${valRemB} de Cinta B directamente a la salida (0 comparaciones adicionales).`
    });
  }

  // Asegurar el último bloque de escritura si quedó pendiente
  if (cintaSalida.length % factorB !== 0) {
    escriturasIo += 1;
  }

  // Paso final de consolidación
  pasos.push({
    paso: pasos.length,
    estado: 'FINALIZADO',
    cintaA: clonarArreglo(cintaA),
    cintaB: clonarArreglo(cintaB),
    cintaSalida: clonarArreglo(cintaSalida),
    punteroA: pA,
    punteroB: pB,
    elementoSeleccionado: null,
    comparaciones,
    accesos_io_lectura: lecturasIo,
    accesos_io_escritura: escriturasIo,
    explicacion: `Fusión de 2 Vías completada con éxito: Cinta de Salida consolidada [${cintaSalida.join(', ')}] con ${cintaSalida.length} registros ordenados. Total E/S: ${lecturasIo} lecturas + ${escriturasIo} escrituras.`
  });

  return pasos;
}
