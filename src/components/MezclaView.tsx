import React from 'react';
import { StepMezcla } from '../types/algorithms';

const RUN_TONES = [
  'oklch(0.74 0.155 158)', // Emerald
  'oklch(0.76 0.11 225)',  // Ice Blue
  'oklch(0.78 0.155 72)',  // Amber
  'oklch(0.71 0.15 295)',  // Violet
  'oklch(0.68 0.17 18)'    // Terracotta
];

interface MezclaViewProps {
  step: StepMezcla;
}

export const MezclaView: React.FC<MezclaViewProps> = ({ step }) => {
  const arr = step.cinta;
  let runCounter = 0;

  return (
    <>
      <section className="telemetry-strip">
        <div className="telemetry-cell">
          <span className="telemetry-label">Corridas Activas</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-emerald)' }}>
            {step.corridas.length}
          </span>
          <span className="telemetry-sub">
            {step.fase || 'Subsecuencias monótonas'}
          </span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">Fronteras de Corte</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-coral)' }}>
            {step.rupturas.length}
          </span>
          <span className="telemetry-sub">Inversiones A[i] &lt; A[i-1]</span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">Comparaciones Totales</span>
          <span className="telemetry-val">{step.comparaciones}</span>
          <span className="telemetry-sub">Detección + fusión 2-punteros</span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">Transferencias Bloque E/S</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-amber)' }}>
            {step.accesos_io}{' '}
            <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>
              ops
            </span>
          </span>
          <span className="telemetry-sub">Costo O(N/B · log₂ R)</span>
        </div>
      </section>

      <section className="canvas-stage">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <svg className="icon" viewBox="0 0 24 24">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="8" cy="12" r="2" />
                <circle cx="16" cy="12" r="2" />
              </svg>
              <span>CINTA PRINCIPAL EN DISCO (ESTADO FÍSICO DE LOS REGISTROS)</span>
            </div>

            {step.comparando && step.valores_comparados ? (
              step.estado === 'FUSIONANDO' ? (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                    color: 'var(--sig-amber)'
                  }}
                >
                  FUSIÓN 2-VÍAS: Izq={step.valores_comparados[0]} vs Der=
                  {step.valores_comparados[1]} &nbsp;→&nbsp; Pasa el menor (
                  {Math.min(
                    step.valores_comparados[0],
                    step.valores_comparados[1]
                  )}
                  )
                </span>
              ) : (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                    color: step.es_ruptura
                      ? 'var(--sig-coral)'
                      : 'var(--sig-emerald)'
                  }}
                >
                  A[{step.comparando[1]}]={step.valores_comparados[1]}{' '}
                  {step.es_ruptura ? '<' : '≥'} A[{step.comparando[0]}]=
                  {step.valores_comparados[0]} &nbsp;·&nbsp;{' '}
                  {step.es_ruptura
                    ? 'INVERSIÓN DETECTADA (CORTE)'
                    : 'ORDEN PRESERVADO'}
                </span>
              )
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--sig-amber)'
                }}
              >
                {step.fase || 'EN PROCESO'}
              </span>
            )}
          </div>

          <div className="tape-deck">
            {arr.map((val, i) => {
              const isCut = step.rupturas.includes(i);
              if (isCut) {
                runCounter += 1;
              }
              const scanned =
                step.estado === 'FINALIZADO' ||
                step.estado === 'FUSIONANDO' ||
                i < step.indice_actual ||
                (i === step.indice_actual && step.estado !== 'COMPARANDO');
              const activePair =
                step.comparando !== null && step.comparando.includes(i);
              const tone = RUN_TONES[runCounter % RUN_TONES.length];

              return (
                <React.Fragment key={i}>
                  {isCut && (
                    <div
                      className="blade-marker"
                      title={`Frontera de corrida en índice ${i}`}
                    >
                      <svg
                        className="icon"
                        style={{ color: 'var(--sig-coral)' }}
                        viewBox="0 0 24 24"
                      >
                        <circle cx="6" cy="6" r="3" />
                        <circle cx="6" cy="18" r="3" />
                        <line x1="20" y1="4" x2="8.12" y2="15.88" />
                        <line x1="14.47" y1="14.48" x2="20" y2="20" />
                        <line x1="8.12" y1="8.12" x2="12" y2="12" />
                      </svg>
                      <div className="blade-line" />
                    </div>
                  )}

                  <div
                    className={`register-block ${activePair ? 'is-comparing' : ''}`}
                    style={
                      scanned && !activePair
                        ? {
                            borderColor: `color-mix(in oklch, ${tone} 45%, transparent)`
                          }
                        : undefined
                    }
                  >
                    <div className="reg-addr">
                      <span>#{i}</span>
                      <span>{scanned ? `R${runCounter + 1}` : ''}</span>
                    </div>
                    <div className="reg-val">{val}</div>
                    <div
                      className="reg-run-bar"
                      style={{ background: scanned ? tone : 'transparent' }}
                    />
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </svg>
              <span>CINTAS AUXILIARES (CORRIDAS NATURALES EN CADA PASADA)</span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--ink-muted)'
              }}
            >
              {step.corridas.length === 1 && step.estado === 'FINALIZADO'
                ? '1 CORRIDA = ARCHIVO ORDENADO'
                : 'Fusión de 2 vías sin usar Array.sort()'}
            </span>
          </div>

          {step.detalle_fusion && (
            <div
              style={{
                background: 'oklch(0.115 0.005 265)',
                border: '1px solid var(--sig-amber)',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px'
                }}
              >
                <span style={{ color: 'var(--sig-amber)', fontWeight: 700 }}>
                  ⚡ PROCESADOR DE FUSIÓN 2-VÍAS EN CURSO (PASADA{' '}
                  {step.detalle_fusion.pasada})
                </span>
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {step.detalle_fusion.comparandoPar
                    ? `Comparando frente a frente: ${step.detalle_fusion.comparandoPar[0]} vs ${step.detalle_fusion.comparandoPar[1]}`
                    : 'Corrida fusionada y consolidada en cinta'}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1.35fr',
                  gap: '10px',
                  alignItems: 'center'
                }}
              >
                {/* Sub-corrida Izquierda */}
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 10px'
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--sig-emerald)',
                      marginBottom: '6px'
                    }}
                  >
                    SUB-CORRIDA IZQ (pIzq)
                  </div>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {step.detalle_fusion.corridaIzq.map((v, idx) => {
                      const activeIdx =
                        step.detalle_fusion!.origenSeleccionado === 'IZQ'
                          ? step.detalle_fusion!.punteroIzq - 1
                          : step.detalle_fusion!.punteroIzq;
                      const isHead =
                        step.detalle_fusion!.origenSeleccionado !==
                          'COMPLETADA' && idx === activeIdx;
                      const isDone = idx < activeIdx;
                      return (
                        <span
                          key={idx}
                          className="run-cell"
                          style={{
                            opacity: isDone ? 0.32 : 1,
                            borderColor: isHead
                              ? 'var(--sig-amber)'
                              : 'var(--border-subtle)',
                            background: isHead
                              ? 'color-mix(in oklch, var(--sig-amber) 22%, var(--bg-elevated))'
                              : undefined
                          }}
                        >
                          {v}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-corrida Derecha */}
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 10px'
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--sig-ice)',
                      marginBottom: '6px'
                    }}
                  >
                    SUB-CORRIDA DER (pDer)
                  </div>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {step.detalle_fusion.corridaDer.map((v, idx) => {
                      const activeIdx =
                        step.detalle_fusion!.origenSeleccionado === 'DER'
                          ? step.detalle_fusion!.punteroDer - 1
                          : step.detalle_fusion!.punteroDer;
                      const isHead =
                        step.detalle_fusion!.origenSeleccionado !==
                          'COMPLETADA' && idx === activeIdx;
                      const isDone = idx < activeIdx;
                      return (
                        <span
                          key={idx}
                          className="run-cell"
                          style={{
                            opacity: isDone ? 0.32 : 1,
                            borderColor: isHead
                              ? 'var(--sig-amber)'
                              : 'var(--border-subtle)',
                            background: isHead
                              ? 'color-mix(in oklch, var(--sig-amber) 22%, var(--bg-elevated))'
                              : undefined
                          }}
                        >
                          {v}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Buffer de salida de la fusión actual */}
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--sig-emerald)',
                    borderRadius: '6px',
                    padding: '8px 10px'
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--sig-emerald)',
                      marginBottom: '6px',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>RESULTADO ORDENADO PASO A PASO</span>
                    <span>
                      {step.detalle_fusion.bufferFusion.length} /{' '}
                      {step.detalle_fusion.corridaIzq.length +
                        step.detalle_fusion.corridaDer.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {step.detalle_fusion.bufferFusion.map((v, idx) => {
                      const isNewest =
                        idx === step.detalle_fusion!.bufferFusion.length - 1;
                      return (
                        <span
                          key={idx}
                          className="run-cell"
                          style={{
                            borderColor: isNewest
                              ? 'var(--sig-emerald)'
                              : 'var(--border-subtle)',
                            background: isNewest
                              ? 'color-mix(in oklch, var(--sig-emerald) 24%, var(--bg-elevated))'
                              : undefined,
                            color: 'var(--ink-primary)'
                          }}
                        >
                          {v}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="runs-lanes">
            {step.corridas.map((run, idx) => {
              const tone = RUN_TONES[idx % RUN_TONES.length];
              const pctWidth = Math.round((run.length / arr.length) * 100);
              return (
                <div className="run-lane" key={idx}>
                  <div className="run-lane-id" style={{ color: tone }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '2px',
                        background: tone,
                        display: 'inline-block'
                      }}
                    />
                    <span>CORRIDA_0{idx + 1}</span>
                  </div>
                  <div className="run-lane-cells">
                    {run.map((v, cIdx) => (
                      <span
                        key={cIdx}
                        className="run-cell"
                        style={{
                          borderColor: `color-mix(in oklch, ${tone} 45%, transparent)`
                        }}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--ink-muted)'
                    }}
                  >
                    len={run.length} ({pctWidth}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
