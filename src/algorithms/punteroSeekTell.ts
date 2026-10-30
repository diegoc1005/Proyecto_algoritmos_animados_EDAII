import {
  LogConsolaEntry,
  OperacionSeek,
  StepSeek,
  WhenceMode
} from '../types/algorithms';

/**
 * 3. ALGORITMO DE MAURO ROBLES: PUNTERO DE ARCHIVO (seek, read, tell)
 * Emulación exacta de descriptor de archivo binario del Kernel (struct file)
 * sobre un buffer físico de bytes (Uint8Array) cargado desde 'datos/archivo_secuencial.txt'.
 * Soporta los 3 modos estándar POSIX para whence:
 *   0: SEEK_SET (desde inicio)
 *   1: SEEK_CUR (desde posición actual f_pos)
 *   2: SEEK_END (desde final EOF)
 */

export const TEXTO_ARCHIVO_SECUENCIAL_DEFAULT =
  'Hola mundo desde archivo secuencial.\n' +
  'Segunda linea de datos.\n' +
  'Tercera linea final.';

export const OPERACIONES_SEEK_DEFAULT: OperacionSeek[] = [
  { tipo: 'INIT', arg: null, whence: 0 },
  { tipo: 'TELL', arg: null, whence: 0 },
  { tipo: 'READ', arg: 10, whence: 0 },
  { tipo: 'TELL', arg: null, whence: 0 },
  { tipo: 'SEEK', arg: 0, whence: 0 },
  { tipo: 'SEEK', arg: 28, whence: 0 },
  { tipo: 'READ', arg: 8, whence: 0 },
  { tipo: 'SEEK', arg: 1, whence: 1 },
  { tipo: 'READ', arg: 13, whence: 0 },
  { tipo: 'SEEK', arg: -6, whence: 2 },
  { tipo: 'READ', arg: 6, whence: 0 }
];

const NOMBRES_WHENCE: Record<WhenceMode, string> = {
  0: 'SEEK_SET (0: desde inicio)',
  1: 'SEEK_CUR (1: desde pos actual)',
  2: 'SEEK_END (2: desde final EOF)'
};

/**
 * Descriptor de archivo binario con control estricto de f_pos y Clamping Guard.
 */
class VirtualBinaryFileDescriptor {
  private buffer: Uint8Array;
  private fPos: number = 0;

  constructor(contenidoTexto: string) {
    // Codificación byte a byte ASCII
    const bytes = new Uint8Array(contenidoTexto.length);
    for (let i = 0; i < contenidoTexto.length; i++) {
      bytes[i] = contenidoTexto.charCodeAt(i) & 0xff;
    }
    this.buffer = bytes;
    this.fPos = 0;
  }

  public size(): number {
    return this.buffer.length;
  }

  public tell(): number {
    return this.fPos;
  }

  /**
   * Reposiciona f_pos según el modo whence (0: SEEK_SET, 1: SEEK_CUR, 2: SEEK_END)
   * aplicando Clamping Guard dentro de [0, i_size].
   */
  public seek(offset: number, whence: WhenceMode = 0): number {
    const nBytes = this.buffer.length;
    let destino = 0;

    if (whence === 0) {
      destino = offset;
    } else if (whence === 1) {
      destino = this.fPos + offset;
    } else if (whence === 2) {
      destino = nBytes + offset;
    }

    // Clamping Guard para evitar underflow (< 0) u overflow (> EOF)
    if (destino < 0) destino = 0;
    if (destino > nBytes) destino = nBytes;

    this.fPos = destino;
    return this.fPos;
  }

  /**
   * Lee hasta n bytes desde f_pos y avanza el cabezal automáticamente.
   */
  public read(cantidad: number): string {
    const nBytes = this.buffer.length;
    const ini = this.fPos;
    const fin = Math.min(ini + Math.max(1, cantidad), nBytes);
    let resultado = '';

    for (let i = ini; i < fin; i++) {
      resultado += String.fromCharCode(this.buffer[i]);
    }

    this.fPos = fin;
    return resultado;
  }
}

export function generarPasosSeekTell(
  operaciones: OperacionSeek[] = OPERACIONES_SEEK_DEFAULT,
  textoArchivo: string = TEXTO_ARCHIVO_SECUENCIAL_DEFAULT
): {
  texto: string;
  totalBytes: number;
  pasos: StepSeek[];
} {
  // Normalizar saltos de línea CRLF a LF para mantener offsets exactos de 1 byte por salto
  const textoNormalizado = textoArchivo.replace(/\r\n/g, '\n');
  const fd = new VirtualBinaryFileDescriptor(textoNormalizado);
  const nBytes = fd.size();

  const leidosAcumulados: number[] = [];
  const logConsola: LogConsolaEntry[] = [];
  const pasos: StepSeek[] = [];

  for (let idx = 0; idx < operaciones.length; idx++) {
    const op = operaciones[idx];
    const tipo = op.tipo;
    const arg = op.arg;
    const whence: WhenceMode = op.whence ?? 0;
    let rangoActual: [number, number] = [-1, -1];
    let complejidad = 'O(1)';
    let retornoStr = '';
    let codigo = '';
    let explicacion = '';
    let posActual = fd.tell();

    if (tipo === 'INIT') {
      fd.seek(0, 0);
      posActual = fd.tell();
      retornoStr = "fd = 3 (modo 'rb')";
      codigo = "f = open('datos/archivo_secuencial.txt', 'rb')";
      explicacion = `Archivo físico abierto en modo binario exacto (${nBytes} bytes). El kernel inicializa f_pos = ${posActual}.`;
    } else if (tipo === 'TELL') {
      posActual = fd.tell();
      retornoStr = `${posActual}`;
      codigo = `f.tell()  # -> ${posActual}`;
      logConsola.push({ cmd: 'f.tell()', res: `${posActual}`, tipo: 'TELL' });
      const hexStr = posActual.toString(16).toUpperCase().padStart(2, '0');
      explicacion = `f.tell() consulta en O(1) el campo f_pos del descriptor en el kernel: puntero en byte ${posActual} (0x${hexStr}).`;
    } else if (tipo === 'SEEK') {
      const desplazamiento = arg !== null ? Math.trunc(arg) : 0;
      const posPrevia = fd.tell();
      posActual = fd.seek(desplazamiento, whence);

      const cmdStr =
        whence === 0
          ? `f.seek(${desplazamiento})`
          : `f.seek(${desplazamiento}, ${whence})`;
      retornoStr = `${posActual}`;
      codigo = `${cmdStr}  # ${NOMBRES_WHENCE[whence]}`;
      logConsola.push({
        cmd: cmdStr,
        res: `f_pos=${posActual}`,
        tipo: 'SEEK'
      });
      explicacion = `${cmdStr} con ${NOMBRES_WHENCE[whence]}: salta en O(1) del byte ${posPrevia} al byte ${posActual} sin transferencia de bloques.`;
    } else if (tipo === 'READ') {
      const cantidad = Math.max(1, arg !== null ? Math.trunc(arg) : 1);
      const ini = fd.tell();
      const datosLeidos = fd.read(cantidad);
      posActual = fd.tell();
      const fin = posActual;

      rangoActual = [ini, fin];
      for (let b = ini; b < fin; b++) {
        if (!leidosAcumulados.includes(b)) {
          leidosAcumulados.push(b);
        }
      }

      const fragStr = datosLeidos.replace(/\n/g, '\\n');
      complejidad = 'O(k)';
      retornoStr = `"${fragStr}"`;
      const cmdStr = `f.read(${cantidad})`;
      codigo = `f.read(${cantidad})  # -> "${fragStr}"`;
      logConsola.push({
        cmd: cmdStr,
        res: `"${fragStr}"`,
        tipo: 'READ'
      });
      explicacion = `f.read(${cantidad}) consume ${fin - ini} bytes reales desde el offset ${ini} ("${fragStr}") y avanza f_pos a ${posActual} bytes.`;
    }

    pasos.push({
      paso: idx,
      tipo,
      codigo,
      retorno: retornoStr,
      cursor: posActual,
      rango_actual: rangoActual,
      leidos_acumulados: [...leidosAcumulados],
      complejidad,
      log: logConsola.map((entry) => ({ ...entry })),
      explicacion
    });
  }

  return {
    texto: textoNormalizado,
    totalBytes: nBytes,
    pasos
  };
}
