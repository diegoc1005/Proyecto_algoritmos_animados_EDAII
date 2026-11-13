export type ModuleId =
  | 'mezcla'
  | 'merge2vias'
  | 'cubetas'
  | 'escaneo'
  | 'indice'
  | 'csv'
  | 'seek'
  | 'asignacion'
  | 'raid';

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

export interface DetalleFusionMezcla {
  pasada: number;
  idxCorridaIzq: number;
  idxCorridaDer: number;
  corridaIzq: number[];
  corridaDer: number[];
  punteroIzq: number;
  punteroDer: number;
  comparandoPar: [number, number] | null;
  bufferFusion: number[];
  origenSeleccionado: 'IZQ' | 'DER' | 'REMANENTE' | 'COMPLETADA';
}

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
  detalle_fusion?: DetalleFusionMezcla;
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
  punteroA: number;
  punteroB: number;
  elementoSeleccionado: { valor: number; origen: 'A' | 'B' } | null;
  comparaciones: number;
  accesos_io_lectura: number;
  accesos_io_escritura: number;
  explicacion: string;
}

// --- SEMANA 3: ORDENAMIENTO POR DISTRIBUCIÓN (CUBETAS) ---
export type EstadoCubetas =
  | 'INICIO'
  | 'DISTRIBUYENDO'
  | 'ORDENANDO_CUBETA'
  | 'CONCATENANDO'
  | 'FINALIZADO';

export interface CubetaInfo {
  id: number;
  etiqueta: string;
  rangoMin: number;
  rangoMax: number;
  elementos: number[];
  ordenada: boolean;
  vaciada: boolean;
}

export interface StepCubetas {
  paso: number;
  fase: string;
  estado: EstadoCubetas;
  cintaEntrada: number[];
  indiceLectura: number;
  elementoEnTransito: { valor: number; cubetaDestino: number } | null;
  cubetaActiva: number | null;
  cubetas: CubetaInfo[];
  cintaSalida: number[];
  comparaciones_cpu: number;
  accesos_io_lectura: number;
  accesos_io_escritura: number;
  explicacion: string;
}

// =========================================================================
// 2. TIPOS PARA ESCANEO SECUENCIAL, ÍNDICE DENSO Y PARSEO MANUAL DE CSV (DYLAN GARCÍA)
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

export type EstadoParseoCSV =
  | 'FUERA_CAMPO'
  | 'EN_CAMPO_NORMAL'
  | 'EN_CAMPO_COMILLAS'
  | 'ESPERANDO_FIN_COMILLA';

export interface PasoParseoCSV {
  pasoIdx: number;
  charActual: string;
  indiceChar: number;
  estadoMaquina: EstadoParseoCSV;
  campoActual: string;
  filaActual: string[];
  filasResultantes: string[][];
  descripcion: string;
}

// =========================================================================
// 3. TIPOS PARA SISTEMAS DE ARCHIVOS (MAURO ROBLES)
// =========================================================================

// --- SEMANA 1: PUNTERO SEEK, READ Y TELL ---
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

// --- SEMANA 2: ASIGNACIÓN DE ESPACIO EN DISCO ---
export type EstrategiaAsignacion = 'contigua' | 'enlazada' | 'indexada';

export interface BloqueDisco {
  id: number;
  archivoId: string | null;
  color: string;
  tipo: 'libre' | 'datos' | 'inodo';
  siguiente: number | null; // Puntero para asignación enlazada
  inodoBloques?: number[]; // Lista de punteros de bloques de datos si es un Inodo
}

export interface ArchivoDisco {
  id: string;
  nombre: string;
  color: string;
  tamBloques: number;
  bloqueInicio: number; // Para contigua o enlazada
  bloqueInodo?: number; // Para indexada
  bloquesOcupados: number[];
}

export interface StepAsignacion {
  paso: number;
  estado: string;
  estrategia: EstrategiaAsignacion;
  bloques: BloqueDisco[];
  archivos: ArchivoDisco[];
  bloqueActivo: number | null;
  bloquesRecorridos: number[];
  saltosCabezal: number;
  fragmentacionExterna: number; // Porcentaje de espacio libre que no puede usarse en contigua
  bloquesLibresTotales: number;
  explicacion: string;
}

// --- SEMANA 3: RAID 0 (STRIPING) VS RAID 1 (MIRRORING) ---
export type NivelRaid = 'raid0' | 'raid1';
export type EscenarioRaid = 'escritura' | 'fallo_disco';

export interface BloqueRaid {
  id: string;
  etiqueta: string;
  payload: string;
  color: string;
}

export interface SectorDiscoRaid {
  sectorIdx: number;
  bloque: BloqueRaid | null;
  escribiendoAhora: boolean;
  leyendoAhora: boolean;
}

export interface StepRaid {
  paso: number;
  estado:
    | 'INICIO'
    | 'DESPACHANDO_CONTROLADORA'
    | 'ESCRIBIENDO_DISCOS'
    | 'FALLO_FISICO_DISCO1'
    | 'RECONSTRUYENDO_LECTURA'
    | 'COMPLETADO';
  nivel: NivelRaid;
  escenario: EscenarioRaid;
  colaEntrada: BloqueRaid[];
  indiceBloqueActual: number;
  disco0: SectorDiscoRaid[];
  disco1: SectorDiscoRaid[];
  disco1Fallido: boolean;
  archivoReconstruido: Array<{
    id: string;
    payload: string;
    origen: 'DISCO 0' | 'DISCO 1' | 'PERDIDO (CORRUPTO)';
    integro: boolean;
  }>;
  ciclosRelojIO: number;
  operacionesFisicasDisco: number;
  capacidadEfectivaPct: number;
  toleranciaFallos: string;
  explicacion: string;
}
