import React from 'react';
import { ModuleId } from '../types/algorithms';

interface CodeTracerPanelProps {
  moduleId: ModuleId;
  stateBadge: string;
  stepIdx: number;
  onStartResize?: (e: React.MouseEvent) => void;
  onResetWidth?: () => void;
  isResizing?: boolean;
}

interface CodeSnippetDef {
  fileName: string;
  title: string;
  lines: string[];
  getActiveLines: (stateBadge: string, stepIdx: number) => {
    lines: number[];
    note: string;
  };
}

const CODE_DEFINITIONS: Record<ModuleId, CodeSnippetDef> = {
  mezcla: {
    fileName: 'src/algorithms/mezclaNatural.ts',
    title: 'Mezcla Natural (Detección + Fusión)',
    lines: [
      'function mezclaNatural(cinta: number[]) {',
      '  let corridas: number[][] = [];',
      '  let actual = [cinta[0]];',
      '  for (let i = 1; i < cinta.length; i++) {',
      '    if (cinta[i] < cinta[i - 1]) {',
      '      corridas.push(actual); // ✂️ Corte',
      '      actual = [cinta[i]];',
      '    } else {',
      '      actual.push(cinta[i]); // Extiende',
      '    }',
      '  }',
      '  corridas.push(actual);',
      '  while (corridas.length > 1) {',
      '    corridas = fusionarPares2Vias(corridas);',
      '  }',
      '  return corridas[0];',
      '}'
    ],
    getActiveLines: (badge) => {
      switch (badge) {
        case 'INICIO':
          return {
            lines: [1, 2, 3],
            note: 'Inicializa la primera corrida con A[0]'
          };
        case 'COMPARANDO':
          return {
            lines: [4, 5],
            note: 'Evalúa condición de inversión A[i] < A[i-1]'
          };
        case 'CORTE_DETECTADO':
          return {
            lines: [5, 6, 7],
            note: 'Ruptura de orden detectada: cierra corrida actual e inicia otra'
          };
        case 'EXTENDIENDO':
          return {
            lines: [8, 9],
            note: 'Orden ascendente preservado: agrega A[i] a la corrida actual'
          };
        case 'FUSIONANDO':
          return {
            lines: [13, 14, 15],
            note: 'Fusiona pares de corridas adyacentes mediante 2 punteros'
          };
        case 'FINALIZADO':
          return {
            lines: [16],
            note: 'Queda 1 sola corrida: el archivo está totalmente ordenado'
          };
        default:
          return { lines: [1], note: 'En espera' };
      }
    }
  },

  merge2vias: {
    fileName: 'src/algorithms/mergeSort2Vias.ts',
    title: 'Merge Sort Externo (Fusión 2-Vías)',
    lines: [
      'function fusionarDosCintas(A: number[], B: number[]) {',
      '  const F0: number[] = [];',
      '  let pA = 0, pB = 0;',
      '  while (pA < A.length && pB < B.length) {',
      '    if (A[pA] <= B[pB]) {',
      '      F0.push(A[pA]);',
      '      pA++;',
      '    } else {',
      '      F0.push(B[pB]);',
      '      pB++;',
      '    }',
      '  }',
      '  while (pA < A.length) F0.push(A[pA++]);',
      '  while (pB < B.length) F0.push(B[pB++]);',
      '  return F0;',
      '}'
    ],
    getActiveLines: (badge) => {
      switch (badge) {
        case 'INICIO':
          return {
            lines: [1, 2, 3],
            note: 'Posiciona los cabezales pA = 0 y pB = 0 al inicio de F1 y F2'
          };
        case 'COMPARANDO':
          return {
            lines: [4, 5],
            note: 'Compara en RAM los registros frente a cada cabezal: A[pA] vs B[pB]'
          };
        case 'EMITIENDO_A':
          return {
            lines: [5, 6, 7],
            note: 'A[pA] es menor o igual: se escribe en F0 y avanza puntero pA'
          };
        case 'EMITIENDO_B':
          return {
            lines: [8, 9, 10],
            note: 'B[pB] es menor: se escribe en F0 y avanza puntero pB'
          };
        case 'VACIANDO_RESTANTE_A':
          return {
            lines: [13],
            note: 'Cinta B agotada (EOF): copia remanente de Cinta A sin comparar'
          };
        case 'VACIANDO_RESTANTE_B':
          return {
            lines: [14],
            note: 'Cinta A agotada (EOF): copia remanente de Cinta B sin comparar'
          };
        case 'FINALIZADO':
          return {
            lines: [15],
            note: 'Ambas cintas consumidas: retorna archivo fusionado F0'
          };
        default:
          return { lines: [1], note: 'En espera' };
      }
    }
  },

  cubetas: {
    fileName: 'src/algorithms/ordenamientoCubetas.ts',
    title: 'Ordenamiento por Distribución (Cubetas)',
    lines: [
      'function bucketSortExterno(A: number[], K: number) {',
      '  const B: number[][] = crearCubetas(K);',
      '  // Fase 1: Scatter (Distribución por rango)',
      '  for (let i = 0; i < A.length; i++) {',
      '    const b = Math.floor((A[i] - min) / ancho);',
      '    B[b].push(A[i]);',
      '  }',
      '  // Fase 2: Ordenamiento local en RAM',
      '  for (let b = 0; b < K; b++) {',
      '    insertionSortManual(B[b]);',
      '  }',
      '  // Fase 3: Gather (Concatenación directa)',
      '  const F0: number[] = [];',
      '  for (let b = 0; b < K; b++) F0.push(...B[b]);',
      '  return F0;',
      '}'
    ],
    getActiveLines: (badge) => {
      switch (badge) {
        case 'INICIO':
          return {
            lines: [1, 2],
            note: 'Particiona el dominio en K cubetas de rango fijo en disco'
          };
        case 'DISTRIBUYENDO':
          return {
            lines: [4, 5, 6],
            note: 'Calcula índice de cubeta en O(1) y clasifica el registro A[i]'
          };
        case 'ORDENANDO_CUBETA':
          return {
            lines: [9, 10, 11],
            note: 'Carga la cubeta en RAM y la ordena con Insertion Sort manual'
          };
        case 'CONCATENANDO':
          return {
            lines: [13, 14],
            note: 'Vacía la cubeta ordenada directo al archivo de salida F0'
          };
        case 'FINALIZADO':
          return {
            lines: [15],
            note: 'Concatenación completada: archivo final ordenado en F0'
          };
        default:
          return { lines: [1], note: 'En espera' };
      }
    }
  },

  escaneo: {
    fileName: 'src/algorithms/escaneoSecuencial.ts',
    title: 'Escaneo Secuencial por Bloques (Factor B)',
    lines: [
      'function escaneoPorBloques(archivo, clave, B) {',
      '  let bufferRAM = [];',
      '  for (let i = 0; i < archivo.length; i++) {',
      '    if (i % B === 0) {',
      '      bufferRAM = leerPaginaDisco(i, B); // E/S',
      '    }',
      '    const reg = bufferRAM[i % B];',
      '    if (reg.clave === clave) {',
      '      return reg; // ¡Hit en Buffer Pool!',
      '    }',
      '  }',
      '  return null; // EOF alcanzado sin éxito',
      '}'
    ],
    getActiveLines: (badge) => {
      switch (badge) {
        case 'INICIO':
          return {
            lines: [1, 2],
            note: 'Inicializa Buffer Pool en RAM y posiciona puntero en bloque 0'
          };
        case 'TRANSFERENCIA_IO':
          return {
            lines: [4, 5, 6],
            note: 'Frontera de página (i % B == 0): transfiere bloque desde disco a RAM'
          };
        case 'DESCARTADO':
          return {
            lines: [7, 8],
            note: 'Compara reg.clave en RAM: no coincide, avanza al siguiente slot'
          };
        case 'ENCONTRADO':
          return {
            lines: [8, 9],
            note: '¡Clave localizada en el Buffer Pool! Detiene el escaneo'
          };
        case 'NO_ENCONTRADO':
          return {
            lines: [12],
            note: 'Se alcanzó EOF tras revisar todos los bloques sin hallar la clave'
          };
        default:
          return { lines: [1], note: 'En espera' };
      }
    }
  },

  indice: {
    fileName: 'src/algorithms/indiceDenso.ts',
    title: 'Índice Denso en RAM + Búsqueda Binaria',
    lines: [
      'function buscarConIndiceDenso(indice, clave) {',
      '  // 1. Índice denso (clave, offset) ordenado en RAM',
      '  let bajo = 0, alto = indice.length - 1;',
      '  while (bajo <= alto) {',
      '    const medio = Math.floor((bajo + alto) / 2);',
      '    if (indice[medio].clave === clave) {',
      '      const offset = indice[medio].offset;',
      '      return seekAndReadDisco(offset); // 1 E/S',
      '    }',
      '    if (indice[medio].clave < clave) bajo = medio + 1;',
      '    else alto = medio - 1;',
      '  }',
      '  return null; // Clave inexistente (0 lecturas a datos)',
      '}'
    ],
    getActiveLines: (badge) => {
      switch (badge) {
        case 'INICIO':
        case 'CONSTRUYENDO_INDICE':
          return {
            lines: [1, 2],
            note: 'Extrae pares (clave, offset) de los registros del archivo'
          };
        case 'ORDENANDO_INDICE':
          return {
            lines: [2, 3],
            note: 'Ordena el índice denso alfabéticamente en memoria RAM'
          };
        case 'BUSCANDO_BINARIA':
          return {
            lines: [4, 5, 10, 11],
            note: 'Búsqueda binaria O(log N) en RAM: descarta mitad del espacio'
          };
        case 'ENCONTRADO':
          return {
            lines: [6, 7, 8],
            note: 'Clave hallada en índice: salta directo al offset con 1 sola E/S'
          };
        case 'NO_ENCONTRADO':
          return {
            lines: [13],
            note: 'bajo > alto en RAM: la clave no existe (ahorro total de disco)'
          };
        default:
          return { lines: [1], note: 'En espera' };
      }
    }
  },

  csv: {
    fileName: 'src/algorithms/parseoCSV.ts',
    title: 'Autómata Finito de Parseo CSV (Streaming)',
    lines: [
      'for (let i = 0; i < csvText.length; i++) {',
      '  const ch = csvText[i];',
      '  if (estado === "FUERA_CAMPO") {',
      '    if (ch === \'"\') estado = "EN_CAMPO_COMILLAS";',
      '    else if (ch === ",") fila.push("");',
      '    else { campo += ch; estado = "EN_CAMPO_NORMAL"; }',
      '  } else if (estado === "EN_CAMPO_COMILLAS") {',
      '    if (ch === \'"\') estado = "ESPERANDO_FIN_COMILLA";',
      '    else campo += ch; // Ignora comas internas',
      '  } else if (estado === "EN_CAMPO_NORMAL") {',
      '    if (ch === ",") { fila.push(campo); campo = ""; }',
      '    else if (ch === "\\n") { emitirFila(fila); }',
      '    else campo += ch;',
      '  }',
      '}'
    ],
    getActiveLines: (badge) => {
      switch (badge) {
        case 'FUERA_CAMPO':
          return {
            lines: [3, 4, 5, 6],
            note: 'Estado FUERA_CAMPO: evalúa apertura de comillas, delimitador o carácter'
          };
        case 'EN_CAMPO_COMILLAS':
          return {
            lines: [7, 8, 9],
            note: 'Estado EN_CAMPO_COMILLAS: protege comas internas como texto literal'
          };
        case 'ESPERANDO_FIN_COMILLA':
          return {
            lines: [7, 8],
            note: 'Comilla de cierre detectada: espera coma separadora o salto de línea'
          };
        case 'EN_CAMPO_NORMAL':
          return {
            lines: [10, 11, 12, 13],
            note: 'Estado EN_CAMPO_NORMAL: acumula carácter o corta en coma/salto'
          };
        default:
          return { lines: [1, 2], note: 'Escaneando flujo de caracteres' };
      }
    }
  },

  seek: {
    fileName: 'src/algorithms/punteroSeekTell.ts',
    title: 'Descriptor Binario POSIX: seek, read, tell',
    lines: [
      'class FileDescriptor {',
      '  cursor = 0;',
      '  tell(): number {',
      '    return this.cursor; // O(1)',
      '  }',
      '  seek(offset: number, whence: 0 | 1 | 2): number {',
      '    const base = whence === 0 ? 0',
      '      : whence === 1 ? this.cursor : this.eof;',
      '    this.cursor = clamp(base + offset, 0, this.eof);',
      '    return this.cursor; // Salto directo O(1)',
      '  }',
      '  read(n: number): Uint8Array {',
      '    const slice = this.buffer.subarray(this.cursor, this.cursor + n);',
      '    this.cursor += slice.length; // Avanza puntero',
      '    return slice;',
      '  }',
      '}'
    ],
    getActiveLines: (badge) => {
      switch (badge) {
        case 'INIT':
          return {
            lines: [1, 2],
            note: 'Abre descriptor de archivo e inicializa puntero cursor = 0'
          };
        case 'TELL':
          return {
            lines: [3, 4, 5],
            note: 'Llamada tell(): consulta el offset actual sin mover el cabezal'
          };
        case 'SEEK':
          return {
            lines: [6, 7, 8, 9, 10],
            note: 'Llamada seek(offset, whence): reposiciona el cursor en O(1)'
          };
        case 'READ':
          return {
            lines: [12, 13, 14, 15],
            note: 'Llamada read(n): transfiere n bytes y desplaza cursor += n'
          };
        default:
          return { lines: [1], note: 'Descriptor activo' };
      }
    }
  },

  asignacion: {
    fileName: 'src/algorithms/asignacionDisco.ts',
    title: 'Asignación en Disco (Contigua / Enlazada / Inodo)',
    lines: [
      'function operarSistemaArchivos(estrategia, op) {',
      '  if (estrategia === "contigua") {',
      '    // Requiere N bloques adyacentes libres',
      '    return buscarTramoContiguo(disco, N);',
      '  }',
      '  if (estrategia === "enlazada") {',
      '    // Bloques dispersos unidos por puntero siguiente',
      '    bloqueActual.siguiente = proximoBloqueLibre();',
      '    return recorrerCadenaSecuencial(inicio);',
      '  }',
      '  if (estrategia === "indexada") {',
      '    // Tabla Inodo concentra todos los punteros en 1 bloque',
      '    inodo.punteros.push(bloqueDatos);',
      '    return disco[inodo.punteros[indiceBloque]]; // O(1)',
      '  }',
      '}'
    ],
    getActiveLines: (badge) => {
      if (badge.includes('CONTIGUA') || badge.includes('FALLO_FRAGMENTACION')) {
        return {
          lines: [2, 3, 4],
          note: 'Asignación Contigua: verifica adyacencia o sufre fragmentación externa'
        };
      }
      if (badge.includes('ENLAZADA') || badge.includes('SIGUIENDO_PUNTERO')) {
        return {
          lines: [6, 7, 8, 9],
          note: 'Asignación Enlazada: salta de bloque en bloque siguiendo punteros'
        };
      }
      if (badge.includes('INDEXADA') || badge.includes('INODO')) {
        return {
          lines: [11, 12, 13, 14],
          note: 'Asignación Indexada: consulta tabla de Inodo para acceso directo'
        };
      }
      return {
        lines: [1, 2, 6, 11],
        note: 'Evaluando bloques físicos en el volumen de almacenamiento'
      };
    }
  },

  raid: {
    fileName: 'src/algorithms/raidSimulacion.ts',
    title: 'Controladora RAID 0 (Striping) vs RAID 1 (Mirror)',
    lines: [
      'function controladoraRAID(nivel, bloque, i) {',
      '  if (nivel === "raid0") {',
      '    // Striping: reparte pares en D0 e impares en D1',
      '    const disco = i % 2;',
      '    const sector = Math.floor(i / 2);',
      '    escribirSector(disco, sector, bloque);',
      '  } else if (nivel === "raid1") {',
      '    // Mirroring: escritura simultánea en espejo 1:1',
      '    escribirSector(0, i, bloque); // Disco 0',
      '    escribirSector(1, i, bloque); // Disco 1 (Espejo)',
      '  }',
      '  if (disco1Fallido) {',
      '    if (nivel === "raid0" && i % 2 === 1) throw "CORRUPTO";',
      '    return leerFailoverDesdeDisco0(i); // RAID 1 OK',
      '  }',
      '}'
    ],
    getActiveLines: (badge) => {
      switch (badge) {
        case 'INICIO':
          return {
            lines: [1],
            note: 'Inicializa canales SATA/NVMe de Disco 0 y Disco 1'
          };
        case 'ESCRIBIENDO_DISCOS':
          return {
            lines: [2, 4, 5, 6, 7, 9, 10],
            note: 'Despacha bloque según política Striping (mod 2) o Mirroring (1:1)'
          };
        case 'FALLO_FISICO_DISCO1':
          return {
            lines: [12],
            note: 'Interrupción de hardware: el Disco 1 queda fuera de línea'
          };
        case 'RECONSTRUYENDO_LECTURA':
          return {
            lines: [12, 13, 14],
            note: 'Intenta reconstruir el archivo: evalúa disponibilidad o failover'
          };
        case 'COMPLETADO':
          return {
            lines: [14, 16],
            note: 'Operación de controladora RAID finalizada'
          };
        default:
          return { lines: [1], note: 'En espera' };
      }
    }
  }
};

export const CodeTracerPanel: React.FC<CodeTracerPanelProps> = ({
  moduleId,
  stateBadge,
  stepIdx,
  onStartResize,
  onResetWidth,
  isResizing
}) => {
  const def = CODE_DEFINITIONS[moduleId];
  const { lines: activeLines, note } = def.getActiveLines(stateBadge, stepIdx);

  return (
    <aside className="code-tracer-panel">
      <div
        className={`code-resizer-sash ${isResizing ? 'is-dragging' : ''}`}
        onMouseDown={onStartResize}
        onDoubleClick={onResetWidth}
        title="Arrastra el borde para redimensionar el panel de código (doble clic para restaurar)"
      />
      <div className="code-tracer-header">
        <div>
          <div className="code-tracer-title">
            <svg className="icon" viewBox="0 0 24 24">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>TRAZADOR DE CÓDIGO EN VIVO</span>
          </div>
          <div className="code-tracer-file">{def.fileName}</div>
        </div>
        <span className="code-pc-badge">
          LÍNEA {activeLines.join(', ')}
        </span>
      </div>

      <div className="code-lines-container">
        {def.lines.map((lineText, idx) => {
          const lineNum = idx + 1;
          const isActive = activeLines.includes(lineNum);

          return (
            <div
              key={lineNum}
              className={`code-line ${isActive ? 'is-executing' : ''}`}
            >
              <span className="code-gutter">
                <span className="code-arrow">{isActive ? '►' : ' '}</span>
                <span>{String(lineNum).padStart(2, '0')}</span>
              </span>
              <pre className="code-text">{lineText}</pre>
            </div>
          );
        })}
      </div>

      <div className="code-tracer-footer">
        <div className="code-tracer-note-label">PUNTERO DE INSTRUCCIÓN (PC)</div>
        <div className="code-tracer-note-text">{note}</div>
      </div>
    </aside>
  );
};

