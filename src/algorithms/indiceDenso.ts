import { RegistroEmpleado } from '../types/algorithms';
import { parsearLineaEmpleadoManual } from './escaneoSecuencial';

export interface EntradaIndiceDenso {
  clave: string;
  offset: number; // Línea o posición física en el archivo
}

export type EstadoIndiceDenso = 
  | 'INICIO' 
  | 'CONSTRUYENDO_INDICE' 
  | 'ORDENANDO_INDICE' 
  | 'BUSCANDO_BINARIA' 
  | 'ENCONTRADO' 
  | 'NO_ENCONTRADO';

export interface StepIndiceDenso {
  paso: number;
  estado: EstadoIndiceDenso;
  tabla_indice: EntradaIndiceDenso[];
  bajo: number;
  alto: number;
  medio: number;
  accesos_io: number;
  comparaciones_cpu: number;
  registro_encontrado: RegistroEmpleado | null;
  explicacion: string;
}

/**
 * Separa un flujo de texto en líneas de forma manual carácter por carácter.
 */
function extraerLineasManual(contenidoArchivo: string): string[] {
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
 * Ordena la tabla de índices en memoria RAM usando Ordenamiento por Inserción (Insertion Sort)
 * ESTRICTAMENTE SIN USAR Array.prototype.sort() para cumplir la Regla de Oro.
 */
function ordenarIndicePorInsercion(tabla: EntradaIndiceDenso[]): EntradaIndiceDenso[] {
  const n = tabla.length;
  for (let i = 1; i < n; i++) {
    const claveActual = tabla[i];
    let j = i - 1;

    while (j >= 0 && tabla[j].clave.toLowerCase() > claveActual.clave.toLowerCase()) {
      tabla[j + 1] = tabla[j];
      j--;
    }
    tabla[j + 1] = claveActual;
  }
  return tabla;
}

/**
 * Genera los pasos de construcción y búsqueda mediante Índice Denso.
 */
export function generarPasosIndiceDenso(
  claveBuscada: string,
  contenidoArchivo: string
): { registrosTotales: RegistroEmpleado[]; pasos: StepIndiceDenso[] } {
  const lineasDisco = extraerLineasManual(contenidoArchivo);
  const registrosTotales: RegistroEmpleado[] = [];
  const tablaIndice: EntradaIndiceDenso[] = [];
  const pasos: StepIndiceDenso[] = [];

  let comparacionesCpu = 0;
  let accesosIo = 0;

  // Paso 0: Inicio del sistema de indización
  pasos.push({
    paso: 0,
    estado: 'INICIO',
    tabla_indice: [],
    bajo: -1,
    alto: -1,
    medio: -1,
    accesos_io: 0,
    comparaciones_cpu: 0,
    registro_encontrado: null,
    explicacion: `Iniciando creación de Índice Denso para 'empleados.dat'. Se escaneará el archivo completo una sola vez para extraer claves y offsets.`
  });

  // Fase 1: Construcción secuencial del índice
  for (let i = 0; i < lineasDisco.length; i++) {
    const reg = parsearLineaEmpleadoManual(lineasDisco[i], i);
    registrosTotales.push(reg);
    tablaIndice.push({ clave: reg.clave, offset: reg.offset });
    comparacionesCpu++;

    pasos.push({
      paso: pasos.length,
      estado: 'CONSTRUYENDO_INDICE',
      tabla_indice: [...tablaIndice],
      bajo: -1,
      alto: -1,
      medio: -1,
      accesos_io: accesosIo,
      comparaciones_cpu: comparacionesCpu,
      registro_encontrado: null,
      explicacion: `Extrayendo clave "${reg.clave}" con offset físico [${reg.offset}] hacia la tabla de índice en RAM.`
    });
  }

  // Fase 2: Ordenamiento manual del índice en RAM (Insertion Sort)
  ordenarIndicePorInsercion(tablaIndice);
  pasos.push({
    paso: pasos.length,
    estado: 'ORDENANDO_INDICE',
    tabla_indice: [...tablaIndice],
    bajo: -1,
    alto: -1,
    medio: -1,
    accesos_io: accesosIo,
    comparaciones_cpu: comparacionesCpu,
    registro_encontrado: null,
    explicacion: `Índice denso ordenado alfabéticamente en RAM mediante Insertion Sort (sin usar sort() nativo). Listo para Búsqueda Binaria.`
  });

  // Fase 3: Búsqueda Binaria sobre el Índice Denso
  let bajo = 0;
  let alto = tablaIndice.length - 1;
  let encontradoIdx = -1;

  while (bajo <= alto) {
    const medio = Math.floor((bajo + alto) / 2);
    comparacionesCpu++;
    const claveMedia = tablaIndice[medio].clave;
    const comparacion = claveMedia.localeCompare(claveBuscada, undefined, { sensitivity: 'accent' });

    pasos.push({
      paso: pasos.length,
      estado: 'BUSCANDO_BINARIA',
      tabla_indice: [...tablaIndice],
      bajo,
      alto,
      medio,
      accesos_io: accesosIo,
      comparaciones_cpu: comparacionesCpu,
      registro_encontrado: null,
      explicacion: `Búsqueda Binaria [RAM]: Analizando elemento medio Índice[${medio}] = "${claveMedia}". Comparando con "${claveBuscada}".`
    });

    if (comparacion === 0) {
      encontradoIdx = medio;
      break;
    } else if (comparacion < 0) {
      bajo = medio + 1;
    } else {
      alto = medio - 1;
    }
  }

  // Fase 4: Resolución y Acceso Físico a Disco (1 solo acceso E/S si se encuentra)
  if (encontradoIdx !== -1) {
    accesosIo = 1; // Acceso directo al offset indicado por el índice
    const offsetReal = tablaIndice[encontradoIdx].offset;
    const regFinal = registrosTotales.find(r => r.offset === offsetReal) || null;

    pasos.push({
      paso: pasos.length,
      estado: 'ENCONTRADO',
      tabla_indice: [...tablaIndice],
      bajo,
      alto,
      medio: encontradoIdx,
      accesos_io: accesosIo,
      comparaciones_cpu: comparacionesCpu,
      registro_encontrado: regFinal,
      explicacion: `¡Clave "${claveBuscada}" localizada en el Índice Denso! Offset físico obtenido: [${offsetReal}]. Se realiza 1 único acceso E/S al disco para recuperar el registro completo.`
    });
  } else {
    pasos.push({
      paso: pasos.length,
      estado: 'NO_ENCONTRADO',
      tabla_indice: [...tablaIndice],
      bajo,
      alto,
      medio: -1,
      accesos_io: accesosIo,
      comparaciones_cpu: comparacionesCpu,
      registro_encontrado: null,
      explicacion: `Búsqueda finalizada. La clave "${claveBuscada}" no existe en la tabla de índice denso.`
    });
  }

  return { registrosTotales, pasos };
}