import React from 'react';
import { generarPasosParseoCSV } from '../algorithms/parseoCSV';

interface Props {
  stepIdx: number;
  totalSteps: number;
  csvInputText?: string;
}

export const ParseoCSVView: React.FC<Props> = ({ stepIdx, totalSteps, csvInputText }) => {
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
    <div className="module-container" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Panel Superior / Métricas Integradas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>CARÁCTER ESCANEADO</span>
          <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: 'var(--sig-amber)', fontWeight: 'bold' }}>
            {pasoActual.charActual === '\n' ? '↵ (SALTO)' : pasoActual.charActual === ' ' ? '␣' : pasoActual.charActual}
          </span>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>ESTADO DE MÁQUINA</span>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--sig-ice)', fontWeight: 'bold' }}>
            {pasoActual.estadoMaquina}
          </span>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>CAMPO EN CONSTRUCCIÓN</span>
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--success)', fontWeight: 'bold' }}>
            "{pasoActual.campoActual}"
          </span>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>FILAS PARSEADAS</span>
          <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: 'var(--ink)', fontWeight: 'bold' }}>
            {pasoActual.filasResultantes.length}
          </span>
        </div>
      </div>

      {/* Grid Central: Búfer de Caracteres y Matriz RAM en Filas Correctas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
        
        {/* Vista de Búfer Estilo Bloques Hexadecimales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
          <h3 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--sig-amber)', margin: '0 0 6px 0' }}>🗂️ Flujo de Entrada: Búfer de Caracteres (FSM)</h3>
          <div 
            style={{ 
              background: 'rgba(0, 0, 0, 0.25)', 
              padding: '10px', 
              borderRadius: '6px', 
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            {lineas.map((linea, lIdx) => {
              const offsetHex = '0x' + (lIdx * 40).toString(16).toUpperCase().padStart(2, '0');
              const charsDeLinea = linea.split('');
              
              return (
                <div key={lIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)', minWidth: '36px' }}>
                    {offsetHex}
                  </span>
                  <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                    {charsDeLinea.map((char, cIdxLoc) => {
                      const absoluteIdx = charGlobalCounter++;
                      const isCurrent = absoluteIdx === pasoActual.indiceChar;
                      
                      return (
                        <div
                          key={cIdxLoc}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            width: '22px',
                            height: '26px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '3px',
                            backgroundColor: isCurrent ? 'var(--sig-amber)' : 'rgba(255, 255, 255, 0.03)',
                            color: isCurrent ? '#000' : 'var(--ink)',
                            border: isCurrent ? '2px solid #fff' : '1px solid var(--border)',
                            fontWeight: isCurrent ? 'bold' : 'normal',
                            boxShadow: isCurrent ? '0 0 8px rgba(245, 158, 11, 0.6)' : 'none',
                          }}
                          title={`Índice: ${absoluteIdx}, Carácter: '${char}'`}
                        >
                          {char === ' ' ? '·' : char}
                        </div>
                      );
                    })}
                    {lIdx < lineas.length - 1 && (() => {
                      const nlIdx = charGlobalCounter++;
                      const isCurrentNl = nlIdx === pasoActual.indiceChar;
                      return (
                        <div
                          key="nl"
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            padding: '0 4px',
                            height: '26px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '3px',
                            backgroundColor: isCurrentNl ? 'var(--sig-amber)' : 'rgba(255, 255, 255, 0.03)',
                            color: isCurrentNl ? '#000' : 'var(--ink-muted)',
                            border: isCurrentNl ? '2px solid #fff' : '1px solid var(--border)',
                          }}
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

        {/* Vista de Tabla Resultante en RAM (Arreglada en Filas y Columnas Correctas) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
          <h3 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--sig-amber)', margin: '0 0 6px 0' }}>📊 Matriz Estructurada en RAM</h3>
          <div style={{ overflowX: 'auto', background: 'rgba(0, 0, 0, 0.25)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              <tbody>
                {pasoActual.filasResultantes.map((fila, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid var(--border)' }}>
                    {fila.map((val, cIdx) => (
                      <td key={cIdx} style={{ padding: '6px 8px', color: rIdx === 0 ? 'var(--sig-amber)' : 'inherit', fontWeight: rIdx === 0 ? 'bold' : 'normal' }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Barra de Estado Inferior con la Explicación del Paso */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <span style={{ background: 'var(--sig-amber)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          {pasoActual.estadoMaquina}
        </span>
        <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
          {pasoActual.descripcion}
        </span>
      </div>

    </div>
  );
};