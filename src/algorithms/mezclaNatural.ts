import { StepMezcla } from '../types/algorithms';

/**
 * 1. ALGORITMO DE DIEGO CÓRDOVA: MEZCLA NATURAL COMPLETA (Detección + Fusión 2-Vías)
 * Implementación 100% desde cero en TypeScript puro.
 * Cumple la restricción estricta: CERO uso de Array.prototype.sort() ni librerías externas.
 */

function clonarArreglo(arr: number[]): number[] {
  const copia: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    copia.push(arr[i]);
  }
  return copia;
}

function clonarMatriz(mat: number[][]): number[][] {
  const copia: number[][] = [];
  for (let i = 0; i < mat.length; i++) {
    copia.push(clonarArreglo(mat[i]));
  }
  return copia;
}

/**
 * Fusiona dos corridas ordenadas en una sola corrida ordenada
 * usando el algoritmo clásico de dos punteros desde cero (sin .sort()).
 */
export function fusionarDosCorridasManual(
  corridaA: number[],
  corridaB: number[]
): { resultado: number[]; comps: number } {
  const resultado: number[] = [];
  let i = 0;
  let j = 0;
  let comps = 0;
  const lenA = corridaA.length;
  const lenB = corridaB.length;

  // Invariante de fusión: resultado[0..k-1] contiene los menores elementos de A[0..i-1] U B[0..j-1]
  while (i < lenA && j < lenB) {
    comps += 1;
    if (corridaA[i] <= corridaB[j]) {
      resultado.push(corridaA[i]);
      i += 1;
    } else {
      resultado.push(corridaB[j]);
      j += 1;
    }
  }

  while (i < lenA) {
    resultado.push(corridaA[i]);
    i += 1;
  }

  while (j < lenB) {
    resultado.push(corridaB[j]);
    j += 1;
  }

  return { resultado, comps };
}

/**
 * Concatena manualmente una lista de corridas para reconstruir la cinta.
 */
function aplanarCorridas(listaCorridas: number[][]): number[] {
  const cinta: number[] = [];
  for (let c = 0; c < listaCorridas.length; c++) {
    const corrida = listaCorridas[c];
    for (let e = 0; e < corrida.length; e++) {
      cinta.push(corrida[e]);
    }
  }
  return cinta;
}

/**
 * Calcula los índices exactos donde inicia cada nueva corrida en la cinta.
 */
function calcularRupturasDesdeCorridas(listaCorridas: number[][]): number[] {
  const rupturas: number[] = [];
  let acumulado = 0;
  for (let idx = 0; idx < listaCorridas.length - 1; idx++) {
    acumulado += listaCorridas[idx].length;
    rupturas.push(acumulado);
  }
  return rupturas;
}

/**
 * Ejecuta el algoritmo completo de Mezcla Natural desde cero:
 *  - FASE 1: Escaneo lineal O(N/B) detectando rupturas de orden (A[i] < A[i-1])
 *            para particionar el archivo en corridas naturales.
 *  - FASE 2: Pasadas sucesivas de fusión de 2 vías de corridas adyacentes
 *            hasta que todo el archivo queda en 1 sola corrida ordenada.
 */
export function generarPasosMezclaNatural(
  arreglo: number[],
  factorB: number = 2
): StepMezcla[] {
  const cinta = clonarArreglo(arreglo);
  const n = cinta.length;
  const pasos: StepMezcla[] = [];
  const rupturas: number[] = [];
  let corridasActuales: number[][] = n > 0 ? [[cinta[0]]] : [];

  let comparaciones = 0;
  let bloquesIo = n > 0 ? 1 : 0;

  // Paso 0: Inicio Fase 1
  pasos.push({
    paso: 0,
    fase: 'FASE 1 · DETECCIÓN',
    estado: 'INICIO',
    cinta: clonarArreglo(cinta),
    indice_actual: 0,
    comparando: null,
    rupturas: [],
    corridas: n > 0 ? [[cinta[0]]] : [],
    comparaciones: 0,
    accesos_io: bloquesIo,
    explicacion: `Inicio de Fase 1 (Detección de Corridas): Cabezal en índice [0] (valor ${cinta[0]}). Inaugura la Corrida #1.`
  });

  // -----------------------------------------------------------------
  // FASE 1: ESCANEO SECUENCIAL Y PARTICIÓN EN CORRIDAS NATURALES
  // -----------------------------------------------------------------
  for (let i = 1; i < n; i++) {
    comparaciones += 1;
    if (i % factorB === 0) {
      bloquesIo += 1;
    }

    const actual = cinta[i];
    const anterior = cinta[i - 1];
    // Invariante de corrida natural: A[i] >= A[i-1] preserva monotonía no decreciente
    const esRuptura = actual < anterior;

    pasos.push({
      paso: pasos.length,
      fase: 'FASE 1 · DETECCIÓN',
      estado: 'COMPARANDO',
      cinta: clonarArreglo(cinta),
      indice_actual: i,
      comparando: [i - 1, i],
      valores_comparados: [anterior, actual],
      es_ruptura: esRuptura,
      rupturas: clonarArreglo(rupturas),
      corridas: clonarMatriz(corridasActuales),
      comparaciones,
      accesos_io: bloquesIo,
      explicacion:
        `Evaluando par adyacente A[${i}] (${actual}) vs A[${i - 1}] (${anterior}): ` +
        (esRuptura
          ? `${actual} < ${anterior} → ¡RUPTURA DE ORDEN! Se inserta frontera de corte.`
          : `${actual} >= ${anterior} → Continúa la corrida actual.`)
    });

    if (esRuptura) {
      rupturas.push(i);
      corridasActuales.push([actual]);
    } else {
      corridasActuales[corridasActuales.length - 1].push(actual);
    }

    const ultimaCorrida = corridasActuales[corridasActuales.length - 1];
    pasos.push({
      paso: pasos.length,
      fase: 'FASE 1 · DETECCIÓN',
      estado: esRuptura ? 'CORTE_DETECTADO' : 'EXTENDIENDO',
      cinta: clonarArreglo(cinta),
      indice_actual: i,
      comparando: null,
      es_ruptura: esRuptura,
      rupturas: clonarArreglo(rupturas),
      corridas: clonarMatriz(corridasActuales),
      comparaciones,
      accesos_io: bloquesIo,
      explicacion: esRuptura
        ? `Frontera registrada en índice [${i}]. El registro ${actual} inicia la Corrida #${corridasActuales.length}.`
        : `Registro ${actual} anexado a la Corrida #${corridasActuales.length}: [${ultimaCorrida.join(', ')}].`
    });
  }

  // -----------------------------------------------------------------
  // FASE 2: FUSIÓN ITERATIVA DE CORRIDAS ADYACENTES (SIN ATAJOS STDLIB)
  // -----------------------------------------------------------------
  let numPasada = 1;
  while (corridasActuales.length > 1) {
    const nuevasCorridas: number[][] = [];
    let idxC = 0;

    while (idxC < corridasActuales.length) {
      if (idxC + 1 < corridasActuales.length) {
        const cIzq = corridasActuales[idxC];
        const cDer = corridasActuales[idxC + 1];
        const { resultado: fusionada, comps: compsMerge } =
          fusionarDosCorridasManual(cIzq, cDer);

        comparaciones += compsMerge;
        const elementosInvolucrados = cIzq.length + cDer.length;
        bloquesIo += Math.floor((elementosInvolucrados + factorB - 1) / factorB);

        nuevasCorridas.push(fusionada);

        // Construir estado intermedio de las corridas tras esta fusión parcial
        const vistaCorridas: number[][] = clonarMatriz(nuevasCorridas);
        for (let r = idxC + 2; r < corridasActuales.length; r++) {
          vistaCorridas.push(clonarArreglo(corridasActuales[r]));
        }

        const cintaActualizada = aplanarCorridas(vistaCorridas);
        const rupturasActualizadas = calcularRupturasDesdeCorridas(vistaCorridas);

        pasos.push({
          paso: pasos.length,
          fase: `FASE 2 · FUSIÓN (PASADA ${numPasada})`,
          estado: 'FUSIONANDO',
          cinta: cintaActualizada,
          indice_actual: n - 1,
          comparando: null,
          rupturas: rupturasActualizadas,
          corridas: vistaCorridas,
          comparaciones,
          accesos_io: bloquesIo,
          explicacion: `Pasada de Fusión #${numPasada}: Mezclando [${cIzq.join(', ')}] + [${cDer.join(', ')}] → [${fusionada.join(', ')}] (${compsMerge} comparaciones con dos punteros).`
        });

        idxC += 2;
      } else {
        // Corrida impar pasa intacta a la siguiente pasada
        nuevasCorridas.push(clonarArreglo(corridasActuales[idxC]));
        idxC += 1;
      }
    }

    corridasActuales = nuevasCorridas;
    numPasada += 1;
  }

  // Paso Final: Archivo completamente ordenado en 1 sola corrida
  const cintaFinal = aplanarCorridas(corridasActuales);
  pasos.push({
    paso: pasos.length,
    fase: 'COMPLETADO',
    estado: 'FINALIZADO',
    cinta: cintaFinal,
    indice_actual: n - 1,
    comparando: null,
    rupturas: [],
    corridas: clonarMatriz(corridasActuales),
    comparaciones,
    accesos_io: bloquesIo,
    explicacion: `Mezcla Natural completada: Queda 1 única corrida ordenada [${cintaFinal.join(', ')}] tras ${comparaciones} comparaciones y ${bloquesIo} operaciones de bloque E/S.`
  });

  return pasos;
}
