import React from 'react';
import { StepMerge2Vias } from '../types/algorithms';

interface MergeSort2ViasViewProps {
  step: StepMerge2Vias;
}

export const MergeSort2ViasView: React.FC<MergeSort2ViasViewProps> = ({ step }) => {
  const isComparing = step.estado === 'COMPARANDO';
  const totalIO = step.accesos_io_lectura + step.accesos_io_escritura;
  const lenTotal = step.cintaA.length + step.cintaB.length;
  const progresoSalidaPct = lenTotal > 0 ? Math.round((step.cintaSalida.length / lenTotal) * 100) : 100;

  return (
    <>
      {/* Barra de telemetría de hardware */}
      <section className="telemetry-strip">
        <div className="telemetry-cell">
          <span className="telemetry-label">Comparaciones ALU</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-amber)' }}>
            {step.comparaciones}
          </span>
          <span className="telemetry-sub">Frente Cinta A vs Cinta B</span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">E/S Lectura (Cintas F1/F2)</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-ice)' }}>
            {step.accesos_io_lectura} <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>bloques</span>
          </span>
          <span className="telemetry-sub">Acceso secuencial por páginas</span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">E/S Escritura (Salida F0)</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-emerald)' }}>
            {step.accesos_io_escritura} <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>bloques</span>
          </span>
          <span className="telemetry-sub">Volcado desde Buffer RAM</span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">Progreso de Fusión</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-violet)' }}>
            {step.cintaSalida.length} / {lenTotal} <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>({progresoSalidaPct}%)</span>
          </span>
          <span className="telemetry-sub">Total E/S: {totalIO} operaciones</span>
        </div>
      </section>

      {/* Escenario de Cintas y Cabezales */}
      <section className="canvas-stage">
        {/* Panel Cintas de Entrada (F1 y F2) */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <svg className="icon" viewBox="0 0 24 24">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="8" cy="12" r="2" />
                <circle cx="16" cy="12" r="2" />
              </svg>
              <span>CINTAS DE ENTRADA PREVIAMENTE ORDENADAS (F1 y F2)</span>
            </div>
            {isComparing && step.punteroA < step.cintaA.length && step.punteroB < step.cintaB.length ? (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11.5px',
                  color: 'var(--sig-amber)'
                }}
              >
                COMPARA: Cinta A[{step.punteroA}]={step.cintaA[step.punteroA]} vs Cinta B[{step.punteroB}]={step.cintaB[step.punteroB]}
              </span>
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--ink-muted)'
                }}
              >
                {step.estado === 'FINALIZADO' ? 'AMBAS CINTAS CONSUMIDAS (EOF)' : 'DOS PUNTEROS ACTIVOS'}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Cinta A */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--sig-amber)'
                }}
              >
                <span>CINTA A (F1) · Cabezal en [{step.punteroA < step.cintaA.length ? step.punteroA : 'EOF'}]</span>
                <span>{step.cintaA.length} registros</span>
              </div>
              <div className="tape-deck" style={{ justifyContent: 'flex-start', padding: '16px 14px' }}>
                {step.cintaA.map((val, idx) => {
                  const isConsumed = idx < step.punteroA;
                  const isHead = idx === step.punteroA;
                  const isSelected = step.elementoSeleccionado?.origen === 'A' && step.elementoSeleccionado?.valor === val && isHead;

                  return (
                    <div
                      key={`a-${idx}`}
                      className={`register-block ${isHead && isComparing ? 'is-comparing' : ''}`}
                      style={{
                        opacity: isConsumed ? 0.35 : 1,
                        borderColor: isSelected
                          ? 'var(--sig-emerald)'
                          : isHead
                          ? 'var(--sig-amber)'
                          : 'var(--border-subtle)',
                        background: isSelected
                          ? 'color-mix(in oklch, var(--sig-emerald) 18%, var(--bg-surface))'
                          : undefined
                      }}
                    >
                      <div className="reg-addr">
                        <span>A[{idx}]</span>
                        <span>{isHead ? '◄ pA' : isConsumed ? 'DONE' : ''}</span>
                      </div>
                      <div className="reg-val">{val}</div>
                      <div
                        className="reg-run-bar"
                        style={{
                          background: isHead ? 'var(--sig-amber)' : isConsumed ? 'var(--ink-muted)' : 'transparent'
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cinta B */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--sig-ice)'
                }}
              >
                <span>CINTA B (F2) · Cabezal en [{step.punteroB < step.cintaB.length ? step.punteroB : 'EOF'}]</span>
                <span>{step.cintaB.length} registros</span>
              </div>
              <div className="tape-deck" style={{ justifyContent: 'flex-start', padding: '16px 14px' }}>
                {step.cintaB.map((val, idx) => {
                  const isConsumed = idx < step.punteroB;
                  const isHead = idx === step.punteroB;
                  const isSelected = step.elementoSeleccionado?.origen === 'B' && step.elementoSeleccionado?.valor === val && isHead;

                  return (
                    <div
                      key={`b-${idx}`}
                      className={`register-block ${isHead && isComparing ? 'is-comparing' : ''}`}
                      style={{
                        opacity: isConsumed ? 0.35 : 1,
                        borderColor: isSelected
                          ? 'var(--sig-emerald)'
                          : isHead
                          ? 'var(--sig-ice)'
                          : 'var(--border-subtle)',
                        background: isSelected
                          ? 'color-mix(in oklch, var(--sig-emerald) 18%, var(--bg-surface))'
                          : undefined
                      }}
                    >
                      <div className="reg-addr">
                        <span>B[{idx}]</span>
                        <span>{isHead ? '◄ pB' : isConsumed ? 'DONE' : ''}</span>
                      </div>
                      <div className="reg-val">{val}</div>
                      <div
                        className="reg-run-bar"
                        style={{
                          background: isHead ? 'var(--sig-ice)' : isConsumed ? 'var(--ink-muted)' : 'transparent'
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Panel Cinta de Salida (F0) */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </svg>
              <span>CINTA DE SALIDA FUSIONADA (F0 - ARCHIVO DESTINO ORDENADO)</span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: step.estado === 'FINALIZADO' ? 'var(--sig-emerald)' : 'var(--sig-amber)'
              }}
            >
              {step.estado === 'FINALIZADO' ? 'SECUENCIA TOTALMENTE ORDENADA' : `ESCRIBIENDO SLOT [${step.cintaSalida.length}]`}
            </span>
          </div>

          <div
            className="tape-deck"
            style={{
              justifyContent: 'flex-start',
              minHeight: '100px',
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
                [ CINTA DE SALIDA VACÍA ]
                <br />
                Avanza con SPACE para comparar los cabezales y emitir el menor elemento.
              </div>
            ) : (
              step.cintaSalida.map((val, idx) => {
                const isLatest = idx === step.cintaSalida.length - 1;
                return (
                  <div
                    key={`out-${idx}`}
                    className="register-block"
                    style={{
                      borderColor: isLatest ? 'var(--sig-emerald)' : 'var(--border-subtle)',
                      background: isLatest
                        ? 'color-mix(in oklch, var(--sig-emerald) 14%, var(--bg-surface))'
                        : undefined
                    }}
                  >
                    <div className="reg-addr">
                      <span>#{idx}</span>
                      <span style={{ color: 'var(--sig-emerald)' }}>F0</span>
                    </div>
                    <div className="reg-val">{val}</div>
                    <div className="reg-run-bar" style={{ background: 'var(--sig-emerald)' }} />
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
