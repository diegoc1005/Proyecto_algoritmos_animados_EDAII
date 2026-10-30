import React from 'react';
import { RegistroEmpleado, StepEscaneo } from '../types/algorithms';

interface EscaneoViewProps {
  registros: RegistroEmpleado[];
  claveBuscada: string;
  factorB: number;
  step: StepEscaneo;
}

export const EscaneoView: React.FC<EscaneoViewProps> = ({
  registros,
  claveBuscada,
  factorB,
  step
}) => {
  const realRatio = step.ahorro_real_x.toFixed(2);
  const numPages = Math.ceil(registros.length / factorB);
  const isDMA = step.estado === 'TRANSFERENCIA_IO';
  const hit = step.estado === 'ENCONTRADO';

  return (
    <>
      <section className="telemetry-strip">
        <div className="telemetry-cell">
          <span className="telemetry-label">Transferencias E/S (Bloques)</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-amber)' }}>
            {step.accesos_io}
          </span>
          <span className="telemetry-sub">Factor B = {factorB} regs/página</span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">Inspecciones en RAM</span>
          <span className="telemetry-val">
            {step.comparaciones_cpu}{' '}
            <span style={{ color: 'var(--ink-muted)', fontSize: '14px' }}>
              / {registros.length}
            </span>
          </span>
          <span className="telemetry-sub">
            Sin bloqueo serían {step.comparaciones_cpu} E/S
          </span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">Latencia de Disco</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-ice)' }}>
            {step.tiempo_ms} ms
          </span>
          <span className="telemetry-sub">8.2 ms por bloque leído</span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">Ratio Real Ahorro E/S</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-emerald)' }}>
            {realRatio}x
          </span>
          <span className="telemetry-sub">
            Cota máx asintótica: {factorB}.00x
          </span>
        </div>
      </section>

      <section className="canvas-stage">
        <div className="schematic-grid">
          {/* Disco Secundario */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <svg className="icon" viewBox="0 0 24 24">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                  <path d="M3 12A9 3 0 0 0 21 12" />
                </svg>
                <span>DISCO SECUNDARIO (PÁGINAS DE {factorB} REGISTROS)</span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--ink-muted)'
                }}
              >
                empleados.dat
              </span>
            </div>

            <div className="blocks-matrix">
              {Array.from({ length: numPages }).map((_, p) => {
                const start = p * factorB;
                const end = Math.min(start + factorB, registros.length);
                const isPageActive = step.bloque_actual === p;
                const pageRegs = registros.slice(start, end);

                return (
                  <div
                    key={p}
                    className={`disk-page ${isPageActive ? 'page-active' : ''}`}
                  >
                    <div className="disk-page-hdr">
                      <span>PÁGINA FÍSICA #{p}</span>
                      <span>{(end - start) * 64} B</span>
                    </div>

                    {pageRegs.map((r) => {
                      const i = r.offset;
                      let cls = '';
                      let tag = `0x${(i * 64).toString(16).padStart(4, '0')}`;
                      if (step.puntero >= 0) {
                        if (i < step.puntero) {
                          cls = 'slot-past';
                          tag = 'DESCARTADO';
                        } else if (i === step.puntero) {
                          cls =
                            step.estado === 'ENCONTRADO'
                              ? 'slot-hit'
                              : 'slot-head';
                          tag =
                            step.estado === 'ENCONTRADO' ? 'HIT' : 'CABEZAL';
                        }
                      }
                      return (
                        <div key={i} className={`rec-slot ${cls}`}>
                          <span>
                            [{i}] ID:{r.id} · <strong>"{r.clave}"</strong>
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              color: 'var(--ink-muted)'
                            }}
                          >
                            {tag}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Puente DMA */}
          <div className="dma-bridge">
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--ink-muted)'
              }}
            >
              CANAL E/S
            </span>
            <svg width="96" height="44" viewBox="0 0 96 44">
              <line
                x1="4"
                y1="22"
                x2="92"
                y2="22"
                stroke="oklch(1 0 0 / 0.16)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <polygon
                points="86,17 95,22 86,27"
                fill={isDMA ? 'var(--sig-amber)' : 'oklch(1 0 0 / 0.2)'}
              />
              {isDMA && (
                <circle cx="48" cy="22" r="6" fill="var(--sig-amber)">
                  <animate
                    attributeName="cx"
                    from="10"
                    to="84"
                    dur="0.55s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </svg>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: isDMA ? 'var(--sig-amber)' : 'var(--ink-muted)'
              }}
            >
              {isDMA ? 'DMA READ' : 'IDLE (0 E/S)'}
            </span>
          </div>

          {/* Memoria Principal (Buffer Pool) */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <svg className="icon" viewBox="0 0 24 24">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                  <path d="M9 1v3" />
                  <path d="M15 1v3" />
                  <path d="M9 20v3" />
                  <path d="M15 20v3" />
                  <path d="M20 9h3" />
                  <path d="M20 14h3" />
                  <path d="M1 9h3" />
                  <path d="M1 14h3" />
                </svg>
                <span>MEMORIA PRINCIPAL (BUFFER POOL)</span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--sig-emerald)'
                }}
              >
                RAM ~60 ns
              </span>
            </div>

            {step.registro_ram ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10.5px',
                      color: 'var(--ink-muted)'
                    }}
                  >
                    MARCO DE PÁGINA EN RAM (CONTIENE BLOQUE #{step.bloque_actual})
                  </div>

                  {step.rango_bloque.map((idx) => {
                    const item = registros[idx];
                    const isInspected = idx === step.puntero;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          borderRadius: '5px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          background: isInspected
                            ? 'var(--bg-elevated)'
                            : 'oklch(0.115 0.005 265)',
                          border: `1px solid ${
                            isInspected
                              ? 'var(--sig-amber)'
                              : 'var(--border-hairline)'
                          }`
                        }}
                      >
                        <span>
                          Slot[{idx % factorB}] → ID:{item.id} "{item.clave}" (
                          {item.depto})
                        </span>
                        <span
                          style={{
                            color: isInspected
                              ? 'var(--sig-amber)'
                              : 'var(--ink-muted)'
                          }}
                        >
                          {isInspected ? '◄ ALU' : 'EN CACHÉ'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: 'auto',
                    padding: '12px',
                    borderRadius: '7px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    background: 'oklch(0.115 0.005 265)',
                    border: `1px solid ${
                      hit ? 'var(--sig-emerald)' : 'var(--border-subtle)'
                    }`
                  }}
                >
                  <div style={{ color: 'var(--ink-secondary)' }}>
                    COMPARADOR DE CLAVE:
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      marginTop: '4px',
                      color: hit ? 'var(--sig-emerald)' : 'var(--sig-amber)'
                    }}
                  >
                    "{step.registro_ram.clave}" {hit ? '==' : '!='} "
                    {claveBuscada}" &nbsp;→&nbsp;{' '}
                    {hit ? 'REGISTRO LOCALIZADO' : 'CONTINUAR ESCANEO'}
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  margin: 'auto',
                  textAlign: 'center',
                  color: 'var(--ink-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  padding: '30px 10px'
                }}
              >
                [ BUFFER POOL VACÍO ]
                <br />
                Presiona SPACE para emitir syscall de lectura del Bloque #0.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};
