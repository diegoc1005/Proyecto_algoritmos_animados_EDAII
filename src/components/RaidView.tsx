import React from 'react';
import { SectorDiscoRaid, StepRaid } from '../types/algorithms';

interface RaidViewProps {
  step: StepRaid;
}

export const RaidView: React.FC<RaidViewProps> = ({ step }) => {
  const isRaid0 = step.nivel === 'raid0';
  const hayCorrupcion = step.archivoReconstruido.some((r) => !r.integro);

  const renderDisco = (
    titulo: string,
    subtitulo: string,
    sectores: SectorDiscoRaid[],
    fallido: boolean
  ) => {
    const ocupados = sectores.filter((s) => s.bloque !== null).length;

    return (
      <div
        style={{
          background: fallido
            ? 'color-mix(in oklch, var(--sig-rose) 8%, var(--bg-canvas))'
            : 'var(--bg-canvas)',
          border: `1px solid ${
            fallido ? 'var(--sig-rose)' : 'var(--border-subtle)'
          }`,
          borderRadius: '6px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          position: 'relative'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-hairline)',
            paddingBottom: '8px'
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 700,
                color: fallido ? 'var(--sig-rose)' : 'var(--ink-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{titulo}</span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  background: fallido
                    ? 'color-mix(in oklch, var(--sig-rose) 22%, transparent)'
                    : 'color-mix(in oklch, var(--sig-emerald) 18%, transparent)',
                  color: fallido ? 'var(--sig-rose)' : 'var(--sig-emerald)'
                }}
              >
                {fallido ? 'AVERÍA FÍSICA (OFFLINE)' : 'ONLINE · SMART OK'}
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--ink-muted)',
                marginTop: '2px'
              }}
            >
              {subtitulo}
            </div>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--ink-secondary)'
            }}
          >
            {ocupados} / {sectores.length} sectores
          </span>
        </div>

        {/* Grid de Sectores Físicos del Disco */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          }}
        >
          {sectores.map((sec) => {
            const b = sec.bloque;
            const isWriting = sec.escribiendoAhora;
            const isReading = sec.leyendoAhora;

            return (
              <div
                key={`sec-${sec.sectorIdx}`}
                style={{
                  padding: '10px',
                  borderRadius: '5px',
                  background: isWriting
                    ? 'color-mix(in oklch, var(--sig-amber) 22%, var(--bg-surface))'
                    : isReading
                    ? 'color-mix(in oklch, var(--sig-emerald) 22%, var(--bg-surface))'
                    : b
                    ? `color-mix(in oklch, ${b.color} 12%, var(--bg-surface))`
                    : 'var(--bg-surface)',
                  border: `1px ${b ? 'solid' : 'dashed'} ${
                    isWriting
                      ? 'var(--sig-amber)'
                      : isReading
                      ? 'var(--sig-emerald)'
                      : fallido && b
                      ? 'var(--sig-rose)'
                      : b
                      ? b.color
                      : 'var(--border-subtle)'
                  }`,
                  opacity: fallido ? 0.55 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minHeight: '66px',
                  justifyContent: 'space-between'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--ink-muted)'
                  }}
                >
                  <span>SECTOR #{sec.sectorIdx}</span>
                  {isWriting && (
                    <span style={{ color: 'var(--sig-amber)', fontWeight: 700 }}>
                      ● WRITE
                    </span>
                  )}
                  {isReading && (
                    <span
                      style={{ color: 'var(--sig-emerald)', fontWeight: 700 }}
                    >
                      ● READ
                    </span>
                  )}
                  {fallido && b && !isWriting && !isReading && (
                    <span style={{ color: 'var(--sig-rose)', fontWeight: 700 }}>
                      ✕ INACCESIBLE
                    </span>
                  )}
                </div>

                {b ? (
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: fallido ? 'var(--sig-rose)' : b.color
                      }}
                    >
                      {b.id} · {b.payload}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--ink-muted)'
                    }}
                  >
                    [ LIBRE ]
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Barra de telemetría de hardware */}
      <section className="telemetry-strip">
        <div className="telemetry-cell">
          <span className="telemetry-label">Arquitectura Activa</span>
          <span
            className="telemetry-val"
            style={{ color: isRaid0 ? 'var(--sig-amber)' : 'var(--sig-ice)' }}
          >
            {isRaid0 ? 'RAID 0 (Striping)' : 'RAID 1 (Mirroring)'}
          </span>
          <span className="telemetry-sub">
            {isRaid0
              ? 'Distribución intercalada sin paridad'
              : 'Duplicación síncrona en espejo 1:1'}
          </span>
        </div>

        <div className="telemetry-cell">
          <span className="telemetry-label">Eficiencia de Capacidad</span>
          <span
            className="telemetry-val"
            style={{
              color: isRaid0 ? 'var(--sig-emerald)' : 'var(--sig-amber)'
            }}
          >
            {step.capacidadEfectivaPct}%{' '}
            <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>
              ({isRaid0 ? '12 / 12' : '6 / 12'} bloques útiles)
            </span>
          </span>
          <span className="telemetry-sub">
            {isRaid0
              ? 'Aprovecha la suma total de ambos discos'
              : '50% reservado para redundancia espejo'}
          </span>
        </div>

        <div className="telemetry-cell">
          <span className="telemetry-label">Ciclos Bus / Ops Físicas</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-violet)' }}>
            {step.ciclosRelojIO} ciclos{' '}
            <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>
              ({step.operacionesFisicasDisco} I/O)
            </span>
          </span>
          <span className="telemetry-sub">
            {isRaid0
              ? 'Escritura paralela 2x en ambos canales'
              : 'Cada bloque genera 2 escrituras físicas'}
          </span>
        </div>

        <div className="telemetry-cell">
          <span className="telemetry-label">Tolerancia a Fallos</span>
          <span
            className="telemetry-val"
            style={{
              fontSize: '15px',
              color: hayCorrupcion
                ? 'var(--sig-rose)'
                : isRaid0
                ? 'var(--sig-amber)'
                : 'var(--sig-emerald)'
            }}
          >
            {hayCorrupcion
              ? 'PÉRDIDA CRÍTICA (50%)'
              : step.disco1Fallido && !isRaid0
              ? 'FAILOVER ACTIVO (100% OK)'
              : step.toleranciaFallos}
          </span>
          <span className="telemetry-sub">
            {step.disco1Fallido
              ? 'Disco 1 desconectado por falla física'
              : 'Ambos discos operando normalmente'}
          </span>
        </div>
      </section>

      {/* Escenario Principal */}
      <section className="canvas-stage">
        {/* Panel 1: Flujo de Bloques Entrantes y Controladora RAID */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <svg className="icon" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.01" />
                <path d="M10 8h.01" />
                <path d="M14 8h.01" />
              </svg>
              <span>
                1. FLUJO DE BLOQUES DEL ARCHIVO ENTRANTE Y CONTROLADORA DE
                HARDWARE RAID
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: isRaid0 ? 'var(--sig-amber)' : 'var(--sig-ice)'
              }}
            >
              {isRaid0
                ? 'MODO STRIPING: Destino = Índice_Bloque mod 2'
                : 'MODO MIRRORING: Escritura simultánea en Disco 0 + Disco 1'}
            </span>
          </div>

          <div
            className="tape-deck"
            style={{ justifyContent: 'flex-start', padding: '14px' }}
          >
            {step.colaEntrada.map((b, idx) => {
              const isCurrent =
                step.estado === 'ESCRIBIENDO_DISCOS' &&
                idx === step.indiceBloqueActual;
              const isDispatched =
                step.indiceBloqueActual > idx ||
                step.estado === 'COMPLETADO' ||
                step.estado === 'FALLO_FISICO_DISCO1' ||
                step.estado === 'RECONSTRUYENDO_LECTURA';

              return (
                <div
                  key={b.id}
                  className={`register-block ${isCurrent ? 'is-comparing' : ''}`}
                  style={{
                    minWidth: '125px',
                    opacity: isDispatched && !isCurrent ? 0.48 : 1,
                    borderColor: isCurrent ? b.color : 'var(--border-subtle)',
                    background: isCurrent
                      ? `color-mix(in oklch, ${b.color} 20%, var(--bg-surface))`
                      : undefined
                  }}
                >
                  <div className="reg-addr">
                    <span>{b.id}</span>
                    <span style={{ color: b.color }}>
                      {isRaid0
                        ? `→ D${idx % 2}`
                        : '→ D0 + D1'}
                    </span>
                  </div>
                  <div
                    className="reg-val"
                    style={{ fontSize: '13px', letterSpacing: '0.02em' }}
                  >
                    {b.payload}
                  </div>
                  <div
                    className="reg-run-bar"
                    style={{
                      background: isCurrent || isDispatched ? b.color : 'transparent'
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Unidades de Disco Físicas (Disco 0 y Disco 1) */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <svg className="icon" viewBox="0 0 24 24">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                <path d="M3 12A9 3 0 0 0 21 12" />
              </svg>
              <span>
                2. ARREGLO FÍSICO DE DISCOS INDEPENDIENTES (CANAL SATA/NVME 0 Y
                CANAL 1)
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: step.disco1Fallido
                  ? 'var(--sig-rose)'
                  : 'var(--ink-muted)'
              }}
            >
              {step.disco1Fallido
                ? '¡ALERTA! DISCO 1 FUERA DE LÍNEA — PROBANDO RECUPERACIÓN'
                : '6 SECTORES FÍSICOS POR UNIDAD (12 SECTORES EN TOTAL)'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}
          >
            {renderDisco(
              'DISCO FÍSICO 0 (Unidad Primaria)',
              isRaid0
                ? 'Almacena bloques pares (B0, B2, B4)'
                : 'Copia Primaria Completa (B0..B5)',
              step.disco0,
              false
            )}
            {renderDisco(
              'DISCO FÍSICO 1 (Unidad Secundaria)',
              isRaid0
                ? 'Almacena bloques impares (B1, B3, B5)'
                : 'Copia Espejo Idéntica / Mirror (B0..B5)',
              step.disco1,
              step.disco1Fallido
            )}
          </div>
        </div>

        {/* Panel 3: Verificación de Integridad del Archivo al Leer */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>
                3. VERIFICACIÓN DE LECTURA Y RECONSTRUCCIÓN DEL ARCHIVO EN RAM
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: hayCorrupcion
                  ? 'var(--sig-rose)'
                  : step.archivoReconstruido.length > 0
                  ? 'var(--sig-emerald)'
                  : 'var(--ink-muted)'
              }}
            >
              {hayCorrupcion
                ? 'ARCHIVO CORRUPTO: BLOQUES IMPARES IRRECUPERABLES EN RAID 0'
                : step.archivoReconstruido.length === step.colaEntrada.length
                ? 'ARCHIVO 100% ÍNTEGRO Y VERIFICADO'
                : 'ESPERANDO LECTURA DE SECTORES...'}
            </span>
          </div>

          <div
            className="tape-deck"
            style={{
              justifyContent: 'flex-start',
              minHeight: '88px',
              padding: '14px',
              borderStyle:
                step.archivoReconstruido.length === 0 ? 'dashed' : 'solid'
            }}
          >
            {step.archivoReconstruido.length === 0 ? (
              <div
                style={{
                  margin: 'auto',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--ink-muted)'
                }}
              >
                [ BUFFER DE LECTURA DEL SISTEMA OPERATIVO ]
                <br />
                Avanza los pasos para observar cómo la controladora reconstruye
                el archivo desde los discos físicos.
              </div>
            ) : (
              step.archivoReconstruido.map((item, idx) => (
                <div
                  key={`rec-${idx}`}
                  className="register-block"
                  style={{
                    minWidth: '132px',
                    borderColor: item.integro
                      ? 'var(--sig-emerald)'
                      : 'var(--sig-rose)',
                    background: item.integro
                      ? 'color-mix(in oklch, var(--sig-emerald) 14%, var(--bg-surface))'
                      : 'color-mix(in oklch, var(--sig-rose) 20%, var(--bg-surface))'
                  }}
                >
                  <div className="reg-addr">
                    <span>{item.id}</span>
                    <span
                      style={{
                        color: item.integro
                          ? 'var(--sig-emerald)'
                          : 'var(--sig-rose)'
                      }}
                    >
                      {item.origen}
                    </span>
                  </div>
                  <div
                    className="reg-val"
                    style={{
                      fontSize: '12.5px',
                      color: item.integro
                        ? 'var(--ink-primary)'
                        : 'var(--sig-rose)'
                    }}
                  >
                    {item.payload}
                  </div>
                  <div
                    className="reg-run-bar"
                    style={{
                      background: item.integro
                        ? 'var(--sig-emerald)'
                        : 'var(--sig-rose)'
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
};

