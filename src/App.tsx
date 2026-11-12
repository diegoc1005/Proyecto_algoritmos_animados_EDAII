import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CONTENIDO_EMPLEADOS_DEFAULT,
  generarPasosEscaneoSecuencial
} from './algorithms/escaneoSecuencial';
import { generarPasosMezclaNatural } from './algorithms/mezclaNatural';
import { generarPasosMerge2Vias } from './algorithms/mergeSort2Vias';
import { generarPasosOrdenamientoCubetas } from './algorithms/ordenamientoCubetas';
import { simularAsignacionDisco } from './algorithms/asignacionDisco';
import { simularRaid } from './algorithms/raidSimulacion';
import {
  OPERACIONES_SEEK_DEFAULT,
  TEXTO_ARCHIVO_SECUENCIAL_DEFAULT,
  generarPasosSeekTell
} from './algorithms/punteroSeekTell';
import { generarPasosIndiceDenso } from './algorithms/indiceDenso';
import { IndiceDensoView } from './components/IndiceDensoView';
import { EscaneoView } from './components/EscaneoView';
import { MezclaView } from './components/MezclaView';
import { MergeSort2ViasView } from './components/MergeSort2ViasView';
import { CubetasView } from './components/CubetasView';
import { AsignacionDiscoView } from './components/AsignacionDiscoView';
import { RaidView } from './components/RaidView';
import { SeekView } from './components/SeekView';
import { Sidebar } from './components/Sidebar';
import { CodeTracerPanel } from './components/CodeTracerPanel';
import { generarPasosParseoCSV } from './algorithms/parseoCSV';
import { ParseoCSVView } from './components/ParseoCSVView';
import {
  EscenarioRaid,
  EstrategiaAsignacion,
  ModuleId,
  NivelRaid,
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
  const [showCode, setShowCode] = useState<boolean>(true);
  const [codePanelWidth, setCodePanelWidth] = useState<number>(390);
  const [isResizingCode, setIsResizingCode] = useState<boolean>(false);

  // Arrastre con el cursor para redimensionar el panel de código
  useEffect(() => {
    if (!isResizingCode) return;

    const handleMouseMove = (e: MouseEvent) => {
      const maxAllowed = Math.max(360, window.innerWidth - 360);
      const nextWidth = Math.max(
        260,
        Math.min(maxAllowed, window.innerWidth - e.clientX)
      );
      setCodePanelWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsResizingCode(false);
    };

    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingCode]);

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

  // Parámetros Módulo 2: Merge Sort 2-Vías (Semana 2 - Diego)
  const [cfgCintaA, setCfgCintaA] = useState<number[]>([2, 5, 8, 11, 14]);
  const [cfgCintaB, setCfgCintaB] = useState<number[]>([1, 4, 7, 9, 12, 15]);
  const [inputCintaAText, setInputCintaAText] = useState<string>('2, 5, 8, 11, 14');
  const [inputCintaBText, setInputCintaBText] = useState<string>('1, 4, 7, 9, 12, 15');

  // Parámetros Módulo 3: Ordenamiento por Distribución / Cubetas (Semana 3 - Diego)
  const [cfgCubetasArr, setCfgCubetasArr] = useState<number[]>([
    42, 15, 78, 8, 91, 23, 56, 34, 67, 19
  ]);
  const [inputCubetasText, setInputCubetasText] = useState<string>(
    '42, 15, 78, 8, 91, 23, 56, 34, 67, 19'
  );
  const [cfgNumCubetas, setCfgNumCubetas] = useState<number>(4);

  // Parámetros Módulo 4 y 5: Escaneo Secuencial e Índice Denso (Dylan)
  const [cfgClave, setCfgClave] = useState<string>('Beto');
  const [cfgFactorB, setCfgFactorB] = useState<number>(2);

  // Parámetros Módulo 6: Parseo Manual de CSV (Dylan - Semana 3)
  const [csvInputText, setCsvInputText] = useState<string>(
    `ID,Nombre,Departamento,Salario
  101,"García Rayon, Dylan",Ingeniería,45000
  102,"Córdova García, Diego",Sistemas,48000
  103,"Robles de la Rosa, Mauro",Infraestructura,47000`
  );

  // Parámetros Módulo 7: Seek, Read & Tell (Mauro - Semana 1)
  const [cfgSeekOps, setCfgSeekOps] = useState<OperacionSeek[]>(
    OPERACIONES_SEEK_DEFAULT
  );
  const [opArgInput, setOpArgInput] = useState<number>(10);
  const [whenceInput, setWhenceInput] = useState<WhenceMode>(0);

  // Parámetros Módulo 8: Asignación de Espacio en Disco (Mauro - Semana 2)
  const [cfgEstrategia, setCfgEstrategia] = useState<EstrategiaAsignacion>('contigua');
  const [cfgAccionAsig, setCfgAccionAsig] = useState<'insertar_nuevo' | 'acceso_aleatorio'>('insertar_nuevo');

  // Parámetros Módulo 9: RAID 0 vs RAID 1 (Mauro - Semana 3)
  const [cfgNivelRaid, setCfgNivelRaid] = useState<NivelRaid>('raid0');
  const [cfgEscenarioRaid, setCfgEscenarioRaid] = useState<EscenarioRaid>('escritura');

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

  const merge2ViasSteps = useMemo(
    () => generarPasosMerge2Vias(cfgCintaA, cfgCintaB, 2),
    [cfgCintaA, cfgCintaB]
  );

  const cubetasSteps = useMemo(
    () => generarPasosOrdenamientoCubetas(cfgCubetasArr, cfgNumCubetas, 2),
    [cfgCubetasArr, cfgNumCubetas]
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

  const indiceResult = useMemo(
    () => generarPasosIndiceDenso(cfgClave, archivoEmpleadosRaw),
    [cfgClave, archivoEmpleadosRaw]
  );

  const csvResult = useMemo(
    () => generarPasosParseoCSV(csvInputText),
    [csvInputText]
  );

  const seekResult = useMemo(
    () => generarPasosSeekTell(cfgSeekOps, archivoSecuencialRaw),
    [cfgSeekOps, archivoSecuencialRaw]
  );

  const asignacionSteps = useMemo(
    () => simularAsignacionDisco(cfgEstrategia, cfgAccionAsig),
    [cfgEstrategia, cfgAccionAsig]
  );

  const raidSteps = useMemo(
    () => simularRaid(cfgNivelRaid, cfgEscenarioRaid),
    [cfgNivelRaid, cfgEscenarioRaid]
  );

  const totalSteps =
    currentModule === 'mezcla'
      ? mezclaSteps.length
      : currentModule === 'merge2vias'
        ? merge2ViasSteps.length
        : currentModule === 'cubetas'
          ? cubetasSteps.length
          : currentModule === 'escaneo'
            ? escaneoResult.pasos.length
            : currentModule === 'indice'
              ? indiceResult.pasos.length
              : currentModule === 'csv'
                ? csvResult.pasos.length
                : currentModule === 'seek'
                  ? seekResult.pasos.length
                  : currentModule === 'asignacion'
                    ? asignacionSteps.length
                    : raidSteps.length;

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

  // Handlers de parámetros Módulo 1 (Mezcla Natural)
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

  // Handlers de parámetros Módulo 2 (Merge Sort 2-Vías)
  const handleUpdateMergeCintas = () => {
    const parsedA = inputCintaAText
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
    const parsedB = inputCintaBText
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));

    if (parsedA.length >= 1 && parsedB.length >= 1) {
      setIsPlaying(false);
      setCfgCintaA(parsedA.slice(0, 8));
      setCfgCintaB(parsedB.slice(0, 8));
      setStepIdx(0);
    }
  };

  const handleShuffleMergeCintas = () => {
    const nuevoA: number[] = [];
    const nuevoB: number[] = [];
    for (let i = 0; i < 5; i++) {
      nuevoA.push(Math.floor(Math.random() * 45) + 1);
    }
    for (let i = 0; i < 6; i++) {
      nuevoB.push(Math.floor(Math.random() * 45) + 1);
    }
    const sortSimple = (arr: number[]) => {
      const res = [...arr];
      for (let i = 1; i < res.length; i++) {
        const val = res[i];
        let j = i - 1;
        while (j >= 0 && res[j] > val) {
          res[j + 1] = res[j];
          j--;
        }
        res[j + 1] = val;
      }
      return res;
    };
    const ordA = sortSimple(nuevoA);
    const ordB = sortSimple(nuevoB);
    setIsPlaying(false);
    setCfgCintaA(ordA);
    setCfgCintaB(ordB);
    setInputCintaAText(ordA.join(', '));
    setInputCintaBText(ordB.join(', '));
    setStepIdx(0);
  };

  // Handlers de parámetros Módulo 3 (Ordenamiento por Distribución / Cubetas)
  const handleUpdateCubetasArr = () => {
    const parsed = inputCubetasText
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 999);
    if (parsed.length >= 2) {
      const recorte = parsed.slice(0, 12);
      setIsPlaying(false);
      setCfgCubetasArr(recorte);
      setInputCubetasText(recorte.join(', '));
      setStepIdx(0);
    }
  };

  const handleShuffleCubetasArr = () => {
    const nuevo: number[] = [];
    for (let i = 0; i < 10; i++) {
      nuevo.push(Math.floor(Math.random() * 96) + 2);
    }
    setIsPlaying(false);
    setCfgCubetasArr(nuevo);
    setInputCubetasText(nuevo.join(', '));
    setStepIdx(0);
  };

  // Handlers Módulo Seek
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
      : currentModule === 'merge2vias'
        ? merge2ViasSteps[safeStepIdx].estado
        : currentModule === 'cubetas'
          ? cubetasSteps[safeStepIdx].estado
          : currentModule === 'escaneo'
            ? escaneoResult.pasos[safeStepIdx].estado
            : currentModule === 'indice'
              ? indiceResult.pasos[safeStepIdx].estado
              : currentModule === 'csv'
                ? csvResult.pasos[safeStepIdx].estadoMaquina
                : currentModule === 'seek'
                  ? seekResult.pasos[safeStepIdx].tipo
                  : currentModule === 'asignacion'
                    ? asignacionSteps[safeStepIdx].estado
                    : raidSteps[safeStepIdx].estado;

  const currentStepExplanation =
    currentModule === 'mezcla'
      ? mezclaSteps[safeStepIdx].explicacion
      : currentModule === 'merge2vias'
        ? merge2ViasSteps[safeStepIdx].explicacion
        : currentModule === 'cubetas'
          ? cubetasSteps[safeStepIdx].explicacion
          : currentModule === 'escaneo'
            ? escaneoResult.pasos[safeStepIdx].explicacion
            : currentModule === 'indice'
              ? indiceResult.pasos[safeStepIdx].explicacion
              : currentModule === 'csv'
                ? csvResult.pasos[safeStepIdx].descripcion
                : currentModule === 'seek'
                  ? seekResult.pasos[safeStepIdx].explicacion
                  : currentModule === 'asignacion'
                    ? asignacionSteps[safeStepIdx].explicacion
                    : raidSteps[safeStepIdx].explicacion;

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
                'MÓDULO 01 · DIEGO CÓRDOVA · ORDENAMIENTO EXTERNO (NATURAL MERGE SORT)'}
              {currentModule === 'merge2vias' &&
                'MÓDULO 02 · DIEGO CÓRDOVA · ORDENAMIENTO EXTERNO (EXTERNAL 2-WAY MERGE)'}
              {currentModule === 'cubetas' &&
                'MÓDULO 03 · DIEGO CÓRDOVA · ORDENAMIENTO EXTERNO (DISTRIBUTION / BUCKET SORT)'}
              {currentModule === 'escaneo' &&
                'MÓDULO 04 · DYLAN GARCÍA · ARCHIVOS E INDEXACIÓN'}
              {currentModule === 'indice' &&
                'MÓDULO 05 · DYLAN GARCÍA · ÍNDICE DENSO Y BÚSQUEDA BINARIA'}
              {currentModule === 'csv' &&
                'MÓDULO 06 · DYLAN GARCÍA · PARSEO MANUAL DE CSV Y MÁQUINA DE ESTADOS'}
              {currentModule === 'seek' &&
                'MÓDULO 07 · MAURO ROBLES · DESCRIPTORES DEL SISTEMA'}
              {currentModule === 'asignacion' &&
                'MÓDULO 08 · MAURO ROBLES · SISTEMAS DE ARCHIVOS (SEMANA 2)'}
              {currentModule === 'raid' &&
                'MÓDULO 09 · MAURO ROBLES · ARQUITECTURA RAID (SEMANA 3)'}
            </div>
            <h1 className="top-bar-title">
              {currentModule === 'mezcla' &&
                'Mezcla Natural (Natural Merge Sort)'}
              {currentModule === 'merge2vias' &&
                'Merge Sort Externo (Fase 2 - Mezcla de 2 vías)'}
              {currentModule === 'cubetas' &&
                'Ordenamiento por Distribución (Cubetas / Bucket Sort)'}
              {currentModule === 'escaneo' &&
                'Escaneo Secuencial por Bloques (Factor B)'}
              {currentModule === 'indice' &&
                'Índice Denso en RAM con Búsqueda Binaria O(log N)'}
              {currentModule === 'csv' &&
                'Parseo Manual de CSV por Carácter (Máquina de Estados)'}
              {currentModule === 'seek' &&
                'Puntero de Archivo: Llamadas read(), seek() y tell()'}
              {currentModule === 'asignacion' &&
                'Asignación de Espacio en Disco: Contigua vs Enlazada vs Indexada'}
              {currentModule === 'raid' &&
                'RAID 0 (Striping) vs RAID 1 (Mirroring): Velocidad y Redundancia'}
            </h1>
            <p className="top-bar-subtitle">
              {currentModule === 'mezcla' &&
                'Partición de una cinta de entrada en subsecuencias ascendentes mediante detección de rupturas A[i] < A[i-1] y fusión 2-vías.'}
              {currentModule === 'merge2vias' &&
                'Fusión secuencial de dos cintas/archivos ordenados (F1 y F2) hacia una cinta de salida vacía (F0) mediante dos punteros y vaciado de remanentes.'}
              {currentModule === 'cubetas' &&
                'Partición aritmética en K cubetas de rango fijo (Scatter), ordenamiento local en RAM (Insertion Sort) y concatenación directa O(N/B) sin mezcla K-vías.'}
              {currentModule === 'escaneo' &&
                'Transferencia de páginas desde almacenamiento secundario al Buffer Pool en RAM con costo O(N/B).'}
              {currentModule === 'indice' &&
                'Tabla con una entrada por cada registro ordenada en RAM, permitiendo localizar el offset exacto y realizar un único acceso E/S a disco.'}
              {currentModule === 'csv' &&
                'Análisis léxico carácter por carácter con soporte para campos entrecomillados y comas internas sin usar split().'}
              {currentModule === 'seek' &&
                'Ejecución sobre flujo binario en disco con soporte para SEEK_SET (0), SEEK_CUR (1) y SEEK_END (2).'}
              {currentModule === 'asignacion' &&
                'Comparativa visual de fragmentación externa, punteros encadenados y tablas de Inodos sobre 32 bloques físicos de almacenamiento.'}
              {currentModule === 'raid' &&
                'Distribución de bloques intercalados en paralelo (Striping) frente a duplicación íntegra en espejo (Mirroring) con simulación de falla física de disco.'}
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

            {currentModule === 'merge2vias' && (
              <>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--sig-amber)' }}>
                  CINTA A
                </span>
                <input
                  type="text"
                  className="field-input"
                  value={inputCintaAText}
                  style={{ width: '130px' }}
                  onChange={(e) => setInputCintaAText(e.target.value)}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--sig-ice)' }}>
                  CINTA B
                </span>
                <input
                  type="text"
                  className="field-input"
                  value={inputCintaBText}
                  style={{ width: '130px' }}
                  onChange={(e) => setInputCintaBText(e.target.value)}
                />
                <button className="btn" onClick={handleUpdateMergeCintas}>
                  Cargar
                </button>
                <button
                  className="btn"
                  onClick={handleShuffleMergeCintas}
                  title="Generar nuevas cintas ordenadas aleatorias"
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

            {currentModule === 'cubetas' && (
              <>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--sig-amber)'
                  }}
                >
                  CINTA
                </span>
                <input
                  type="text"
                  className="field-input"
                  value={inputCubetasText}
                  style={{ width: '195px' }}
                  onChange={(e) => setInputCubetasText(e.target.value)}
                />
                <button className="btn" onClick={handleUpdateCubetasArr}>
                  Cargar
                </button>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--ink-muted)'
                  }}
                >
                  CUBETAS
                </span>
                <select
                  className="field-input"
                  value={cfgNumCubetas}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCfgNumCubetas(parseInt(e.target.value, 10));
                    setStepIdx(0);
                  }}
                >
                  <option value={3}>K = 3 cubetas</option>
                  <option value={4}>K = 4 cubetas</option>
                  <option value={5}>K = 5 cubetas</option>
                </select>
                <button
                  className="btn"
                  onClick={handleShuffleCubetasArr}
                  title="Generar secuencia aleatoria [0..99]"
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

            {(currentModule === 'escaneo' || currentModule === 'indice') && (
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

                {currentModule === 'escaneo' && (
                  <>
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

            {currentModule === 'csv' && (
              <>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                  CSV CRUDO
                </span>
                <input
                  type="text"
                  className="field-input"
                  value={csvInputText}
                  style={{ width: '220px' }}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCsvInputText(e.target.value);
                    setStepIdx(0);
                  }}
                />
              </>
            )}

            {currentModule === 'asignacion' && (
              <>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                  ESTRATEGIA
                </span>
                <select
                  className="field-input"
                  value={cfgEstrategia}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCfgEstrategia(e.target.value as EstrategiaAsignacion);
                    setStepIdx(0);
                  }}
                >
                  <option value="contigua">1. Asignación Contigua</option>
                  <option value="enlazada">2. Asignación Enlazada</option>
                  <option value="indexada">3. Asignación Indexada (Inodo)</option>
                </select>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                  OPERACIÓN
                </span>
                <select
                  className="field-input"
                  value={cfgAccionAsig}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCfgAccionAsig(e.target.value as 'insertar_nuevo' | 'acceso_aleatorio');
                    setStepIdx(0);
                  }}
                >
                  <option value="insertar_nuevo">Crear archivo app.exe (4 bloques)</option>
                  <option value="acceso_aleatorio">Leer bloque #2 de database.db</option>
                </select>
              </>
            )}

            {currentModule === 'raid' && (
              <>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--ink-muted)'
                  }}
                >
                  NIVEL RAID
                </span>
                <select
                  className="field-input"
                  value={cfgNivelRaid}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCfgNivelRaid(e.target.value as NivelRaid);
                    setStepIdx(0);
                  }}
                >
                  <option value="raid0">RAID 0 · Striping (Velocidad 2x)</option>
                  <option value="raid1">RAID 1 · Mirroring (Espejo 1:1)</option>
                </select>

                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--ink-muted)'
                  }}
                >
                  ESCENARIO
                </span>
                <select
                  className="field-input"
                  value={cfgEscenarioRaid}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCfgEscenarioRaid(e.target.value as EscenarioRaid);
                    setStepIdx(0);
                  }}
                >
                  <option value="escritura">1. Escritura y Lectura Normal</option>
                  <option value="fallo_disco">2. Simular Fallo Físico en Disco 1</option>
                </select>
              </>
            )}
          </div>
        </header>

        {/* Escenario Dividido: Animación Hardware + Trazador de Código en Vivo */}
        <div
          className={`stage-split-layout ${showCode ? 'with-code' : ''}`}
          style={
            showCode
              ? ({ '--code-panel-width': `${codePanelWidth}px` } as React.CSSProperties)
              : undefined
          }
        >
          <div className="stage-left-column">
            {currentModule === 'mezcla' && (
              <MezclaView step={mezclaSteps[safeStepIdx]} />
            )}

            {currentModule === 'merge2vias' && (
              <MergeSort2ViasView step={merge2ViasSteps[safeStepIdx]} />
            )}

            {currentModule === 'cubetas' && (
              <CubetasView step={cubetasSteps[safeStepIdx]} />
            )}

            {currentModule === 'escaneo' && (
              <EscaneoView
                registros={escaneoResult.registros}
                claveBuscada={cfgClave}
                factorB={cfgFactorB}
                step={escaneoResult.pasos[safeStepIdx]}
              />
            )}

            {currentModule === 'indice' && (
              <IndiceDensoView
                registros={escaneoResult.registros}
                claveBuscada={cfgClave}
                step={indiceResult.pasos[safeStepIdx]}
              />
            )}

            {currentModule === 'csv' && (
              <ParseoCSVView
                stepIdx={safeStepIdx}
                totalSteps={totalSteps}
                csvInputText={csvInputText}
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

            {currentModule === 'asignacion' && (
              <AsignacionDiscoView step={asignacionSteps[safeStepIdx]} />
            )}

            {currentModule === 'raid' && (
              <RaidView step={raidSteps[safeStepIdx]} />
            )}
          </div>

          {showCode && (
            <CodeTracerPanel
              moduleId={currentModule}
              stateBadge={currentStepStateBadge}
              stepIdx={safeStepIdx}
              isResizing={isResizingCode}
              onStartResize={(e) => {
                e.preventDefault();
                setIsResizingCode(true);
              }}
              onResetWidth={() => setCodePanelWidth(390)}
            />
          )}
        </div>

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
              <button
                className={`btn ${showCode ? 'btn-playing' : ''}`}
                onClick={() => setShowCode((v) => !v)}
                title="Mostrar / ocultar trazador de código línea por línea"
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                <span>{showCode ? 'Código: ON' : 'Código: OFF'}</span>
              </button>
            </div>

            <div className="scrubber-wrap" style={{ maxWidth: '520px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10.5px',
                  color: 'var(--ink-muted)'
                }}
              >
                LÍNEA DE TIEMPO
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, totalSteps - 1)}
                value={safeStepIdx}
                title={`Ir al paso (${safeStepIdx} / ${Math.max(0, totalSteps - 1)})`}
                onChange={(e) => {
                  setIsPlaying(false);
                  setStepIdx(parseInt(e.target.value, 10));
                }}
                style={{
                  flex: 1,
                  accentColor: 'var(--sig-amber)',
                  cursor: 'pointer'
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10.5px',
                  color: 'var(--ink-muted)'
                }}
              >
                VELOCIDAD
              </span>
              <select
                className="field-input"
                value={speedMs}
                onChange={(e) => setSpeedMs(parseInt(e.target.value, 10))}
                style={{ padding: '4px 8px', fontSize: '11px' }}
              >
                <option value={1000}>0.5x (Lento)</option>
                <option value={600}>1.0x (Normal)</option>
                <option value={300}>2.0x (Rápido)</option>
                <option value={150}>4.0x (Turbo)</option>
              </select>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
