export type ModuleId = 'mezcla' | 'escaneo' | 'seek';

// =========================================================================
// 1. TIPOS PARA MEZCLA NATURAL (DIEGO CÓRDOVA)
// =========================================================================
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

// =========================================================================
// 2. TIPOS PARA ESCANEO SECUENCIAL POR BLOQUES (DYLAN GARCÍA)
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
