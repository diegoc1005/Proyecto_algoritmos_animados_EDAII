import React from 'react';
import { generarPasosParseoCSV } from '../algorithms/parseoCSV';

interface Props {
  stepIdx: number;
  totalSteps: number;
  csvInputText?: string;
}

export const ParseoCSVView: React.FC<Props> = ({
  stepIdx,
  totalSteps: _totalSteps,
  csvInputText
}) => {
  const CSV_DEFAULT = `ID,Nombre,Departamento,Salario
101,"García Rayon, Dylan",Ingeniería,45000
102,"Córdova García, Diego",Sistemas,48000
103,"Robles de la Rosa, Mauro",Infraestructura,47000`;

  const inputUsado = csvInputText || CSV_DEFAULT;
  const resultado = generarPasosParseoCSV(inputUsado);
  const pasoSeguro = Math.min(stepIdx, resultado.pasos.length - 1);
  const pasoActual = resultado.pasos[pasoSeguro] || resultado.pasos[0];

  const lineas = inputUsado.split('\n');
  let charGlobalCounter = 0;

  return (
    <>
      {/* Barra de telemetría de hardware */}
      <section className="telemetry-strip">
        <div className="telemetry-cell">
          <span className="telemetry-label">Carácter Escaneado</span>
          <span
            className="telemetry-val"
            style={{ color: 'var(--sig-amber)' }}
          >
            {pasoActual.charActual === '\n'
              ? '↵ (LF)'
              : pasoActual.charActual === ' '
              ? '␣ (SPC)'
              : pasoActual.charActual || 'EOF'}
          </span>
          <span className="telemetry-sub">
            Offset de stream: #{pasoActual.indiceChar}
          </span>
        </div>

        <div className="telemetry-cell">
          <span className="telemetry-label">Estado del Autómata (FSM)</span>
          <span
            className="telemetry-val"
            style={{ fontSize: '14px', color: 'var(--sig-ice)' }}
          >
            {pasoActual.estadoMaquina}
          </span>
          <span className="telemetry-sub">
            Análisis léxico sin usar .split()
          </span>
        </div>

        <div className="telemetry-cell">
          <span className="telemetry-label">Buffer de Campo Actual</span>
          <span
            className="telemetry-val"
            style={{ fontSize: '15px', color: 'var(--sig-emerald)' }}
          >
            "{pasoActual.campoActual}"
          </span>
          <span className="telemetry-sub">
            {pasoActual.filaActual.length} columnas en fila activa
          </span>
        </div>

        <div className="telemetry-cell">
          <span className="telemetry-label">Filas Emitidas en RAM</span>
          <span
            className="telemetry-val"
            style={{ color: 'var(--sig-violet)' }}
          >
            {pasoActual.filasResultantes.length}
          </span>
          <span className="telemetry-sub">
            Tabla 2D estructurada en memoria
          </span>
        </div>
      </section>

      {/* Escenario Principal */}
      <section className="canvas-stage">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '16px'
          }}
        >
          {/* Panel 1: Flujo de Entrada de Caracteres */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>FLUJO DE ENTRADA: BÚFER DE CARACTERES (STREAMING)</span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--sig-amber)'
                }}
              >
                CURSOR EN BYTE [{pasoActual.indiceChar}]
              </span>
            </div>

            <div className="byte-stream-grid">
              {lineas.map((linea, lIdx) => {
                const offsetHex =
                  '0x' +
                  (lIdx * 40).toString(16).toUpperCase().padStart(2, '0');
                const charsDeLinea = linea.split('');

                return (
                  <div key={lIdx} className="stream-row">
                    <span className="addr-hex">{offsetHex}</span>
                    <div
                      style={{
                        display: 'flex',
                        gap: '3px',
                        flexWrap: 'wrap'
                      }}
                    >
                      {charsDeLinea.map((char, cIdxLoc) => {
                        const absoluteIdx = charGlobalCounter++;
                        const isCurrent =
                          absoluteIdx === pasoActual.indiceChar;
                        const isPast = absoluteIdx < pasoActual.indiceChar;

                        return (
                          <div
                            key={cIdxLoc}
                            className={`byte-box ${
                              isCurrent
                                ? 'byte-current-read byte-pointer'
                                : isPast
                                ? 'byte-history'
                                : ''
                            }`}
                            data-offset={
                              isCurrent ? `#${absoluteIdx}` : undefined
                            }
                            title={`Índice: ${absoluteIdx}, Carácter: '${char}'`}
                          >
                            {char === ' ' ? '·' : char}
                          </div>
                        );
                      })}
                      {lIdx < lineas.length - 1 &&
                        (() => {
                          const nlIdx = charGlobalCounter++;
                          const isCurrentNl = nlIdx === pasoActual.indiceChar;
                          const isPastNl = nlIdx < pasoActual.indiceChar;
                          return (
                            <div
                              key="nl"
                              className={`byte-box ${
                                isCurrentNl
                                  ? 'byte-current-read byte-pointer'
                                  : isPastNl
                                  ? 'byte-history'
                                  : ''
                              }`}
                              data-offset={
                                isCurrentNl ? `#${nlIdx}` : undefined
                              }
                              title="Salto de línea (\\n)"
                            >
                              ↵
                            </div>
                          );
                        })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel 2: Matriz Resultante en RAM */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <svg className="icon" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                <span>MATRIZ ESTRUCTURADA 2D EN MEMORIA RAM</span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--ink-muted)'
                }}
              >
                {pasoActual.filasResultantes.length} FILAS COMPLETADAS
              </span>
            </div>

            <div
              style={{
                overflowX: 'auto',
                background: 'var(--bg-canvas)',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid var(--border-hairline)',
                minHeight: '220px'
              }}
            >
              {pasoActual.filasResultantes.length === 0 &&
              pasoActual.filaActual.length === 0 ? (
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--ink-muted)',
                    textAlign: 'center',
                    padding: '40px 10px'
                  }}
                >
                  [ TABLA EN ESPERA DE REGISTROS PARSEADOS ]
                </div>
              ) : (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px'
                  }}
                >
                  <tbody>
                    {pasoActual.filasResultantes.map((fila, rIdx) => (
                      <tr
                        key={rIdx}
                        style={{
                          borderBottom: '1px solid var(--border-hairline)'
                        }}
                      >
                        {fila.map((val, cIdx) => (
                          <td
                            key={cIdx}
                            style={{
                              padding: '7px 9px',
                              color:
                                rIdx === 0
                                  ? 'var(--sig-amber)'
                                  : 'var(--ink-primary)',
                              fontWeight: rIdx === 0 ? 700 : 400
                            }}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {pasoActual.filaActual.length > 0 && (
                      <tr
                        style={{
                          background:
                            'color-mix(in oklch, var(--sig-emerald) 10%, transparent)',
                          borderBottom: '1px dashed var(--sig-emerald)'
                        }}
                      >
                        {pasoActual.filaActual.map((val, cIdx) => (
                          <td
                            key={`act-${cIdx}`}
                            style={{
                              padding: '7px 9px',
                              color: 'var(--sig-emerald)'
                            }}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
