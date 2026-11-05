import React from 'react';
import { RegistroEmpleado, StepIndiceDenso } from '../types/algorithms';

interface IndiceDensoViewProps {
  registros: RegistroEmpleado[];
  claveBuscada: string;
  step: StepIndiceDenso;
}

export const IndiceDensoView: React.FC<IndiceDensoViewProps> = ({
  registros,
  claveBuscada: _claveBuscada,
  step
}) => {
  const hit = step.estado === 'ENCONTRADO';

  return (
    <>
      <section className="telemetry-strip">
        <div className="telemetry-cell">
          <span className="telemetry-label">Transferencias E/S</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-amber)' }}>
            {step.accesos_io}
          </span>
          <span className="telemetry-sub">Acceso directo vía Offset</span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">Comparaciones ALU</span>
          <span className="telemetry-val">
            {step.comparaciones_cpu}{' '}
            <span style={{ color: 'var(--ink-muted)', fontSize: '14px' }}>
              / {registros.length}
            </span>
          </span>
          <span className="telemetry-sub">Búsqueda Binaria O(log N)</span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">Rango Binario</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-ice)' }}>
            {step.bajo >= 0 ? `[${step.bajo}..${step.alto}]` : 'N/A'}
          </span>
          <span className="telemetry-sub">Punteros Bajo y Alto</span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-label">Pivote Medio</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-emerald)' }}>
            {step.medio >= 0 ? `[${step.medio}]` : 'N/A'}
          </span>
          <span className="telemetry-sub">Slot inspeccionado</span>
        </div>
      </section>

      <section className="canvas-stage">
        <div className="schematic-grid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
          {/* Tabla de Índice Denso en RAM */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <svg className="icon" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                <span>TABLA DE ÍNDICE DENSO (MEMORIA RAM)</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--sig-emerald)' }}>
                ORDENADO (CLAVE | OFFSET)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {step.tabla_indice.map((item, idx) => {
                const isMedio = idx === step.medio;
                const inRange = idx >= step.bajo && idx <= step.alto;

                let border = 'var(--border-hairline)';
                let bg = 'oklch(0.115 0.005 265)';
                let tagColor = 'var(--ink-muted)';

                if (isMedio) {
                  border = hit ? 'var(--sig-emerald)' : 'var(--sig-amber)';
                  bg = hit
                    ? 'color-mix(in oklch, var(--sig-emerald) 18%, var(--bg-surface))'
                    : 'color-mix(in oklch, var(--sig-amber) 18%, var(--bg-surface))';
                  tagColor = hit ? 'var(--sig-emerald)' : 'var(--sig-amber)';
                } else if (inRange) {
                  bg = 'var(--bg-elevated)';
                }

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      background: bg,
                      border: `1px solid ${border}`,
                      opacity: inRange || step.bajo === -1 ? 1 : 0.35
                    }}
                  >
                    <span>
                      Index[{idx}] → Key: <strong>"{item.clave}"</strong>
                    </span>
                    <span style={{ color: tagColor, fontWeight: isMedio ? 700 : 400 }}>
                      {isMedio ? (hit ? '◄ HIT' : '◄ PIVOTE MEDIO') : `Offset [${item.offset}]`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Registro Recuperado del Disco Secundario */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <svg className="icon" viewBox="0 0 24 24">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                  <path d="M3 12A9 3 0 0 0 21 12" />
                </svg>
                <span>ACCESO A DISCO SECUNDARIO</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                empleados.dat
              </span>
            </div>

            {step.registro_encontrado ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'color-mix(in oklch, var(--sig-emerald) 12%, var(--bg-surface))',
                  border: '1px solid var(--sig-emerald)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--sig-emerald)' }}>
                  REGISTRO LEÍDO POR OFFSET FÍSICO [{step.registro_encontrado.offset}]
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>
                  ID: {step.registro_encontrado.id} · Nombre: "{step.registro_encontrado.clave}"
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink-secondary)' }}>
                  Departamento: {step.registro_encontrado.depto} | Tamaña: {step.registro_encontrado.tam_bytes} Bytes
                </div>
              </div>
            ) : (
              <div
                style={{
                  margin: 'auto',
                  textAlign: 'center',
                  color: 'var(--ink-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  padding: '40px 10px'
                }}
              >
                [ ESPERANDO RESOLUCIÓN DE ÍNDICE ]
                <br />
                0 E/S realizadas en disco duro hasta hallar el Offset.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};