import React from 'react';
import { StepAsignacion } from '../types/algorithms';

interface AsignacionDiscoViewProps {
  step: StepAsignacion;
}

export const AsignacionDiscoView: React.FC<AsignacionDiscoViewProps> = ({ step }) => {
  const bloques = step.bloques;
  const archivos = step.archivos;
  const libres = step.bloquesLibresTotales;
  const frag = step.fragmentacionExterna.toFixed(1);

  return (
    <>
      {/* Telemetría de Hardware del Sistema de Archivos */}
      <section className="telemetry-strip">
        <div className="telemetry-cell">
          <span className="telemetry-label">Estrategia Activa</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-amber)', textTransform: 'uppercase' }}>
            {step.estrategia}
          </span>
          <span className="telemetry-sub">
            {step.estrategia === 'contigua'
              ? 'Acceso O(1) · Frag. Externa Alta'
              : step.estrategia === 'enlazada'
              ? 'Punteros en bloque · Acceso O(k)'
              : 'Tabla Inodo en disco · Acceso O(1)'}
          </span>
        </div>

        <div className="telemetry-cell">
          <span className="telemetry-label">Fragmentación Externa</span>
          <span
            className="telemetry-val"
            style={{ color: step.fragmentacionExterna > 0 ? 'var(--sig-coral)' : 'var(--sig-emerald)' }}
          >
            {frag}%
          </span>
          <span className="telemetry-sub">
            {step.fragmentacionExterna > 0 ? 'Espacio libre inutilizable' : 'Aprovechamiento 100% libre'}
          </span>
        </div>

        <div className="telemetry-cell">
          <span className="telemetry-label">Saltos de Cabezal E/S</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-ice)' }}>
            {step.saltosCabezal} <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>seeks</span>
          </span>
          <span className="telemetry-sub">Operaciones físicas en disco</span>
        </div>

        <div className="telemetry-cell">
          <span className="telemetry-label">Bloques Libres</span>
          <span className="telemetry-val" style={{ color: 'var(--sig-violet)' }}>
            {libres} / {bloques.length} <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>({Math.round((libres / bloques.length) * 100)}%)</span>
          </span>
          <span className="telemetry-sub">Bitmap de asignación libre</span>
        </div>
      </section>

      {/* Escenario del Disco Físico y Directorio de Archivos */}
      <section className="canvas-stage">
        {/* Panel del Disco Físico (32 Bloques de 4KB) */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <svg className="icon" viewBox="0 0 24 24">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                <path d="M3 12A9 3 0 0 0 21 12" />
              </svg>
              <span>SUPERFICIE DE DISCO FÍSICO (32 BLOQUES DE 4 KB · LBA 0x00 .. 0x1F)</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--sig-amber)' }}>
              {step.estado}
            </span>
          </div>

          {/* Cuadrícula de bloques en disco */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: '10px',
              padding: '16px 12px',
              background: 'oklch(0.115 0.005 265)',
              borderRadius: '8px',
              border: '1px solid var(--border-hairline)'
            }}
          >
            {bloques.map((b) => {
              const isActive = step.bloqueActivo === b.id;
              const isVisited = step.bloquesRecorridos.includes(b.id);
              const isFree = b.tipo === 'libre';
              const isInode = b.tipo === 'inodo';

              return (
                <div
                  key={b.id}
                  style={{
                    height: '74px',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    background: isFree
                      ? 'oklch(0.14 0.005 265)'
                      : `color-mix(in oklch, ${b.color} 18%, var(--bg-surface))`,
                    border: isActive
                      ? '2px solid var(--sig-amber)'
                      : isVisited
                      ? '1px solid var(--sig-emerald)'
                      : isFree
                      ? '1px dashed var(--border-subtle)'
                      : `1px solid color-mix(in oklch, ${b.color} 60%, transparent)`,
                    boxShadow: isActive
                      ? '0 0 16px color-mix(in oklch, var(--sig-amber) 30%, transparent)'
                      : undefined,
                    transition: 'all 160ms ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-muted)' }}>
                    <span>#{String(b.id).padStart(2, '0')}</span>
                    {isInode && (
                      <span
                        style={{
                          fontSize: '9px',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          background: 'var(--sig-amber)',
                          color: 'var(--bg-canvas)',
                          fontWeight: 700
                        }}
                      >
                        INODE
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '12px',
                      color: isFree ? 'var(--ink-muted)' : 'var(--ink-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {isFree ? 'LIBRE' : b.archivoId}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--ink-secondary)' }}>
                    {step.estrategia === 'enlazada' && b.siguiente !== null ? (
                      <span style={{ color: 'var(--sig-ice)' }}>ptr → #{b.siguiente}</span>
                    ) : step.estrategia === 'enlazada' && !isFree ? (
                      <span style={{ color: 'var(--sig-coral)' }}>[EOF]</span>
                    ) : isInode && b.inodoBloques ? (
                      <span style={{ color: 'var(--sig-amber)' }}>{b.inodoBloques.length} ptrs</span>
                    ) : (
                      <span>4 KB</span>
                    )}
                    {isActive && <span style={{ color: 'var(--sig-amber)' }}>◄ CABEZAL</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Directorio y Estructura Interna */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
          {/* Tabla de Directorio del Sistema de Archivos */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                </svg>
                <span>DIRECTORIO RAÍZ DEL SISTEMA (/root)</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                {archivos.length} archivos montados
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {archivos.map((arc) => (
                <div
                  key={arc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: 'oklch(0.12 0.005 265)',
                    border: '1px solid var(--border-hairline)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        background: arc.color,
                        display: 'inline-block'
                      }}
                    />
                    <span style={{ fontWeight: 600 }}>{arc.nombre}</span>
                    <span style={{ color: 'var(--ink-muted)', fontSize: '11px' }}>
                      ({arc.tamBloques * 4} KB)
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', color: 'var(--ink-secondary)', fontSize: '11px' }}>
                    {step.estrategia === 'contigua' && (
                      <span>Inicio: #{arc.bloqueInicio} · Long: {arc.tamBloques} blqs</span>
                    )}
                    {step.estrategia === 'enlazada' && (
                      <span>Inicio: #{arc.bloqueInicio} · Cadena: [{arc.bloquesOcupados.join(' → ')}]</span>
                    )}
                    {step.estrategia === 'indexada' && (
                      <span>Inodo: #{arc.bloqueInodo} · Datos: [{arc.bloquesOcupados.slice(1).join(', ')}]</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparativa Conceptual para Examen */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>TRADE-OFF ARQUITECTÓNICO</span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                color: 'var(--ink-secondary)'
              }}
            >
              <div style={{ padding: '8px 10px', borderRadius: '5px', background: 'oklch(0.12 0.005 265)' }}>
                <strong style={{ color: 'var(--sig-amber)' }}>Contigua:</strong> Acceso aleatorio O(1). Pero si un archivo crece y no hay hueco al lado, hay que mover todo.
              </div>
              <div style={{ padding: '8px 10px', borderRadius: '5px', background: 'oklch(0.12 0.005 265)' }}>
                <strong style={{ color: 'var(--sig-ice)' }}>Enlazada:</strong> Cero fragmentación externa. Pero para llegar al bloque 10 tienes que leer los 9 anteriores en disco.
              </div>
              <div style={{ padding: '8px 10px', borderRadius: '5px', background: 'oklch(0.12 0.005 265)' }}>
                <strong style={{ color: 'var(--sig-emerald)' }}>Indexada (Inodo):</strong> Acceso aleatorio O(1) vía tabla de punteros y cero fragmentación externa. Estándar de Linux (ext4).
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

