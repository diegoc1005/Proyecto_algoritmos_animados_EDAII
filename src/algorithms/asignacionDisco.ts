import {
  ArchivoDisco,
  BloqueDisco,
  EstrategiaAsignacion,
  StepAsignacion
} from '../types/algorithms';

/**
 * ASIGNACIÓN DE ESPACIO EN DISCO
 * Responsable: Mauro Alexis Robles de la Rosa (@Pikastroso)
 * 
 * Regla Estricta: Implementación pura desde cero en TypeScript.
 * CERO uso de librerías externas.
 * 
 * Modela un disco con 32 bloques físicos (de 4 KB cada uno)
 * comparando de forma interactiva las tres estrategias clásicas:
 * 1. Asignación Contigua: Rápida, O(1) de acceso aleatorio, pero sufre fragmentación externa.
 * 2. Asignación Enlazada: Cero fragmentación externa, pero O(k) saltos para acceso aleatorio.
 * 3. Asignación Indexada (Inodos): Acceso O(1) vía tabla de punteros, sin fragmentación externa.
 */

const TOTAL_BLOQUES = 32;

// Colores de sistema operativo para identificar archivos
const COLORES_ARCHIVOS: Record<string, string> = {
  f_kernel: 'oklch(0.74 0.155 158)', // Emerald
  f_logs: 'oklch(0.78 0.155 72)',   // Amber
  f_database: 'oklch(0.76 0.11 225)', // Ice Blue
  f_nuevo: 'oklch(0.71 0.15 295)'   // Violet
};

function inicializarDiscoVacio(): BloqueDisco[] {
  const bloques: BloqueDisco[] = [];
  for (let i = 0; i < TOTAL_BLOQUES; i++) {
    bloques.push({
      id: i,
      archivoId: null,
      color: 'transparent',
      tipo: 'libre',
      siguiente: null
    });
  }
  return bloques;
}

function clonarBloques(bloques: BloqueDisco[]): BloqueDisco[] {
  return bloques.map((b) => ({
    ...b,
    inodoBloques: b.inodoBloques ? [...b.inodoBloques] : undefined
  }));
}

function clonarArchivos(archivos: ArchivoDisco[]): ArchivoDisco[] {
  return archivos.map((a) => ({
    ...a,
    bloquesOcupados: [...a.bloquesOcupados]
  }));
}

/**
 * Simula el estado del disco y la operación solicitada:
 * - 'crear_fragmentado': Crea 3 archivos y borra el de en medio para generar huecos.
 * - 'insertar_nuevo': Intenta ubicar un archivo nuevo de 4 bloques (falla en contigua si no cabe en el hueco más grande, pero tiene éxito en enlazada/indexada).
 * - 'acceso_aleatorio': Lee el 3er bloque de un archivo, demostrando la diferencia entre 1 acceso (contigua/indexada) vs 3 saltos de disco (enlazada).
 */
export function simularAsignacionDisco(
  estrategia: EstrategiaAsignacion,
  accion: 'crear_fragmentado' | 'insertar_nuevo' | 'acceso_aleatorio' = 'insertar_nuevo'
): StepAsignacion[] {
  const pasos: StepAsignacion[] = [];
  let bloques = inicializarDiscoVacio();
  let archivos: ArchivoDisco[] = [];

  // 1. Estado inicial con archivos preexistentes simulando fragmentación
  if (estrategia === 'contigua') {
    // Archivo A (Kernel): Bloques 0..3 (4 bloques)
    for (let i = 0; i < 4; i++) {
      bloques[i] = { id: i, archivoId: 'kernel.sys', color: COLORES_ARCHIVOS.f_kernel, tipo: 'datos', siguiente: null };
    }
    // Hueco libre de 2 bloques (4 y 5) que dejó un archivo borrado
    // Archivo B (Database): Bloques 6..10 (5 bloques)
    for (let i = 6; i <= 10; i++) {
      bloques[i] = { id: i, archivoId: 'database.db', color: COLORES_ARCHIVOS.f_database, tipo: 'datos', siguiente: null };
    }
    // Hueco libre de 3 bloques (11, 12, 13)
    // Archivo C (Logs): Bloques 14..17 (4 bloques)
    for (let i = 14; i <= 17; i++) {
      bloques[i] = { id: i, archivoId: 'system.log', color: COLORES_ARCHIVOS.f_logs, tipo: 'datos', siguiente: null };
    }
    // Bloques libres del 18 al 31 (14 bloques libres al final)

    archivos = [
      { id: 'kernel.sys', nombre: 'kernel.sys', color: COLORES_ARCHIVOS.f_kernel, tamBloques: 4, bloqueInicio: 0, bloquesOcupados: [0, 1, 2, 3] },
      { id: 'database.db', nombre: 'database.db', color: COLORES_ARCHIVOS.f_database, tamBloques: 5, bloqueInicio: 6, bloquesOcupados: [6, 7, 8, 9, 10] },
      { id: 'system.log', nombre: 'system.log', color: COLORES_ARCHIVOS.f_logs, tamBloques: 4, bloqueInicio: 14, bloquesOcupados: [14, 15, 16, 17] }
    ];
  } else if (estrategia === 'enlazada') {
    // Archivo A: [0 -> 1 -> 2 -> 3]
    const bKernel = [0, 1, 2, 3];
    for (let i = 0; i < bKernel.length; i++) {
      const bId = bKernel[i];
      const sig = i + 1 < bKernel.length ? bKernel[i + 1] : null;
      bloques[bId] = { id: bId, archivoId: 'kernel.sys', color: COLORES_ARCHIVOS.f_kernel, tipo: 'datos', siguiente: sig };
    }
    // Archivo B: esparcido en [6, 7, 8, 9, 10]
    const bDb = [6, 7, 8, 9, 10];
    for (let i = 0; i < bDb.length; i++) {
      const bId = bDb[i];
      const sig = i + 1 < bDb.length ? bDb[i + 1] : null;
      bloques[bId] = { id: bId, archivoId: 'database.db', color: COLORES_ARCHIVOS.f_database, tipo: 'datos', siguiente: sig };
    }
    // Archivo C: esparcido en [14, 15, 16, 17]
    const bLogs = [14, 15, 16, 17];
    for (let i = 0; i < bLogs.length; i++) {
      const bId = bLogs[i];
      const sig = i + 1 < bLogs.length ? bLogs[i + 1] : null;
      bloques[bId] = { id: bId, archivoId: 'system.log', color: COLORES_ARCHIVOS.f_logs, tipo: 'datos', siguiente: sig };
    }

    archivos = [
      { id: 'kernel.sys', nombre: 'kernel.sys', color: COLORES_ARCHIVOS.f_kernel, tamBloques: 4, bloqueInicio: 0, bloquesOcupados: bKernel },
      { id: 'database.db', nombre: 'database.db', color: COLORES_ARCHIVOS.f_database, tamBloques: 5, bloqueInicio: 6, bloquesOcupados: bDb },
      { id: 'system.log', nombre: 'system.log', color: COLORES_ARCHIVOS.f_logs, tamBloques: 4, bloqueInicio: 14, bloquesOcupados: bLogs }
    ];
  } else {
    // Asignación Indexada (Inodos)
    // Inodo Kernel en bloque 0, apunta a datos [1, 2, 3]
    bloques[0] = { id: 0, archivoId: 'kernel.sys', color: COLORES_ARCHIVOS.f_kernel, tipo: 'inodo', siguiente: null, inodoBloques: [1, 2, 3] };
    for (let i = 1; i <= 3; i++) {
      bloques[i] = { id: i, archivoId: 'kernel.sys', color: COLORES_ARCHIVOS.f_kernel, tipo: 'datos', siguiente: null };
    }
    // Inodo DB en bloque 6, apunta a datos [7, 8, 9, 10]
    bloques[6] = { id: 6, archivoId: 'database.db', color: COLORES_ARCHIVOS.f_database, tipo: 'inodo', siguiente: null, inodoBloques: [7, 8, 9, 10] };
    for (let i = 7; i <= 10; i++) {
      bloques[i] = { id: i, archivoId: 'database.db', color: COLORES_ARCHIVOS.f_database, tipo: 'datos', siguiente: null };
    }
    // Inodo Logs en bloque 14, apunta a datos [15, 16, 17]
    bloques[14] = { id: 14, archivoId: 'system.log', color: COLORES_ARCHIVOS.f_logs, tipo: 'inodo', siguiente: null, inodoBloques: [15, 16, 17] };
    for (let i = 15; i <= 17; i++) {
      bloques[i] = { id: i, archivoId: 'system.log', color: COLORES_ARCHIVOS.f_logs, tipo: 'datos', siguiente: null };
    }

    archivos = [
      { id: 'kernel.sys', nombre: 'kernel.sys', color: COLORES_ARCHIVOS.f_kernel, tamBloques: 4, bloqueInicio: 0, bloqueInodo: 0, bloquesOcupados: [0, 1, 2, 3] },
      { id: 'database.db', nombre: 'database.db', color: COLORES_ARCHIVOS.f_database, tamBloques: 5, bloqueInicio: 6, bloqueInodo: 6, bloquesOcupados: [6, 7, 8, 9, 10] },
      { id: 'system.log', nombre: 'system.log', color: COLORES_ARCHIVOS.f_logs, tamBloques: 4, bloqueInicio: 14, bloqueInodo: 14, bloquesOcupados: [14, 15, 16, 17] }
    ];
  }

  // Contar bloques libres
  let libres = 0;
  for (let i = 0; i < TOTAL_BLOQUES; i++) {
    if (bloques[i].tipo === 'libre') libres++;
  }

  // Paso 0: Estado inicial del mapa de bits del disco
  pasos.push({
    paso: 0,
    estado: 'DISCO_INICIAL',
    estrategia,
    bloques: clonarBloques(bloques),
    archivos: clonarArchivos(archivos),
    bloqueActivo: null,
    bloquesRecorridos: [],
    saltosCabezal: 0,
    fragmentacionExterna: estrategia === 'contigua' ? 26.3 : 0,
    bloquesLibresTotales: libres,
    explicacion: `Disco inicializado con Estrategia ${estrategia.toUpperCase()} (32 bloques físicos de 4KB). Hay huecos libres dispersos (bloques 4-5 y 11-13).`
  });

  // Operación: Insertar un archivo nuevo de 4 bloques (app.exe)
  if (accion === 'insertar_nuevo') {
    const colorNuevo = COLORES_ARCHIVOS.f_nuevo;

    if (estrategia === 'contigua') {
      // Buscar el primer hueco contiguo con capacidad >= 4
      pasos.push({
        paso: pasos.length,
        estado: 'ESCANEANDO_HUECOS',
        estrategia,
        bloques: clonarBloques(bloques),
        archivos: clonarArchivos(archivos),
        bloqueActivo: 4,
        bloquesRecorridos: [4, 5],
        saltosCabezal: 1,
        fragmentacionExterna: 26.3,
        bloquesLibresTotales: libres,
        explicacion: `Buscando espacio contiguo para app.exe (4 bloques): Evaluando primer hueco [4..5] (longitud 2). ¡Insuficiente! Fragmentación externa impide usarlo.`
      });

      pasos.push({
        paso: pasos.length,
        estado: 'ESCANEANDO_HUECOS',
        estrategia,
        bloques: clonarBloques(bloques),
        archivos: clonarArchivos(archivos),
        bloqueActivo: 11,
        bloquesRecorridos: [11, 12, 13],
        saltosCabezal: 2,
        fragmentacionExterna: 26.3,
        bloquesLibresTotales: libres,
        explicacion: `Evaluando segundo hueco [11..13] (longitud 3). Requiere 4 bloques contiguos. ¡Tampoco cabe! Se desperdician 5 bloques libres dispersos.`
      });

      // El primer hueco contiguo válido está en el bloque 18
      const inicioAsig = 18;
      const bNuevos = [18, 19, 20, 21];
      for (const b of bNuevos) {
        bloques[b] = { id: b, archivoId: 'app.exe', color: colorNuevo, tipo: 'datos', siguiente: null };
      }
      archivos.push({
        id: 'app.exe',
        nombre: 'app.exe',
        color: colorNuevo,
        tamBloques: 4,
        bloqueInicio: inicioAsig,
        bloquesOcupados: bNuevos
      });
      libres -= 4;

      pasos.push({
        paso: pasos.length,
        estado: 'ASIGNADO_EXITOSO',
        estrategia,
        bloques: clonarBloques(bloques),
        archivos: clonarArchivos(archivos),
        bloqueActivo: inicioAsig,
        bloquesRecorridos: bNuevos,
        saltosCabezal: 1,
        fragmentacionExterna: 18.5,
        bloquesLibresTotales: libres,
        explicacion: `Archivo asignado contiguamente en bloques [18..21]. Acceso aleatorio O(1), pero los huecos [4..5] y [11..13] quedaron inutilizados (fragmentación externa).`
      });
    } else if (estrategia === 'enlazada') {
      // Usa cualquier bloque libre: por ejemplo toma los huecos [4, 5, 11, 12] y los enlaza
      const bElegidos = [4, 5, 11, 12];
      for (let i = 0; i < bElegidos.length; i++) {
        const bId = bElegidos[i];
        const sig = i + 1 < bElegidos.length ? bElegidos[i + 1] : null;
        bloques[bId] = { id: bId, archivoId: 'app.exe', color: colorNuevo, tipo: 'datos', siguiente: sig };

        pasos.push({
          paso: pasos.length,
          estado: 'ENLAZANDO_BLOQUE',
          estrategia,
          bloques: clonarBloques(bloques),
          archivos: clonarArchivos(archivos),
          bloqueActivo: bId,
          bloquesRecorridos: bElegidos.slice(0, i + 1),
          saltosCabezal: i + 1,
          fragmentacionExterna: 0,
          bloquesLibresTotales: libres - (i + 1),
          explicacion: `Asignación Enlazada: Ocupando bloque libre #${bId}. ${sig !== null ? `Puntero interno apunta al bloque #${sig}.` : 'Marca EOF (último bloque).'}`
        });
      }

      archivos.push({
        id: 'app.exe',
        nombre: 'app.exe',
        color: colorNuevo,
        tamBloques: 4,
        bloqueInicio: bElegidos[0],
        bloquesOcupados: bElegidos
      });
      libres -= 4;

      pasos.push({
        paso: pasos.length,
        estado: 'ASIGNADO_EXITOSO',
        estrategia,
        bloques: clonarBloques(bloques),
        archivos: clonarArchivos(archivos),
        bloqueActivo: bElegidos[0],
        bloquesRecorridos: bElegidos,
        saltosCabezal: 4,
        fragmentacionExterna: 0,
        bloquesLibresTotales: libres,
        explicacion: `Asignación Enlazada completada: Los huecos [4, 5, 11, 12] fueron aprovechados al 100% (cero fragmentación externa). Entrada en directorio: inicio en Bloque #4.`
      });
    } else {
      // Asignación Indexada (Inodo en bloque 4, datos en 5, 11, 12)
      const inodoId = 4;
      const bDatos = [5, 11, 12];
      bloques[inodoId] = { id: inodoId, archivoId: 'app.exe', color: colorNuevo, tipo: 'inodo', siguiente: null, inodoBloques: bDatos };

      pasos.push({
        paso: pasos.length,
        estado: 'CREANDO_INODO',
        estrategia,
        bloques: clonarBloques(bloques),
        archivos: clonarArchivos(archivos),
        bloqueActivo: inodoId,
        bloquesRecorridos: [inodoId],
        saltosCabezal: 1,
        fragmentacionExterna: 0,
        bloquesLibresTotales: libres - 1,
        explicacion: `Asignación Indexada: Se asigna Bloque #${inodoId} como INODO del archivo (tabla de punteros en disco).`
      });

      for (let i = 0; i < bDatos.length; i++) {
        const bId = bDatos[i];
        bloques[bId] = { id: bId, archivoId: 'app.exe', color: colorNuevo, tipo: 'datos', siguiente: null };

        pasos.push({
          paso: pasos.length,
          estado: 'INDEXANDO_DATOS',
          estrategia,
          bloques: clonarBloques(bloques),
          archivos: clonarArchivos(archivos),
          bloqueActivo: bId,
          bloquesRecorridos: [inodoId, ...bDatos.slice(0, i + 1)],
          saltosCabezal: 1,
          fragmentacionExterna: 0,
          bloquesLibresTotales: libres - (i + 2),
          explicacion: `Bloque de datos #${bId} registrado en la tabla del Inodo: Inodo[${i}] → Bloque ${bId}. Cero fragmentación externa.`
        });
      }

      archivos.push({
        id: 'app.exe',
        nombre: 'app.exe',
        color: colorNuevo,
        tamBloques: 4, // 1 inodo + 3 datos
        bloqueInicio: inodoId,
        bloqueInodo: inodoId,
        bloquesOcupados: [inodoId, ...bDatos]
      });
      libres -= 4;

      pasos.push({
        paso: pasos.length,
        estado: 'ASIGNADO_EXITOSO',
        estrategia,
        bloques: clonarBloques(bloques),
        archivos: clonarArchivos(archivos),
        bloqueActivo: inodoId,
        bloquesRecorridos: [inodoId, ...bDatos],
        saltosCabezal: 1,
        fragmentacionExterna: 0,
        bloquesLibresTotales: libres,
        explicacion: `Asignación Indexada completada: Inodo #4 centraliza los punteros a [5, 11, 12]. Permite acceso aleatorio O(1) sin desperdiciar huecos.`
      });
    }
  }

  // Operación: Acceso Aleatorio al 3er bloque de datos de database.db
  if (accion === 'acceso_aleatorio') {
    const targetFile = 'database.db';
    const archivo = archivos.find((a) => a.id === targetFile);

    if (archivo) {
      if (estrategia === 'contigua') {
        const bloqueDestino = archivo.bloqueInicio + 2; // Índice 2 = 3er bloque
        pasos.push({
          paso: pasos.length,
          estado: 'SALTO_DIRECTO',
          estrategia,
          bloques: clonarBloques(bloques),
          archivos: clonarArchivos(archivos),
          bloqueActivo: bloqueDestino,
          bloquesRecorridos: [bloqueDestino],
          saltosCabezal: 1,
          fragmentacionExterna: 26.3,
          bloquesLibresTotales: libres,
          explicacion: `Acceso Aleatorio a Bloque Lógico #2 de ${targetFile}: Cálculo O(1) directo: ${archivo.bloqueInicio} + 2 = Bloque Físico #${bloqueDestino}. 1 solo acceso a disco.`
        });
      } else if (estrategia === 'enlazada') {
        // En enlazada hay que recorrer desde el bloque de inicio uno por uno
        const camino = [6, 7, 8];
        for (let i = 0; i < camino.length; i++) {
          const bId = camino[i];
          pasos.push({
            paso: pasos.length,
            estado: 'RECORRIENDO_ENLACE',
            estrategia,
            bloques: clonarBloques(bloques),
            archivos: clonarArchivos(archivos),
            bloqueActivo: bId,
            bloquesRecorridos: camino.slice(0, i + 1),
            saltosCabezal: i + 1,
            fragmentacionExterna: 0,
            bloquesLibresTotales: libres,
            explicacion: `Buscando Bloque Lógico #2 en Asignación Enlazada: Leyendo Bloque #${bId} (salto ${i + 1}/3) para obtener el puntero hacia el siguiente bloque. Costo O(k).`
          });
        }
      } else {
        // En indexada: lee el Inodo y va directo al bloque
        const inodoId = archivo.bloqueInodo!;
        const bloqueDestino = archivo.bloquesOcupados[3]; // El 3er bloque de datos (inodo está en 0)
        pasos.push({
          paso: pasos.length,
          estado: 'CONSULTANDO_INODO',
          estrategia,
          bloques: clonarBloques(bloques),
          archivos: clonarArchivos(archivos),
          bloqueActivo: inodoId,
          bloquesRecorridos: [inodoId],
          saltosCabezal: 1,
          fragmentacionExterna: 0,
          bloquesLibresTotales: libres,
          explicacion: `Acceso Aleatorio en Asignación Indexada: Leyendo Inodo #${inodoId}. Inodo[2] indica directamente Bloque #${bloqueDestino}.`
        });
        pasos.push({
          paso: pasos.length,
          estado: 'SALTO_DIRECTO',
          estrategia,
          bloques: clonarBloques(bloques),
          archivos: clonarArchivos(archivos),
          bloqueActivo: bloqueDestino,
          bloquesRecorridos: [inodoId, bloqueDestino],
          saltosCabezal: 2,
          fragmentacionExterna: 0,
          bloquesLibresTotales: libres,
          explicacion: `Salto inmediato al Bloque de datos #${bloqueDestino}. Acceso O(1) asistido por Inodo sin recorrer la cadena.`
        });
      }
    }
  }

  return pasos;
}
