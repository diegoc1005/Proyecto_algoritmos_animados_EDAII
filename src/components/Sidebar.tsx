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
          <span className="brand-mark" />
          <span>EDA II · I/O LAB</span>
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
        >
          <div className="nav-item-left">
            <span className="nav-index">01</span>
            <span>Mezcla Natural</span>
          </div>
          <span className="badge-sem">S1</span>
        </button>
        <button className="nav-item locked" title="Entrega Semana 2">
          <div className="nav-item-left">
            <span className="nav-index">02</span>
            <span>Merge Sort 2-Vías</span>
          </div>
          <span className="badge-sem">S2</span>
        </button>
        <button className="nav-item locked" title="Entrega Semana 3">
          <div className="nav-item-left">
            <span className="nav-index">03</span>
            <span>Ordenamiento Cubetas</span>
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
        <button className="nav-item locked" title="Entrega Semana 2">
          <div className="nav-item-left">
            <span className="nav-index">05</span>
            <span>Índice Denso</span>
          </div>
          <span className="badge-sem">S2</span>
        </button>
        <button className="nav-item locked" title="Entrega Semana 3">
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
        <button className="nav-item locked" title="Entrega Semana 2">
          <div className="nav-item-left">
            <span className="nav-index">08</span>
            <span>Asignación en Disco</span>
          </div>
          <span className="badge-sem">S2</span>
        </button>
        <button className="nav-item locked" title="Entrega Semana 3">
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
