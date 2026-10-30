import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CONTENIDO_EMPLEADOS_DEFAULT,
  generarPasosEscaneoSecuencial
} from './algorithms/escaneoSecuencial';
import { generarPasosMezclaNatural } from './algorithms/mezclaNatural';
import {
  OPERACIONES_SEEK_DEFAULT,
  TEXTO_ARCHIVO_SECUENCIAL_DEFAULT,
  generarPasosSeekTell
} from './algorithms/punteroSeekTell';
import { EscaneoView } from './components/EscaneoView';
import { MezclaView } from './components/MezclaView';
import { SeekView } from './components/SeekView';
import { Sidebar } from './components/Sidebar';
import {
  ModuleId,
  OperacionSeek,
  TipoSyscall,
  WhenceMode
} from './types/algorithms';

const CLAVES_DISPONIBLES = [
  'Ana',
  'Carlos',
  'Elena',
  'Beto',
  'Diana',
  'Franco',
  'Gaby',
  'Hugo',
  'Zoe'
];

export const App: React.FC = () => {
  const [currentModule, setCurrentModule] = useState<ModuleId>('mezcla');
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(600);

  // Archivos cargados desde /datos/
  const [archivoEmpleadosRaw, setArchivoEmpleadosRaw] = useState<string>(
    CONTENIDO_EMPLEADOS_DEFAULT
  );
  const [archivoSecuencialRaw, setArchivoSecuencialRaw] = useState<string>(
    TEXTO_ARCHIVO_SECUENCIAL_DEFAULT
  );

  // Parámetros Módulo 1: Mezcla Natural
  const [cfgMezcla, setCfgMezcla] = useState<number[]>([
    3, 7, 9, 2, 5, 8, 1, 4, 6
  ]);
  const [inputMezclaText, setInputMezclaText] = useState<string>(
    '3, 7, 9, 2, 5, 8, 1, 4, 6'
  );

  // Parámetros Módulo 2: Escaneo Secuencial
  const [cfgClave, setCfgClave] = useState<string>('Beto');
  const [cfgFactorB, setCfgFactorB] = useState<number>(2);

  // Parámetros Módulo 3: Seek, Read & Tell
  const [cfgSeekOps, setCfgSeekOps] = useState<OperacionSeek[]>(
    OPERACIONES_SEEK_DEFAULT
  );
  const [opArgInput, setOpArgInput] = useState<number>(10);
  const [whenceInput, setWhenceInput] = useState<WhenceMode>(0);

  // Cargar archivos físicos reales desde public/datos/ al iniciar
  useEffect(() => {
    fetch('/datos/empleados.dat')
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((txt) => {
        if (txt.trim().length > 0) setArchivoEmpleadosRaw(txt);
      })
      .catch(() => {});

    fetch('/datos/archivo_secuencial.txt')
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((txt) => {
        if (txt.length > 0) setArchivoSecuencialRaw(txt);
      })
      .catch(() => {});
  }, []);

  // Ejecución reactiva de los algoritmos en TypeScript puro
  const mezclaSteps = useMemo(
    () => generarPasosMezclaNatural(cfgMezcla),
    [cfgMezcla]
  );

  const escaneoResult = useMemo(
    () =>
      generarPasosEscaneoSecuencial(
        cfgClave,
        cfgFactorB,
        archivoEmpleadosRaw,
        8.2
      ),
    [cfgClave, cfgFactorB, archivoEmpleadosRaw]
  );

  const seekResult = useMemo(
    () => generarPasosSeekTell(cfgSeekOps, archivoSecuencialRaw),
    [cfgSeekOps, archivoSecuencialRaw]
  );

  const totalSteps =
    currentModule === 'mezcla'
      ? mezclaSteps.length
      : currentModule === 'escaneo'
        ? escaneoResult.pasos.length
        : seekResult.pasos.length;

  const safeStepIdx = Math.min(stepIdx, Math.max(0, totalSteps - 1));

  // Temporizador de reproducción automática
  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => {
        if (prev < totalSteps - 1) {
          return prev + 1;
        }
        setIsPlaying(false);
        return prev;
      });
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [isPlaying, speedMs, totalSteps]);

  const handleSelectModule = useCallback((mod: ModuleId) => {
    setIsPlaying(false);
    setCurrentModule(mod);
    setStepIdx(0);
  }, []);

  const nextStep = useCallback(() => {
    setStepIdx((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setIsPlaying(false);
    setStepIdx((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const resetSim = useCallback(() => {
    setIsPlaying(false);
    setStepIdx(0);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev && safeStepIdx >= totalSteps - 1) {
        setStepIdx(0);
      }
      return !prev;
    });
  }, [safeStepIdx, totalSteps]);

  // Atajos de teclado globales
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(false);
        nextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        nextStep();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetSim();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [nextStep, prevStep, togglePlay, resetSim]);

  // Handlers de parámetros de algoritmos
  const handleUpdateMezclaArr = () => {
    const parsed = inputMezclaText
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
    if (parsed.length >= 2) {
      const recorte = parsed.slice(0, 12);
      setIsPlaying(false);
      setCfgMezcla(recorte);
      setInputMezclaText(recorte.join(', '));
      setStepIdx(0);
    }
  };

  const handleShuffleMezclaArr = () => {
    const nuevo: number[] = [];
    for (let i = 0; i < 9; i++) {
      nuevo.push(Math.floor(Math.random() * 89) + 10);
    }
    setIsPlaying(false);
    setCfgMezcla(nuevo);
    setInputMezclaText(nuevo.join(', '));
    setStepIdx(0);
  };

  const handlePushSyscall = (tipo: TipoSyscall) => {
    setIsPlaying(false);
    const nuevaOp: OperacionSeek = {
      tipo,
      arg: tipo === 'TELL' ? null : opArgInput,
      whence: tipo === 'SEEK' ? whenceInput : 0
    };
    setCfgSeekOps((prev) => {
      const actualizadas = [...prev, nuevaOp];
      setStepIdx(actualizadas.length - 1);
      return actualizadas;
    });
  };

  const handleDirectSeek = (offset: number) => {
    setIsPlaying(false);
    setOpArgInput(offset);
    setWhenceInput(0);
    setCfgSeekOps((prev) => {
      const actualizadas: OperacionSeek[] = [
        ...prev,
        { tipo: 'SEEK', arg: offset, whence: 0 }
      ];
      setStepIdx(actualizadas.length - 1);
      return actualizadas;
    });
  };

  // Metadatos actuales del paso
  const currentStepStateBadge =
    currentModule === 'mezcla'
      ? mezclaSteps[safeStepIdx].estado
      : currentModule === 'escaneo'
        ? escaneoResult.pasos[safeStepIdx].estado
        : seekResult.pasos[safeStepIdx].tipo;

  const currentStepExplanation =
    currentModule === 'mezcla'
      ? mezclaSteps[safeStepIdx].explicacion
      : currentModule === 'escaneo'
        ? escaneoResult.pasos[safeStepIdx].explicacion
        : seekResult.pasos[safeStepIdx].explicacion;

  const progressPct =
    totalSteps > 1 ? (safeStepIdx / (totalSteps - 1)) * 100 : 100;

  return (
    <div className="app-shell">
      <Sidebar
        currentModule={currentModule}
        onSelectModule={handleSelectModule}
      />

      <main className="main-area">
        {/* Top Bar */}
        <header className="top-bar">
          <div>
            <div className="top-bar-meta">
              {currentModule === 'mezcla' &&
                'MÓDULO 01 · DIEGO CÓRDOVA · ORDENAMIENTO EXTERNO'}
              {currentModule === 'escaneo' &&
                'MÓDULO 04 · DYLAN GARCÍA · ARCHIVOS E INDEXACIÓN'}
              {currentModule === 'seek' &&
                'MÓDULO 07 · MAURO ROBLES · DESCRIPTORES DEL SISTEMA'}
            </div>
            <h1 className="top-bar-title">
              {currentModule === 'mezcla' &&
                'Mezcla Natural: Detección y Fusión de Corridas'}
              {currentModule === 'escaneo' &&
                'Escaneo Secuencial por Bloques (Factor B)'}
              {currentModule === 'seek' &&
                'Puntero de Archivo: Llamadas read(), seek() y tell()'}
            </h1>
            <p className="top-bar-subtitle">
              {currentModule === 'mezcla' &&
                'Partición de una cinta de entrada en subsecuencias ascendentes mediante detección de rupturas A[i] < A[i-1] y fusión 2-vías.'}
              {currentModule === 'escaneo' &&
                'Transferencia de páginas desde almacenamiento secundario al Buffer Pool en RAM con costo O(N/B).'}
              {currentModule === 'seek' &&
                'Ejecución sobre flujo binario en disco con soporte para SEEK_SET (0), SEEK_CUR (1) y SEEK_END (2).'}
            </p>
          </div>

          <div className="param-toolbar">
            {currentModule === 'mezcla' && (
              <>
                <input
                  type="text"
                  className="field-input"
                  value={inputMezclaText}
                  onChange={(e) => setInputMezclaText(e.target.value)}
                />
                <button className="btn" onClick={handleUpdateMezclaArr}>
                  Cargar cinta
                </button>
                <button
                  className="btn"
                  onClick={handleShuffleMezclaArr}
                  title="Generar secuencia aleatoria"
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M16 3h5v5" />
                    <path d="M4 20 21 3" />
                    <path d="M21 16v5h-5" />
                    <path d="m15 15 6 6" />
                    <path d="M4 4l5 5" />
                  </svg>
                  <span>Permutar</span>
                </button>
              </>
            )}

            {currentModule === 'escaneo' && (
              <>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--ink-muted)'
                  }}
                >
                  CLAVE
                </span>
                <select
                  className="field-input"
                  value={cfgClave}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCfgClave(e.target.value);
                    setStepIdx(0);
                  }}
                >
                  {CLAVES_DISPONIBLES.map((k) => (
                    <option key={k} value={k}>
                      "{k}"{k === 'Zoe' ? ' (EOF)' : ''}
                    </option>
                  ))}
                </select>

                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--ink-muted)'
                  }}
                >
                  FACTOR B
                </span>
                <select
                  className="field-input"
                  value={cfgFactorB}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCfgFactorB(parseInt(e.target.value, 10));
                    setStepIdx(0);
                  }}
                >
                  <option value={1}>B = 1 reg/página</option>
                  <option value={2}>B = 2 regs/página</option>
                  <option value={4}>B = 4 regs/página</option>
                </select>
              </>
            )}

            {currentModule === 'seek' && (
              <>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--ink-muted)'
                  }}
                >
                  OFFSET/N
                </span>
                <input
                  type="number"
                  className="field-input"
                  value={opArgInput}
                  min={-90}
                  max={105}
                  style={{ width: '62px' }}
                  onChange={(e) =>
                    setOpArgInput(parseInt(e.target.value, 10) || 0)
                  }
                />
                <select
                  className="field-input"
                  title="Modo de referencia whence para seek"
                  value={whenceInput}
                  onChange={(e) =>
                    setWhenceInput(parseInt(e.target.value, 10) as WhenceMode)
                  }
                >
                  <option value={0}>0: SEEK_SET (Inicio)</option>
                  <option value={1}>1: SEEK_CUR (Actual)</option>
                  <option value={2}>2: SEEK_END (Final EOF)</option>
                </select>
                <button
                  className="btn"
                  onClick={() => handlePushSyscall('SEEK')}
                >
                  seek(offset, whence)
                </button>
                <button
                  className="btn"
                  onClick={() => handlePushSyscall('READ')}
                >
                  read(n)
                </button>
                <button
                  className="btn"
                  onClick={() => handlePushSyscall('TELL')}
                >
                  tell()
                </button>
              </>
            )}
          </div>
        </header>

        {/* Vistas de cada Algoritmo */}
        {currentModule === 'mezcla' && (
          <MezclaView step={mezclaSteps[safeStepIdx]} />
        )}

        {currentModule === 'escaneo' && (
          <EscaneoView
            registros={escaneoResult.registros}
            claveBuscada={cfgClave}
            factorB={cfgFactorB}
            step={escaneoResult.pasos[safeStepIdx]}
          />
        )}

        {currentModule === 'seek' && (
          <SeekView
            texto={seekResult.texto}
            totalBytes={seekResult.totalBytes}
            step={seekResult.pasos[safeStepIdx]}
            onDirectSeek={handleDirectSeek}
          />
        )}

        {/* Transport Deck */}
        <footer className="transport-bar">
          <div className="status-log-line">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-tag">{currentStepStateBadge}</span>
              <span>{currentStepExplanation}</span>
            </div>
            <span
              style={{
                color: 'var(--ink-muted)',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              PASO {String(safeStepIdx).padStart(2, '0')} /{' '}
              {String(totalSteps - 1).padStart(2, '0')}
            </span>
          </div>

          <div className="transport-controls">
            <div className="btn-cluster">
              <button
                className="btn"
                onClick={prevStep}
                title="Paso anterior (Flecha Izquierda)"
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span>Anterior</span>
              </button>
              <button
                className="btn btn-step"
                onClick={() => {
                  setIsPlaying(false);
                  nextStep();
                }}
                title="Avanzar un paso (Barra Espaciadora)"
              >
                <span>Siguiente paso</span>
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              <button
                className={`btn ${isPlaying ? 'btn-playing' : ''}`}
                onClick={togglePlay}
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <polygon
                    points="6 4 20 12 6 20 6 4"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
                <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
              </button>
              <button className="btn" onClick={resetSim}>
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <span>Reiniciar</span>
              </button>
            </div>

            <div className="scrubber-wrap">
              <div className="scrubber-dots">
                <div
                  className="scrubber-bar"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--ink-muted)'
                }}
              >
                Cadencia
              </span>
              <input
                type="range"
                min={200}
                max={1100}
                step={50}
                value={speedMs}
                onChange={(e) => setSpeedMs(parseInt(e.target.value, 10))}
                style={{ width: '88px', accentColor: 'var(--sig-amber)' }}
              />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
