export type ModuleId = 'mezcla' | 'merge2vias' | 'escaneo' | 'indice' | 'seek';

// =========================================================================
// 1. TIPOS PARA ORDENAMIENTO EXTERNO (DIEGO CÓRDOVA)
// =========================================================================

// --- SEMANA 1: MEZCLA NATURAL ---
export type EstadoMezcla =
  | 'INICIO'
  | 'COMPARANDO'
  | 'CORTE_DETECTADO'
  | 'EXTENDIENDO'
  | 'FUSIONANDO'
  | 'FINALIZADO';

export interface StepMezcla {
  paso: number;
  fase: string;
  estado: EstadoMezcla;
  cinta: number[];
  indice_actual: number;
  comparando: [number, number] | null;
  valores_comparados?: [number, number];
  es_ruptura?: boolean;
  rupturas: number[];
  corridas: number[][];
  comparaciones: number;
  accesos_io: number;
  explicacion: string;
}

// --- SEMANA 2: MERGE SORT 2-VÍAS EXTERNO ---
export type EstadoMerge2Vias =
  | 'INICIO'
  | 'COMPARANDO'
  | 'EMITIENDO_A'
  | 'EMITIENDO_B'
  | 'VACIANDO_RESTANTE_A'
  | 'VACIANDO_RESTANTE_B'
  | 'FINALIZADO';

export interface StepMerge2Vias {
  paso: number;
  estado: EstadoMerge2Vias;
  cintaA: number[];
  cintaB: number[];
  cintaSalida: number[];
  punteroA: number; // Índice actual en Cinta A
  punteroB: number; // Índice actual en Cinta B
  elementoSeleccionado: { valor: number; origen: 'A' | 'B' } | null;
  comparaciones: number;
  accesos_io_lectura: number;
  accesos_io_escritura: number;
  explicacion: string;
}

// =========================================================================
// 2. TIPOS PARA ESCANEO SECUENCIAL E ÍNDICE DENSO (DYLAN GARCÍA)
// =========================================================================
export interface RegistroEmpleado {
  offset: number;
  id: number;
  clave: string;
  depto: string;
  tam_bytes: number;
}

export type EstadoEscaneo =
  | 'INICIO'
  | 'TRANSFERENCIA_IO'
  | 'ENCONTRADO'
  | 'DESCARTADO'
  | 'NO_ENCONTRADO';

export interface StepEscaneo {
  paso: number;
  estado: EstadoEscaneo;
  puntero: number;
  bloque_actual: number;
  rango_bloque: number[];
  registro_ram: RegistroEmpleado | null;
  accesos_io: number;
  comparaciones_cpu: number;
  ahorro_real_x: number;
  tiempo_ms: number;
  explicacion: string;
}

export interface EntradaIndiceDenso {
  clave: string;
  offset: number;
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

// =========================================================================
// 3. TIPOS PARA PUNTERO DE ARCHIVO SEEK, READ Y TELL (MAURO ROBLES)
// =========================================================================
export type TipoSyscall = 'INIT' | 'TELL' | 'SEEK' | 'READ';
export type WhenceMode = 0 | 1 | 2;

export interface OperacionSeek {
  tipo: TipoSyscall;
  arg: number | null;
  whence: WhenceMode;
}

export interface LogConsolaEntry {
  cmd: string;
  res: string;
  tipo: TipoSyscall;
}

export interface StepSeek {
  paso: number;
  tipo: TipoSyscall;
  codigo: string;
  retorno: string;
  cursor: number;
  rango_actual: [number, number];
  leidos_acumulados: number[];
  complejidad: string;
  log: LogConsolaEntry[];
  explicacion: string;
}
