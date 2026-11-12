import React from 'react';
import { StepCubetas } from '../types/algorithms';

interface CubetasViewProps {
  step: StepCubetas;
}

const BUCKET_COLORS = [
  'var(--sig-amber)',
  'var(--sig-ice)',
  'var(--sig-emerald)',
  'var(--sig-violet)',
  'var(--sig-rose)',
  'var(--sig-amber)'
];

export const CubetasView: React.FC<CubetasViewProps> = ({ step }) => {
  const totalIO = step.accesos_io_lectura + step.accesos_io_escritura;
  const totalN = step.cintaEntrada.length;
  const progresoSalidaPct =
    totalN > 0 ? Math.round((step.cintaSalida.length / totalN) * 100) : 100;

  return (
    <>
      {/* Barra de telemetría de hardware */}
      <section className="telemetry-strip">
        <div className="telemetry-cell">
          <span className="telemetry-label">Fase de Distribución</span>
          <span
            className="telemetry-val"
            style={{
              fontSize: '15px',
              color:
                step.estado === 'FINALIZADO'
                  ? 'var(--sig-emerald)'
                  : 'var(--sig-amber)'
            }}
          >
            {step.estado === 'INICIO' && '0 · Preparación'}
            {step.estado === 'DISTRIBUYENDO' && '1 · Scatter O(N)'}
            {step.estado === 'ORDENANDO_CUBETA' && '2 · Sort Local RAM'}
            {step.estado === 'CONCATENANDO' && '3 · Gather O(K)'}
            {step.estado === 'FINALIZADO' && 'Completado'}
          </span>
          <span className="telemetry-sub">{step.fase}</span>
        </div>

        <div className="telemetry-cell">
          <span className="telemetry-label">Comparaciones CPU (RAM)</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-ice)' }}>
            {step.comparaciones_cpu}
          </span>
          <span className="telemetry-sub">
            Insertion Sort dentro de cada cubeta
          </span>
        </div>

        <div className="telemetry-cell">
          <span className="telemetry-label">Transferencias E/S Disco</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-violet)' }}>
            {totalIO}{' '}
            <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>
              ({step.accesos_io_lectura}R / {step.accesos_io_escritura}W)
            </span>
          </span>
          <span className="telemetry-sub">
            Partición por bloques sin mezcla K-vías
          </span>
        </div>

        <div className="telemetry-cell">
          <span className="telemetry-label">Cinta de Salida (F0)</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-emerald)' }}>
            {step.cintaSalida.length} / {totalN}{' '}
            <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>
              ({progresoSalidaPct}%)
            </span>
          </span>
          <span className="telemetry-sub">
            {step.cubetas.length} cubetas de rango fijo
          </span>
        </div>
      </section>

      {/* Escenario Principal */}
      <section className="canvas-stage">
        {/* Panel 1: Cinta de Entrada */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <svg className="icon" viewBox="0 0 24 24">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="8" cy="12" r="2" />
                <circle cx="16" cy="12" r="2" />
              </svg>
              <span>
                1. CINTA DE ENTRADA DESORDENADA — CLASIFICACIÓN ARITMÉTICA POR
                RANGO
              </span>
            </div>
            {step.elementoEnTransito ? (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11.5px',
                  color: BUCKET_COLORS[step.elementoEnTransito.cubetaDestino]
                }}
              >
                CLASIFICANDO: Valor {step.elementoEnTransito.valor} → Cubeta B
                {step.elementoEnTransito.cubetaDestino}
              </span>
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--ink-muted)'
                }}
              >
                {step.indiceLectura >= step.cintaEntrada.length
                  ? 'LECTURA SECUENCIAL COMPLETADA (EOF)'
                  : `CABEZAL EN POSICIÓN [${step.indiceLectura}]`}
              </span>
            )}
          </div>

          <div
            className="tape-deck"
            style={{ justifyContent: 'flex-start', padding: '14px' }}
          >
            {step.cintaEntrada.map((val, idx) => {
              const isCurrent =
                step.estado === 'DISTRIBUYENDO' && idx === step.indiceLectura;
              const isProcessed =
                step.estado !== 'INICIO' &&
                (step.estado !== 'DISTRIBUYENDO' || idx < step.indiceLectura);

              return (
                <div
                  key={`in-${idx}`}
                  className={`register-block ${isCurrent ? 'is-comparing' : ''}`}
                  style={{
                    opacity: isProcessed ? 0.38 : 1,
                    borderColor: isCurrent
                      ? 'var(--sig-amber)'
                      : 'var(--border-subtle)',
                    background: isCurrent
                      ? 'color-mix(in oklch, var(--sig-amber) 18%, var(--bg-surface))'
                      : undefined
                  }}
                >
                  <div className="reg-addr">
                    <span>A[{idx}]</span>
                    <span>
                      {isCurrent ? '◄ READ' : isProcessed ? 'SENT' : ''}
                    </span>
                  </div>
                  <div className="reg-val">{val}</div>
                  <div
                    className="reg-run-bar"
                    style={{
                      background: isCurrent
                        ? 'var(--sig-amber)'
                        : isProcessed
                        ? 'var(--ink-muted)'
                        : 'transparent'
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Sub-arreglos / Cubetas de Rango (B0 .. BK-1) */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
              <span>
                2. CUBETAS DE PARTICIÓN EN DISCO / RAM (SUB-ARREGLOS POR RANGO
                LÓGICO)
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--ink-muted)'
              }}
            >
              b = ⌊(valor - min) / amplitud⌋
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${step.cubetas.length}, minmax(160px, 1fr))`,
              gap: '12px'
            }}
          >
            {step.cubetas.map((cubeta, bIdx) => {
              const color = BUCKET_COLORS[bIdx % BUCKET_COLORS.length];
              const isActive = step.cubetaActiva === bIdx;

              return (
                <div
                  key={`bucket-${cubeta.id}`}
                  style={{
                    background: isActive
                      ? `color-mix(in oklch, ${color} 10%, var(--bg-canvas))`
                      : 'var(--bg-canvas)',
                    border: `1px solid ${
                      isActive ? color : 'var(--border-subtle)'
                    }`,
                    borderRadius: '6px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'all 180ms ease'
                  }}
                >
                  {/* Encabezado de la Cubeta */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-hairline)',
                      paddingBottom: '6px'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          fontWeight: 700,
                          color
                        }}
                      >
                        {cubeta.etiqueta}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10.5px',
                          color: 'var(--ink-secondary)'
                        }}
                      >
                        Rango: [{cubeta.rangoMin} – {cubeta.rangoMax}]
                      </div>
                    </div>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        background: cubeta.vaciada
                          ? 'color-mix(in oklch, var(--sig-emerald) 18%, transparent)'
                          : cubeta.ordenada
                          ? 'color-mix(in oklch, var(--sig-ice) 18%, transparent)'
                          : 'var(--bg-elevated)',
                        color: cubeta.vaciada
                          ? 'var(--sig-emerald)'
                          : cubeta.ordenada
                          ? 'var(--sig-ice)'
                          : 'var(--ink-muted)',
                        border: '1px solid var(--border-hairline)'
                      }}
                    >
                      {cubeta.vaciada
                        ? 'CONCATENADA'
                        : cubeta.ordenada
                        ? 'ORDENADA RAM'
                        : `${cubeta.elementos.length} ítems`}
                    </span>
                  </div>

                  {/* Elementos dentro de la cubeta */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      minHeight: '56px',
                      alignContent: 'flex-start'
                    }}
                  >
                    {cubeta.elementos.length === 0 ? (
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: 'var(--ink-muted)',
                          margin: 'auto'
                        }}
                      >
                        [ Cubeta vacía ]
                      </div>
                    ) : (
                      cubeta.elementos.map((el, eIdx) => {
                        const isJustAdded =
                          step.estado === 'DISTRIBUYENDO' &&
                          isActive &&
                          eIdx === cubeta.elementos.length - 1;

                        return (
                          <div
                            key={`b-${bIdx}-el-${eIdx}`}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '14px',
                              fontWeight: 700,
                              padding: '6px 10px',
                              borderRadius: '4px',
                              background: isJustAdded
                                ? `color-mix(in oklch, ${color} 28%, var(--bg-surface))`
                                : 'var(--bg-surface)',
                              border: `1px solid ${
                                isJustAdded || cubeta.ordenada
                                  ? color
                                  : 'var(--border-subtle)'
                              }`,
                              color: 'var(--ink-primary)',
                              opacity: cubeta.vaciada ? 0.5 : 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              minWidth: '42px'
                            }}
                          >
                            <span
                              style={{
                                fontSize: '9px',
                                color: 'var(--ink-muted)',
                                fontWeight: 400
                              }}
                            >
                              #{eIdx}
                            </span>
                            <span>{el}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 3: Cinta de Salida Concatenada (F0) */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </svg>
              <span>
                3. CINTA DE SALIDA ORDENADA (F0) — CONCATENACIÓN DIRECTA B0 + B1
                + ... + BK-1
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color:
                  step.estado === 'FINALIZADO'
                    ? 'var(--sig-emerald)'
                    : 'var(--sig-amber)'
              }}
            >
              {step.estado === 'FINALIZADO'
                ? 'ARCHIVO TOTALMENTE ORDENADO'
                : `${step.cintaSalida.length} / ${totalN} REGISTROS VOLCADOS`}
            </span>
          </div>

          <div
            className="tape-deck"
            style={{
              justifyContent: 'flex-start',
              minHeight: '92px',
              padding: '14px',
              borderStyle: step.cintaSalida.length === 0 ? 'dashed' : 'solid'
            }}
          >
            {step.cintaSalida.length === 0 ? (
              <div
                style={{
                  margin: 'auto',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--ink-muted)'
                }}
              >
                [ CINTA DE SALIDA F0 EN ESPERA DE LA FASE 3 (GATHER) ]
                <br />
                Una vez que cada cubeta se ordena en RAM, se concatenan en orden
                sin comparaciones adicionales.
              </div>
            ) : (
              step.cintaSalida.map((val, idx) => {
                // Identificar de qué cubeta provino para mantener su color distintivo
                let bucketOrigin = 0;
                for (let b = 0; b < step.cubetas.length; b++) {
                  if (
                    val >= step.cubetas[b].rangoMin &&
                    val <= step.cubetas[b].rangoMax
                  ) {
                    bucketOrigin = b;
                    break;
                  }
                }
                const color =
                  BUCKET_COLORS[bucketOrigin % BUCKET_COLORS.length];

                return (
                  <div
                    key={`out-${idx}`}
                    className="register-block"
                    style={{
                      borderColor: color,
                      background: `color-mix(in oklch, ${color} 12%, var(--bg-surface))`
                    }}
                  >
                    <div className="reg-addr">
                      <span>#{idx}</span>
                      <span style={{ color }}>B{bucketOrigin}</span>
                    </div>
                    <div className="reg-val">{val}</div>
                    <div
                      className="reg-run-bar"
                      style={{ background: color }}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
};

