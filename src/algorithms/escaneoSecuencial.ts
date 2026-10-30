import { RegistroEmpleado, StepEscaneo } from '../types/algorithms';

/**
 * 2. ALGORITMO DE DYLAN GARCÍA: ESCANEO SECUENCIAL POR BLOQUES (Factor B)
 * Implementación desde cero en TypeScript puro.
 * Incluye parseo manual carácter por carácter de los registros en 'datos/empleados.dat'
 * y simulación de lector por páginas físicas (Buffer Pool en RAM).
 */

export const CONTENIDO_EMPLEADOS_DEFAULT = [
  '101|Ana|Ventas|64',
  '104|Carlos|Sistemas|64',
  '108|Elena|Finanzas|64',
  '112|Beto|Diseno|64',
  '115|Diana|RRHH|64',
  '120|Franco|Legal|64',
  '124|Gaby|Soporte|64',
  '129|Hugo|Redes|64'
].join('\n');

/**
 * Parsea manualmente una línea 'id|clave|depto|tam' carácter por carácter
 * sin usar librerías externas de CSV.
 */
export function parsearLineaEmpleadoManual(
  lineaTexto: string,
  offsetIdx: number
): RegistroEmpleado {
  const limpia = lineaTexto.trim();
  const campos: string[] = [];
  let actual = '';

  for (let i = 0; i < limpia.length; i++) {
    const ch = limpia[i];
    if (ch === '|') {
      campos.push(actual);
      actual = '';
    } else {
      actual += ch;
    }
  }
  campos.push(actual);

  return {
    offset: offsetIdx,
    id: parseInt(campos[0], 10),
    clave: campos[1],
    depto: campos[2],
    tam_bytes: parseInt(campos[3], 10)
  };
}

/**
 * Separa un flujo de texto en líneas de forma manual carácter por carácter.
 */
function extraerLineasNoVaciasManual(contenidoArchivo: string): string[] {
  const lineas: string[] = [];
  let bufferLinea = '';

  for (let i = 0; i < contenidoArchivo.length; i++) {
    const ch = contenidoArchivo[i];
    if (ch === '\n' || ch === '\r') {
      if (bufferLinea.trim().length > 0) {
        lineas.push(bufferLinea);
      }
      bufferLinea = '';
    } else {
      bufferLinea += ch;
    }
  }
  if (bufferLinea.trim().length > 0) {
    lineas.push(bufferLinea);
  }
  return lineas;
}

/**
 * Lee físicamente hasta 'factorB' registros consecutivos desde el cursor
 * del archivo, simulando una transferencia de bloque Disco -> Buffer RAM.
 */
function leerBloqueFisicoDisco(
  lineasDisco: string[],
  cursorLinea: number,
  factorB: number
): RegistroEmpleado[] {
  const bloque: RegistroEmpleado[] = [];
  for (let k = 0; k < factorB; k++) {
    const idx = cursorLinea + k;
    if (idx >= lineasDisco.length) {
      break;
    }
    const reg = parsearLineaEmpleadoManual(lineasDisco[idx], idx);
    bloque.push(reg);
  }
  return bloque;
}

export function generarPasosEscaneoSecuencial(
  claveBuscada: string,
  factorB: number = 2,
  contenidoArchivo: string = CONTENIDO_EMPLEADOS_DEFAULT,
  latenciaMs: number = 8.2
): { registros: RegistroEmpleado[]; pasos: StepEscaneo[] } {
  const lineasDisco = extraerLineasNoVaciasManual(contenidoArchivo);
  const todosLosRegistros: RegistroEmpleado[] = [];

  for (let i = 0; i < lineasDisco.length; i++) {
    todosLosRegistros.push(parsearLineaEmpleadoManual(lineasDisco[i], i));
  }

  const pasos: StepEscaneo[] = [];
  let accesosIo = 0;
  let comparacionesCpu = 0;

  pasos.push({
    paso: 0,
    estado: 'INICIO',
    puntero: -1,
    bloque_actual: -1,
    rango_bloque: [],
    registro_ram: null,
    accesos_io: 0,
    comparaciones_cpu: 0,
    ahorro_real_x: 1.0,
    tiempo_ms: 0.0,
    explicacion: `Descriptor abierto en 'datos/empleados.dat'. Buscando clave "${claveBuscada}" con factor de bloqueo B = ${factorB} registros/página.`
  });

  let indiceBloque = 0;
  let offsetGlobal = 0;

  while (offsetGlobal < lineasDisco.length) {
    const bloqueCargado = leerBloqueFisicoDisco(lineasDisco, offsetGlobal, factorB);
    if (bloqueCargado.length === 0) {
      break;
    }

    accesosIo += 1;
    const rangoIndices: number[] = [];
    for (let b = 0; b < bloqueCargado.length; b++) {
      rangoIndices.push(bloqueCargado[b].offset);
    }

    let ahorroActual = Number(
      (Math.max(1, comparacionesCpu) / accesosIo).toFixed(2)
    );

    // Paso de transferencia física DMA (Disco -> Buffer Pool RAM)
    pasos.push({
      paso: pasos.length,
      estado: 'TRANSFERENCIA_IO',
      puntero: rangoIndices[0],
      bloque_actual: indiceBloque,
      rango_bloque: rangoIndices,
      registro_ram: bloqueCargado[0],
      accesos_io: accesosIo,
      comparaciones_cpu: comparacionesCpu,
      ahorro_real_x: ahorroActual,
      tiempo_ms: Number((accesosIo * latenciaMs).toFixed(2)),
      explicacion: `Syscall read_block(): Transferencia física E/S #${accesosIo}. Página #${indiceBloque} (registros ${rangoIndices[0]}..${rangoIndices[rangoIndices.length - 1]}) cargada en Buffer RAM.`
    });

    // Inspección en RAM de cada slot dentro del bloque recién cargado
    for (let slotIdx = 0; slotIdx < bloqueCargado.length; slotIdx++) {
      const reg = bloqueCargado[slotIdx];
      comparacionesCpu += 1;
      ahorroActual = Number((comparacionesCpu / accesosIo).toFixed(2));
      const coincide =
        reg.clave.toLowerCase() === claveBuscada.trim().toLowerCase();

      if (coincide) {
        pasos.push({
          paso: pasos.length,
          estado: 'ENCONTRADO',
          puntero: reg.offset,
          bloque_actual: indiceBloque,
          rango_bloque: rangoIndices,
          registro_ram: reg,
          accesos_io: accesosIo,
          comparaciones_cpu: comparacionesCpu,
          ahorro_real_x: ahorroActual,
          tiempo_ms: Number((accesosIo * latenciaMs).toFixed(2)),
          explicacion: `¡HIT EN RAM! Registro [${reg.offset}] (ID ${reg.id}) == "${claveBuscada}". Realizadas ${accesosIo} E/S de disco frente a ${comparacionesCpu} sin bloqueo (Ratio real: ${ahorroActual}x).`
        });
        return { registros: todosLosRegistros, pasos };
      } else {
        const quedanEnRam = slotIdx + 1 < bloqueCargado.length;
        pasos.push({
          paso: pasos.length,
          estado: 'DESCARTADO',
          puntero: reg.offset,
          bloque_actual: indiceBloque,
          rango_bloque: rangoIndices,
          registro_ram: reg,
          accesos_io: accesosIo,
          comparaciones_cpu: comparacionesCpu,
          ahorro_real_x: ahorroActual,
          tiempo_ms: Number((accesosIo * latenciaMs).toFixed(2)),
          explicacion:
            `ALU compara Slot[${slotIdx}]: "${reg.clave}" != "${claveBuscada}". ` +
            (quedanEnRam
              ? 'Cache Hit para el siguiente registro: ya reside en el Buffer Pool (0 E/S adicionales).'
              : 'Fin de página en RAM: el próximo registro provocará un Cache Miss (nueva E/S).')
        });
      }
    }

    offsetGlobal += bloqueCargado.length;
    indiceBloque += 1;
  }

  // Caso peor: EOF alcanzado sin encontrar la clave
  const ahorroFinal = Number(
    (comparacionesCpu / Math.max(1, accesosIo)).toFixed(2)
  );
  pasos.push({
    paso: pasos.length,
    estado: 'NO_ENCONTRADO',
    puntero: todosLosRegistros.length - 1,
    bloque_actual: indiceBloque - 1,
    rango_bloque: [],
    registro_ram: null,
    accesos_io: accesosIo,
    comparaciones_cpu: comparacionesCpu,
    ahorro_real_x: ahorroFinal,
    tiempo_ms: Number((accesosIo * latenciaMs).toFixed(2)),
    explicacion: `EOF alcanzado en 'empleados.dat' tras ${accesosIo} lecturas de bloque (${comparacionesCpu} comparaciones). La clave "${claveBuscada}" no existe.`
  });

  return { registros: todosLosRegistros, pasos };
}
