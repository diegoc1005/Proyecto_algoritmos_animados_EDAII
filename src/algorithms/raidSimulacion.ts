import {
  BloqueRaid,
  EscenarioRaid,
  NivelRaid,
  SectorDiscoRaid,
  StepRaid
} from '../types/algorithms';

export const BLOQUES_ARCHIVO_RAID_DEFAULT: BloqueRaid[] = [
  {
    id: 'B0',
    etiqueta: 'BLOQUE 0',
    payload: 'HDR_MAGIC',
    color: 'var(--sig-amber)'
  },
  {
    id: 'B1',
    etiqueta: 'BLOQUE 1',
    payload: 'META_ROOT',
    color: 'var(--sig-ice)'
  },
  {
    id: 'B2',
    etiqueta: 'BLOQUE 2',
    payload: 'REC_01_50',
    color: 'var(--sig-emerald)'
  },
  {
    id: 'B3',
    etiqueta: 'BLOQUE 3',
    payload: 'REC_51_99',
    color: 'var(--sig-violet)'
  },
  {
    id: 'B4',
    etiqueta: 'BLOQUE 4',
    payload: 'IDX_BTREE',
    color: 'var(--sig-rose)'
  },
  {
    id: 'B5',
    etiqueta: 'BLOQUE 5',
    payload: 'EOF_CRC32',
    color: 'var(--sig-amber)'
  }
];

function clonarSectores(sectores: SectorDiscoRaid[]): SectorDiscoRaid[] {
  const copia: SectorDiscoRaid[] = [];
  for (let i = 0; i < sectores.length; i++) {
    const s = sectores[i];
    copia.push({
      sectorIdx: s.sectorIdx,
      bloque: s.bloque ? { ...s.bloque } : null,
      escribiendoAhora: s.escribiendoAhora,
      leyendoAhora: s.leyendoAhora
    });
  }
  return copia;
}

function limpiarBanderasActivas(sectores: SectorDiscoRaid[]): void {
  for (let i = 0; i < sectores.length; i++) {
    sectores[i].escribiendoAhora = false;
    sectores[i].leyendoAhora = false;
  }
}

/**
 * Simulador paso a paso de arreglos redundantes de discos independientes:
 * RAID 0 (Striping / Intercalado por bloques) vs RAID 1 (Mirroring / Espejo).
 */
export function simularRaid(
  nivel: NivelRaid,
  escenario: EscenarioRaid,
  bloquesEntrada: BloqueRaid[] = BLOQUES_ARCHIVO_RAID_DEFAULT
): StepRaid[] {
  const pasos: StepRaid[] = [];
  const numSectoresPorDisco = 6;

  const disco0: SectorDiscoRaid[] = [];
  const disco1: SectorDiscoRaid[] = [];
  for (let s = 0; s < numSectoresPorDisco; s++) {
    disco0.push({
      sectorIdx: s,
      bloque: null,
      escribiendoAhora: false,
      leyendoAhora: false
    });
    disco1.push({
      sectorIdx: s,
      bloque: null,
      escribiendoAhora: false,
      leyendoAhora: false
    });
  }

  const capacidadPct = nivel === 'raid0' ? 100 : 50;
  const toleranciaTexto =
    nivel === 'raid0'
      ? '0 Discos (Sin redundancia)'
      : '1 Disco (Redundancia total 1:1)';

  let ciclosReloj = 0;
  let opsFisicas = 0;
  const reconstruido: Array<{
    id: string;
    payload: string;
    origen: 'DISCO 0' | 'DISCO 1' | 'PERDIDO (CORRUPTO)';
    integro: boolean;
  }> = [];

  // Paso 0: Estado Inicial
  pasos.push({
    paso: 0,
    estado: 'INICIO',
    nivel,
    escenario,
    colaEntrada: [...bloquesEntrada],
    indiceBloqueActual: -1,
    disco0: clonarSectores(disco0),
    disco1: clonarSectores(disco1),
    disco1Fallido: false,
    archivoReconstruido: [],
    ciclosRelojIO: 0,
    operacionesFisicasDisco: 0,
    capacidadEfectivaPct: capacidadPct,
    toleranciaFallos: toleranciaTexto,
    explicacion:
      nivel === 'raid0'
        ? `Controladora configurada en RAID 0 (Striping). Los ${bloquesEntrada.length} bloques entrantes se dividirán de forma intercalada entre el Disco 0 (pares) y el Disco 1 (impares) para maximizar la velocidad y usar el 100% de capacidad.`
        : `Controladora configurada en RAID 1 (Mirroring). Cada uno de los ${bloquesEntrada.length} bloques entrantes se escribirá duplicado en espejo tanto en el Disco 0 como en el Disco 1 para garantizar tolerancia a fallos.`
  });

  // =========================================================================
  // FASE 1: ESCRITURA DE BLOQUES EN EL ARREGLO RAID
  // =========================================================================
  if (nivel === 'raid0') {
    // En RAID 0 distribuimos intercaladamente (Striping): bloque i va al disco (i % 2), sector floor(i / 2)
    for (let i = 0; i < bloquesEntrada.length; i++) {
      limpiarBanderasActivas(disco0);
      limpiarBanderasActivas(disco1);

      const bloque = bloquesEntrada[i];
      const targetDisk = i % 2; // 0 = Disco 0, 1 = Disco 1
      const targetSector = Math.floor(i / 2);

      // En RAID 0 dos bloques consecutivos (par e impar) pueden despacharse en el mismo ciclo de bus paralelo
      if (i % 2 === 0) {
        ciclosReloj++;
      }
      opsFisicas++;

      if (targetDisk === 0) {
        disco0[targetSector].bloque = { ...bloque };
        disco0[targetSector].escribiendoAhora = true;
      } else {
        disco1[targetSector].bloque = { ...bloque };
        disco1[targetSector].escribiendoAhora = true;
      }

      pasos.push({
        paso: pasos.length,
        estado: 'ESCRIBIENDO_DISCOS',
        nivel,
        escenario,
        colaEntrada: [...bloquesEntrada],
        indiceBloqueActual: i,
        disco0: clonarSectores(disco0),
        disco1: clonarSectores(disco1),
        disco1Fallido: false,
        archivoReconstruido: [],
        ciclosRelojIO: ciclosReloj,
        operacionesFisicasDisco: opsFisicas,
        capacidadEfectivaPct: capacidadPct,
        toleranciaFallos: toleranciaTexto,
        explicacion: `STRIPING (${bloque.id}): Índice ${i} mod 2 = ${targetDisk} → La controladora envía "${bloque.payload}" al DISCO ${targetDisk} en el Sector Físico #${targetSector}.`
      });
    }
  } else {
    // En RAID 1 duplicamos cada bloque simultáneamente en el mismo sector de Disco 0 y Disco 1
    for (let i = 0; i < bloquesEntrada.length; i++) {
      limpiarBanderasActivas(disco0);
      limpiarBanderasActivas(disco1);

      const bloque = bloquesEntrada[i];
      ciclosReloj++;
      opsFisicas += 2; // 2 escrituras físicas (1 en cada disco)

      disco0[i].bloque = { ...bloque };
      disco0[i].escribiendoAhora = true;

      disco1[i].bloque = { ...bloque };
      disco1[i].escribiendoAhora = true;

      pasos.push({
        paso: pasos.length,
        estado: 'ESCRIBIENDO_DISCOS',
        nivel,
        escenario,
        colaEntrada: [...bloquesEntrada],
        indiceBloqueActual: i,
        disco0: clonarSectores(disco0),
        disco1: clonarSectores(disco1),
        disco1Fallido: false,
        archivoReconstruido: [],
        ciclosRelojIO: ciclosReloj,
        operacionesFisicasDisco: opsFisicas,
        capacidadEfectivaPct: capacidadPct,
        toleranciaFallos: toleranciaTexto,
        explicacion: `MIRRORING (${bloque.id}): La controladora duplica "${bloque.payload}" escribiéndolo en simultáneo en el Sector #${i} del DISCO 0 y en el Sector #${i} del DISCO 1 (Espejo).`
      });
    }
  }

  limpiarBanderasActivas(disco0);
  limpiarBanderasActivas(disco1);

  // =========================================================================
  // FASE 2: VERIFICACIÓN DE LECTURA O SIMULACIÓN DE FALLO FÍSICO EN DISCO 1
  // =========================================================================
  if (escenario === 'escritura') {
    // Reconstruimos el archivo leyendo normalmente con ambos discos sanos
    for (let i = 0; i < bloquesEntrada.length; i++) {
      const bOrig = bloquesEntrada[i];
      reconstruido.push({
        id: bOrig.id,
        payload: bOrig.payload,
        origen: nivel === 'raid0' ? (i % 2 === 0 ? 'DISCO 0' : 'DISCO 1') : 'DISCO 0',
        integro: true
      });
    }

    pasos.push({
      paso: pasos.length,
      estado: 'COMPLETADO',
      nivel,
      escenario,
      colaEntrada: [...bloquesEntrada],
      indiceBloqueActual: bloquesEntrada.length,
      disco0: clonarSectores(disco0),
      disco1: clonarSectores(disco1),
      disco1Fallido: false,
      archivoReconstruido: [...reconstruido],
      ciclosRelojIO: ciclosReloj,
      operacionesFisicasDisco: opsFisicas,
      capacidadEfectivaPct: capacidadPct,
      toleranciaFallos: toleranciaTexto,
      explicacion:
        nivel === 'raid0'
          ? `Escritura RAID 0 completada en solo ${ciclosReloj} ciclos paralelos de bus (3 sectores ocupados por disco, 50% de espacio libre restante en cada unidad).`
          : `Escritura RAID 1 completada en ${ciclosReloj} ciclos con ${opsFisicas} escrituras físicas totales. Ambos discos contienen una copia idéntica 1:1 del archivo.`
    });
  } else {
    // Escenario: SIMULAR FALLO CATASTRÓFICO DEL DISCO 1
    pasos.push({
      paso: pasos.length,
      estado: 'FALLO_FISICO_DISCO1',
      nivel,
      escenario,
      colaEntrada: [...bloquesEntrada],
      indiceBloqueActual: bloquesEntrada.length,
      disco0: clonarSectores(disco0),
      disco1: clonarSectores(disco1),
      disco1Fallido: true,
      archivoReconstruido: [],
      ciclosRelojIO: ciclosReloj,
      operacionesFisicasDisco: opsFisicas,
      capacidadEfectivaPct: capacidadPct,
      toleranciaFallos: toleranciaTexto,
      explicacion: `¡ALERTA DE HARDWARE! El DISCO 1 sufre una avería física y queda fuera de línea. El sistema operativo solicita leer el archivo completo desde la controladora RAID.`
    });

    // Intentar leer cada bloque lógico del archivo (B0..B5)
    for (let i = 0; i < bloquesEntrada.length; i++) {
      limpiarBanderasActivas(disco0);
      limpiarBanderasActivas(disco1);

      if (nivel === 'raid0') {
        const targetDisk = i % 2;
        const targetSector = Math.floor(i / 2);

        if (targetDisk === 0) {
          disco0[targetSector].leyendoAhora = true;
          const b = disco0[targetSector].bloque!;
          reconstruido.push({
            id: b.id,
            payload: b.payload,
            origen: 'DISCO 0',
            integro: true
          });

          pasos.push({
            paso: pasos.length,
            estado: 'RECONSTRUYENDO_LECTURA',
            nivel,
            escenario,
            colaEntrada: [...bloquesEntrada],
            indiceBloqueActual: i,
            disco0: clonarSectores(disco0),
            disco1: clonarSectores(disco1),
            disco1Fallido: true,
            archivoReconstruido: [...reconstruido],
            ciclosRelojIO: ciclosReloj,
            operacionesFisicasDisco: opsFisicas + 1,
            capacidadEfectivaPct: capacidadPct,
            toleranciaFallos: toleranciaTexto,
            explicacion: `Leyendo ${b.id}: Alojado en DISCO 0 (Sector #${targetSector}). La unidad está operativa → se recupera "${b.payload}".`
          });
          opsFisicas++;
        } else {
          // Bloque impar estaba en Disco 1 (que falló) -> PÉRDIDA DE DATOS
          reconstruido.push({
            id: bloquesEntrada[i].id,
            payload: 'ERR_IO_LOST',
            origen: 'PERDIDO (CORRUPTO)',
            integro: false
          });

          pasos.push({
            paso: pasos.length,
            estado: 'RECONSTRUYENDO_LECTURA',
            nivel,
            escenario,
            colaEntrada: [...bloquesEntrada],
            indiceBloqueActual: i,
            disco0: clonarSectores(disco0),
            disco1: clonarSectores(disco1),
            disco1Fallido: true,
            archivoReconstruido: [...reconstruido],
            ciclosRelojIO: ciclosReloj,
            operacionesFisicasDisco: opsFisicas,
            capacidadEfectivaPct: capacidadPct,
            toleranciaFallos: toleranciaTexto,
            explicacion: `ERROR CRÍTICO en ${bloquesEntrada[i].id}: Este bloque fue distribuido al DISCO 1 (Sector #${targetSector}) y NO existe copia en el Disco 0. ¡Datos irrecuperables!`
          });
        }
      } else {
        // En RAID 1: Aunque el Disco 1 falló, el Disco 0 tiene todos los sectores B0..B5 íntegros
        disco0[i].leyendoAhora = true;
        const b = disco0[i].bloque!;
        opsFisicas++;
        reconstruido.push({
          id: b.id,
          payload: b.payload,
          origen: 'DISCO 0',
          integro: true
        });

        pasos.push({
          paso: pasos.length,
          estado: 'RECONSTRUYENDO_LECTURA',
          nivel,
          escenario,
          colaEntrada: [...bloquesEntrada],
          indiceBloqueActual: i,
          disco0: clonarSectores(disco0),
          disco1: clonarSectores(disco1),
          disco1Fallido: true,
          archivoReconstruido: [...reconstruido],
          ciclosRelojIO: ciclosReloj,
          operacionesFisicasDisco: opsFisicas,
          capacidadEfectivaPct: capacidadPct,
          toleranciaFallos: toleranciaTexto,
          explicacion: `FAILOVER AUTOMÁTICO (${b.id}): El Disco 1 no responde, pero la controladora RAID 1 lee la copia espejo desde el DISCO 0 (Sector #${i}) → "${b.payload}" recuperado sin pérdida.`
        });
      }
    }

    limpiarBanderasActivas(disco0);
    limpiarBanderasActivas(disco1);

    pasos.push({
      paso: pasos.length,
      estado: 'COMPLETADO',
      nivel,
      escenario,
      colaEntrada: [...bloquesEntrada],
      indiceBloqueActual: bloquesEntrada.length,
      disco0: clonarSectores(disco0),
      disco1: clonarSectores(disco1),
      disco1Fallido: true,
      archivoReconstruido: [...reconstruido],
      ciclosRelojIO: ciclosReloj,
      operacionesFisicasDisco: opsFisicas,
      capacidadEfectivaPct: capacidadPct,
      toleranciaFallos: toleranciaTexto,
      explicacion:
        nivel === 'raid0'
          ? `RESULTADO RAID 0 ANTE FALLO: Archivo CORRUPTO (50% de bloques perdidos). RAID 0 ofrece máximo rendimiento y capacidad, pero la falla de un solo disco destruye todo el volumen.`
          : `RESULTADO RAID 1 ANTE FALLO: 100% de integridad preservada. Gracias al Mirroring, el sistema continúa operando desde el Disco 0 sin perder un solo byte.`
    });
  }

  return pasos;
}

