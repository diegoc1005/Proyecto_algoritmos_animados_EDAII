import React from 'react';
import { StepSeek } from '../types/algorithms';

interface SeekViewProps {
  texto: string;
  totalBytes: number;
  step: StepSeek;
  onDirectSeek: (offset: number) => void;
}

export const SeekView: React.FC<SeekViewProps> = ({
  texto,
  totalBytes,
  step,
  onDirectSeek
}) => {
  const lines = texto.split('\n');
  const [rStart, rEnd] = step.rango_actual;
  let globalOffset = 0;

  return (
    <>
      <section className="telemetry-strip">
        <div className="telemetry-cell">
          <span className="telemetry-label">Offset Actual tell()</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-amber)' }}>
            {step.cursor} B{' '}
            <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>
              (0x{step.cursor.toString(16).toUpperCase().padStart(2, '0')})
            </span>
          </span>
          <span className="telemetry-sub">Índice en el flujo de bytes</span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">Bytes Leídos</span>
          <span
            className="telemetry-val"
            style={{ color: 'var(--sig-emerald)' }}
          >
            {step.leidos_acumulados.length}{' '}
            <span style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>
              / {totalBytes} B
            </span>
          </span>
          <span className="telemetry-sub">
            Transferidos al espacio de usuario
          </span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">Costo de Llamada</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-ice)' }}>
            {step.complejidad}
          </span>
          <span className="telemetry-sub">Syscall: {step.tipo}</span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">Valor de Retorno</span>
          <span
            className="telemetry-val"
            style={{
              fontSize: '15px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {step.retorno}
          </span>
          <span className="telemetry-sub">{step.codigo}</span>
        </div>
      </section>

      <section className="canvas-stage">
        <div className="seek-workbench">
          {/* Flujo Físico de Bytes */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>
                  FLUJO FÍSICO DE BYTES (CLIC EN CUALQUIER CELDA PARA EJECUTAR
                  SEEK DIRECTO)
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--sig-amber)'
                }}
              >
                f_pos = {step.cursor}
              </span>
            </div>

            <div className="byte-stream-grid">
              {lines.map((ln, idx) => {
                const fullLn = idx < lines.length - 1 ? ln + '\n' : ln;
                const rowStartOffset = globalOffset;
                const cells = Array.from(fullLn).map((ch) => {
                  const currentByteOffset = globalOffset;
                  globalOffset += 1;

                  const inActiveRead =
                    currentByteOffset >= rStart && currentByteOffset < rEnd;
                  const inHistory =
                    step.leidos_acumulados.includes(currentByteOffset);
                  const isPtr = currentByteOffset === step.cursor;

                  let cls = 'byte-box';
                  if (inActiveRead) cls += ' byte-current-read';
                  else if (inHistory) cls += ' byte-history';
                  if (isPtr) cls += ' byte-pointer';

                  const glyph = ch === '\n' ? '↵' : ch === ' ' ? '·' : ch;

                  return (
                    <div
                      key={currentByteOffset}
                      className={cls}
                      data-offset={currentByteOffset}
                      title={`Byte ${currentByteOffset} — Clic para ejecutar seek(${currentByteOffset})`}
                      onClick={() => onDirectSeek(currentByteOffset)}
                    >
                      {glyph}
                    </div>
                  );
                });

                return (
                  <div key={idx} className="stream-row">
                    <span className="addr-hex">
                      0x{rowStartOffset.toString(16).toUpperCase().padStart(2, '0')}
                    </span>
                    {cells}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Descriptor de Archivo + Syscall Log */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <svg className="icon" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                  <span>DESCRIPTOR DE ARCHIVO DEL KERNEL (struct file)</span>
                </div>
              </div>
              <div className="fd-table">
                <div className="fd-field">
                  <span style={{ color: 'var(--ink-muted)' }}>fd</span>
                  <span>3 (STDIN/OUT=0,1,2)</span>
                </div>
                <div className="fd-field">
                  <span style={{ color: 'var(--ink-muted)' }}>f_mode</span>
                  <span>O_RDONLY ('rb')</span>
                </div>
                <div className="fd-field">
                  <span style={{ color: 'var(--ink-muted)' }}>
                    f_pos (tell)
                  </span>
                  <span style={{ color: 'var(--sig-amber)', fontWeight: 700 }}>
                    {step.cursor} bytes
                  </span>
                </div>
                <div className="fd-field">
                  <span style={{ color: 'var(--ink-muted)' }}>
                    i_size (EOF)
                  </span>
                  <span>{totalBytes} bytes</span>
                </div>
              </div>
            </div>

            <div className="panel" style={{ flex: 1 }}>
              <div className="panel-header">
                <div className="panel-title">
                  <svg className="icon" viewBox="0 0 24 24">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                  <span>TRAZA DE LLAMADAS AL SISTEMA (SYSCALL LOG)</span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--ink-muted)'
                  }}
                >
                  {step.log.length} eventos
                </span>
              </div>

              <div className="repl-log">
                {step.log.length === 0 ? (
                  <div style={{ color: 'var(--ink-muted)' }}>
                    // Descriptor abierto en f_pos = 0. Presiona SPACE para
                    ejecutar la traza.
                  </div>
                ) : (
                  step.log.map((entry, idx) => {
                    const isLast = idx === step.log.length - 1;
                    return (
                      <div
                        key={idx}
                        className={`repl-line ${isLast ? 'is-latest' : ''}`}
                      >
                        <span>
                          <span style={{ color: 'var(--ink-muted)' }}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>{' '}
                          &nbsp; {entry.cmd}
                        </span>
                        <span style={{ color: 'var(--sig-emerald)' }}>
                          ⇒ {entry.res}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
