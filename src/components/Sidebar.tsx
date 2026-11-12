import React from 'react';
import { ModuleId } from '../types/algorithms';

interface SidebarProps {
  currentModule: ModuleId;
  onSelectModule: (mod: ModuleId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule
}) => {
  return (
    <aside className="sidebar">
      <div className="brand-header">
        <div className="brand-title">
          <img
            src="/logo_fac_inge.png"
            alt="Facultad de Ingeniería UNAM"
            className="brand-logo"
          />
          <span>EDA II</span>
        </div>
        <span className="brand-meta">UNAM · FI</span>
      </div>

      {/* 1. Diego Córdova */}
      <div className="nav-section">
        <div className="nav-section-header">
          <span>Diego Córdova</span>
          <span>Ordenamiento</span>
        </div>
        <button
          className={`nav-item ${currentModule === 'mezcla' ? 'active' : ''}`}
          onClick={() => onSelectModule('mezcla')}
          title="Mezcla Natural (Natural Merge Sort)"
        >
          <div className="nav-item-left">
            <span className="nav-index">01</span>
            <span>Mezcla Natural</span>
          </div>
          <span className="badge-sem">S1</span>
        </button>
        <button
          className={`nav-item ${currentModule === 'merge2vias' ? 'active' : ''}`}
          onClick={() => onSelectModule('merge2vias')}
          title="Merge Sort Externo (Fase 2 - Mezcla de 2 vías)"
        >
          <div className="nav-item-left">
            <span className="nav-index">02</span>
            <span>Merge Sort Externo</span>
          </div>
          <span className="badge-sem">S2</span>
        </button>
        <button
          className={`nav-item ${currentModule === 'cubetas' ? 'active' : ''}`}
          onClick={() => onSelectModule('cubetas')}
          title="Ordenamiento por Distribución (Cubetas / Bucket Sort)"
        >
          <div className="nav-item-left">
            <span className="nav-index">03</span>
            <span>Ord. por Distribución</span>
          </div>
          <span className="badge-sem">S3</span>
        </button>
      </div>

      {/* 2. Dylan García */}
      <div className="nav-section">
        <div className="nav-section-header">
          <span>Dylan García</span>
          <span>Indexación</span>
        </div>
        <button
          className={`nav-item ${currentModule === 'escaneo' ? 'active' : ''}`}
          onClick={() => onSelectModule('escaneo')}
        >
          <div className="nav-item-left">
            <span className="nav-index">04</span>
            <span>Escaneo Secuencial</span>
          </div>
          <span className="badge-sem">S1</span>
        </button>
        <button
          className={`nav-item ${currentModule === 'indice' ? 'active' : ''}`}
          onClick={() => onSelectModule('indice')}
        >
          <div className="nav-item-left">
            <span className="nav-index">05</span>
            <span>Índice Denso</span>
          </div>
          <span className="badge-sem">S2</span>
        </button>
        <button
          className={`nav-item ${currentModule === 'csv' ? 'active' : ''}`}
          onClick={() => onSelectModule('csv')}
        >
          <div className="nav-item-left">
            <span className="nav-index">06</span>
            <span>Parser Streaming CSV</span>
          </div>
          <span className="badge-sem">S3</span>
        </button>
      </div>

      {/* 3. Mauro Robles */}
      <div className="nav-section">
        <div className="nav-section-header">
          <span>Mauro Robles</span>
          <span>Sist. Archivos</span>
        </div>
        <button
          className={`nav-item ${currentModule === 'seek' ? 'active' : ''}`}
          onClick={() => onSelectModule('seek')}
        >
          <div className="nav-item-left">
            <span className="nav-index">07</span>
            <span>Puntero seek &amp; tell</span>
          </div>
          <span className="badge-sem">S1</span>
        </button>
        <button
          className={`nav-item ${currentModule === 'asignacion' ? 'active' : ''}`}
          onClick={() => onSelectModule('asignacion')}
        >
          <div className="nav-item-left">
            <span className="nav-index">08</span>
            <span>Asignación en Disco</span>
          </div>
          <span className="badge-sem">S2</span>
        </button>
        <button
          className={`nav-item ${currentModule === 'raid' ? 'active' : ''}`}
          onClick={() => onSelectModule('raid')}
        >
          <div className="nav-item-left">
            <span className="nav-index">09</span>
            <span>RAID 0 vs RAID 1</span>
          </div>
          <span className="badge-sem">S3</span>
        </button>
      </div>

      <div className="shortcuts-card">
        <div className="shortcut-row">
          <span>Avanzar paso</span>
          <kbd>SPACE</kbd>
        </div>
        <div className="shortcut-row">
          <span>Retroceder / Avanzar</span>
          <span>
            <kbd>←</kbd> <kbd>→</kbd>
          </span>
        </div>
        <div className="shortcut-row">
          <span>Ejecución continua</span>
          <kbd>A</kbd>
        </div>
        <div className="shortcut-row">
          <span>Reiniciar estado</span>
          <kbd>R</kbd>
        </div>
      </div>
    </aside>
  );
};
