import { CubetaInfo, StepCubetas } from '../types/algorithms';

/**
 * Clona de forma profunda el arreglo de cubetas para mantener inmutabilidad
 * entre los pasos de la línea de tiempo interactiva.
 */
function clonarCubetas(cubetas: CubetaInfo[]): CubetaInfo[] {
  const copia: CubetaInfo[] = [];
  for (let i = 0; i < cubetas.length; i++) {
    const c = cubetas[i];
    const elemsCopia: number[] = [];
    for (let j = 0; j < c.elementos.length; j++) {
      elemsCopia.push(c.elementos[j]);
    }
    copia.push({
      id: c.id,
      etiqueta: c.etiqueta,
      rangoMin: c.rangoMin,
      rangoMax: c.rangoMax,
      elementos: elemsCopia,
      ordenada: c.ordenada,
      vaciada: c.vaciada
    });
  }
  return copia;
}

/**
 * Ordenamiento por Inserción (Insertion Sort) implementado 100% desde cero
 * en TypeScript puro (sin usar Array.prototype.sort).
 * Devuelve el nuevo arreglo ordenado y la cantidad exacta de comparaciones de CPU.
 */
export function ordenarCubetaManual(arr: number[]): {
  ordenado: number[];
  comparaciones: number;
} {
  const resultado: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    resultado.push(arr[i]);
  }

  let comparaciones = 0;
  for (let i = 1; i < resultado.length; i++) {
    const clave = resultado[i];
    let j = i - 1;
    while (j >= 0) {
      comparaciones++;
      if (resultado[j] > clave) {
        resultado[j + 1] = resultado[j];
        j--;
      } else {
        break;
      }
    }
    resultado[j + 1] = clave;
  }

  return { ordenado: resultado, comparaciones };
}

/**
 * Genera la traza paso a paso para el Ordenamiento por Distribución (Cubetas / Bucket Sort Externo).
 *
 * Mecánica en Almacenamiento Secundario (Capítulo 6):
 * 1. Fase 1 (Distribución / Scatter): Se particiona el dominio [minVal, maxVal] en K cubetas disjuntas.
 *    Se escanea secuencialmente la cinta de entrada y cada registro se clasifica en su cubeta correspondiente.
 * 2. Fase 2 (Ordenamiento Interno en RAM): Cada cubeta tiene un tamaño reducido que cabe en memoria principal;
 *    se ordena localmente en RAM mediante Insertion Sort manual.
 * 3. Fase 3 (Concatenación / Gather): Como los rangos de las cubetas son estrictamente crecientes
 *    (Cubeta 0 < Cubeta 1 < ... < Cubeta K-1), se concatenan directamente en la cinta de salida F0
 *    sin realizar comparaciones adicionales entre cubetas.
 */
export function generarPasosOrdenamientoCubetas(
  arregloEntrada: number[],
  numCubetas: number = 4,
  factorBloque: number = 2
): StepCubetas[] {
  const pasos: StepCubetas[] = [];
  const entrada: number[] = [];
  for (let i = 0; i < arregloEntrada.length; i++) {
    entrada.push(arregloEntrada[i]);
  }

  const k = Math.max(2, Math.min(6, numCubetas));
  const B = Math.max(1, factorBloque);

  // Determinar el rango de valores para particionar las K cubetas de forma uniforme
  let minVal = 0;
  let maxVal = 99;
  if (entrada.length > 0) {
    let minDetectado = entrada[0];
    let maxDetectado = entrada[0];
    for (let i = 1; i < entrada.length; i++) {
      if (entrada[i] < minDetectado) minDetectado = entrada[i];
      if (entrada[i] > maxDetectado) maxDetectado = entrada[i];
    }
    minVal = Math.min(0, minDetectado);
    maxVal = Math.max(99, maxDetectado);
  }

  const amplitudTotal = maxVal - minVal + 1;
  const anchoCubeta = Math.ceil(amplitudTotal / k);

  const cubetas: CubetaInfo[] = [];
  for (let b = 0; b < k; b++) {
    const rMin = minVal + b * anchoCubeta;
    const rMax = b === k - 1 ? maxVal : minVal + (b + 1) * anchoCubeta - 1;
    cubetas.push({
      id: b,
      etiqueta: `Cubeta B${b}`,
      rangoMin: rMin,
      rangoMax: rMax,
      elementos: [],
      ordenada: false,
      vaciada: false
    });
  }

  let comparacionesCpu = 0;
  let ioLectura = 0;
  let ioEscritura = 0;
  const salida: number[] = [];

  // Paso 0: Estado Inicial
  pasos.push({
    paso: 0,
    fase: 'FASE 0 · INICIALIZACIÓN DE PARTICIONES',
    estado: 'INICIO',
    cintaEntrada: [...entrada],
    indiceLectura: 0,
    elementoEnTransito: null,
    cubetaActiva: null,
    cubetas: clonarCubetas(cubetas),
    cintaSalida: [],
    comparaciones_cpu: 0,
    accesos_io_lectura: 0,
    accesos_io_escritura: 0,
    explicacion: `Cinta de entrada con ${entrada.length} registros. Se preparan K = ${k} cubetas en disco cubriendo el rango [${minVal}..${maxVal}] con amplitud de ~${anchoCubeta} unidades por cubeta.`
  });

  // =========================================================================
  // FASE 1: DISTRIBUCIÓN (SCATTER) DE LA CINTA DE ENTRADA A LAS K CUBETAS
  // =========================================================================
  for (let i = 0; i < entrada.length; i++) {
    const val = entrada[i];
    // Si cruzamos frontera de bloque físico B en la cinta de entrada, sumamos 1 lectura E/S
    if (i % B === 0) {
      ioLectura++;
    }

    // Cálculo aritmético directo O(1) del índice de cubeta
    let idxCubeta = Math.floor((val - minVal) / anchoCubeta);
    if (idxCubeta < 0) idxCubeta = 0;
    if (idxCubeta >= k) idxCubeta = k - 1;

    cubetas[idxCubeta].elementos.push(val);

    // Si el buffer de la cubeta acumula B registros, contabilizamos 1 volcado a disco
    if (cubetas[idxCubeta].elementos.length % B === 0) {
      ioEscritura++;
    }

    const cDestino = cubetas[idxCubeta];
    pasos.push({
      paso: pasos.length,
      fase: 'FASE 1 · DISTRIBUCIÓN (SCATTER)',
      estado: 'DISTRIBUYENDO',
      cintaEntrada: [...entrada],
      indiceLectura: i,
      elementoEnTransito: { valor: val, cubetaDestino: idxCubeta },
      cubetaActiva: idxCubeta,
      cubetas: clonarCubetas(cubetas),
      cintaSalida: [...salida],
      comparaciones_cpu: comparacionesCpu,
      accesos_io_lectura: ioLectura,
      accesos_io_escritura: ioEscritura,
      explicacion: `Leído A[${i}] = ${val}. Por su valor lógico pertenece al intervalo [${cDestino.rangoMin}..${cDestino.rangoMax}] → se envía directamente a la ${cDestino.etiqueta} en O(1) sin comparar contra otros registros.`
    });
  }

  // Volcar (flush) buffers parciales de cubetas al terminar Fase 1
  for (let b = 0; b < k; b++) {
    if (cubetas[b].elementos.length % B !== 0) {
      ioEscritura++;
    }
  }

  // =========================================================================
  // FASE 2: ORDENAMIENTO INTERNO EN RAM DE CADA CUBETA
  // =========================================================================
  for (let b = 0; b < k; b++) {
    const cubeta = cubetas[b];
    if (cubeta.elementos.length === 0) {
      cubeta.ordenada = true;
      pasos.push({
        paso: pasos.length,
        fase: 'FASE 2 · ORDENAMIENTO LOCAL EN RAM',
        estado: 'ORDENANDO_CUBETA',
        cintaEntrada: [...entrada],
        indiceLectura: entrada.length,
        elementoEnTransito: null,
        cubetaActiva: b,
        cubetas: clonarCubetas(cubetas),
        cintaSalida: [...salida],
        comparaciones_cpu: comparacionesCpu,
        accesos_io_lectura: ioLectura,
        accesos_io_escritura: ioEscritura,
        explicacion: `${cubeta.etiqueta} [${cubeta.rangoMin}..${cubeta.rangoMax}] está vacía (0 registros). Se omite carga en RAM y pasamos a la siguiente cubeta.`
      });
      continue;
    }

    // Cargar cubeta a RAM (bloques de tamaño B)
    const bloquesCargaCubeta = Math.ceil(cubeta.elementos.length / B);
    ioLectura += bloquesCargaCubeta;

    if (cubeta.elementos.length === 1) {
      cubeta.ordenada = true;
      pasos.push({
        paso: pasos.length,
        fase: 'FASE 2 · ORDENAMIENTO LOCAL EN RAM',
        estado: 'ORDENANDO_CUBETA',
        cintaEntrada: [...entrada],
        indiceLectura: entrada.length,
        elementoEnTransito: null,
        cubetaActiva: b,
        cubetas: clonarCubetas(cubetas),
        cintaSalida: [...salida],
        comparaciones_cpu: comparacionesCpu,
        accesos_io_lectura: ioLectura,
        accesos_io_escritura: ioEscritura,
        explicacion: `${cubeta.etiqueta} tiene solo 1 elemento ([${cubeta.elementos[0]}]); ya está ordenada en RAM (0 comparaciones).`
      });
    } else {
      // Ejecutar Insertion Sort paso a paso dentro de la cubeta activa
      for (let i = 1; i < cubeta.elementos.length; i++) {
        const clave = cubeta.elementos[i];
        let j = i - 1;
        let compsEnPaso = 0;

        while (j >= 0) {
          compsEnPaso++;
          comparacionesCpu++;
          if (cubeta.elementos[j] > clave) {
            cubeta.elementos[j + 1] = cubeta.elementos[j];
            j--;
          } else {
            break;
          }
        }
        cubeta.elementos[j + 1] = clave;

        if (i === cubeta.elementos.length - 1) {
          cubeta.ordenada = true;
        }

        pasos.push({
          paso: pasos.length,
          fase: 'FASE 2 · ORDENAMIENTO LOCAL EN RAM',
          estado: 'ORDENANDO_CUBETA',
          cintaEntrada: [...entrada],
          indiceLectura: entrada.length,
          elementoEnTransito: null,
          cubetaActiva: b,
          cubetas: clonarCubetas(cubetas),
          cintaSalida: [...salida],
          comparaciones_cpu: comparacionesCpu,
          accesos_io_lectura: ioLectura,
          accesos_io_escritura: ioEscritura,
          explicacion: `Insertion Sort en ${cubeta.etiqueta} (iteración ${i}/${cubeta.elementos.length - 1}): Inserta el valor ${clave} en su posición ordenada → [${cubeta.elementos.join(', ')}] (${compsEnPaso} comp. en RAM).`
        });
      }
    }
  }

  // =========================================================================
  // FASE 3: CONCATENACIÓN DIRECTA (GATHER) HACIA LA CINTA DE SALIDA F0
  // =========================================================================
  for (let b = 0; b < k; b++) {
    const cubeta = cubetas[b];
    if (cubeta.elementos.length === 0) {
      cubeta.vaciada = true;
      continue;
    }

    for (let j = 0; j < cubeta.elementos.length; j++) {
      salida.push(cubeta.elementos[j]);
      if (salida.length % B === 0) {
        ioEscritura++;
      }
    }
    cubeta.vaciada = true;

    pasos.push({
      paso: pasos.length,
      fase: 'FASE 3 · CONCATENACIÓN A SALIDA (GATHER)',
      estado: 'CONCATENANDO',
      cintaEntrada: [...entrada],
      indiceLectura: entrada.length,
      elementoEnTransito: null,
      cubetaActiva: b,
      cubetas: clonarCubetas(cubetas),
      cintaSalida: [...salida],
      comparaciones_cpu: comparacionesCpu,
      accesos_io_lectura: ioLectura,
      accesos_io_escritura: ioEscritura,
      explicacion: `Vaciando ${cubeta.etiqueta} ([${cubeta.elementos.join(', ')}]) directamente al final de la Cinta de Salida F0. Como los rangos de las cubetas son disjuntos, no se requieren comparaciones adicionales.`
    });
  }

  // Flush final si quedaron elementos en el buffer de salida
  if (salida.length > 0 && salida.length % B !== 0) {
    ioEscritura++;
  }

  // Paso Final: Completado
  pasos.push({
    paso: pasos.length,
    fase: 'COMPLETADO · ARCHIVO ORDENADO EN F0',
    estado: 'FINALIZADO',
    cintaEntrada: [...entrada],
    indiceLectura: entrada.length,
    elementoEnTransito: null,
    cubetaActiva: null,
    cubetas: clonarCubetas(cubetas),
    cintaSalida: [...salida],
    comparaciones_cpu: comparacionesCpu,
    accesos_io_lectura: ioLectura,
    accesos_io_escritura: ioEscritura,
    explicacion: `Ordenamiento por Distribución finalizado: ${salida.length} registros ordenados en F0 con solo ${comparacionesCpu} comparaciones locales en RAM y ${ioLectura + ioEscritura} operaciones de E/S por bloques.`
  });

  return pasos;
}

