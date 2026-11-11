export interface PasoParseoCSV {
  pasoIdx: number;
  charActual: string;
  indiceChar: number;
  estadoMaquina: 'FUERA_CAMPO' | 'EN_CAMPO_NORMAL' | 'EN_CAMPO_COMILLAS' | 'ESPERANDO_FIN_COMILLA';
  campoActual: string;
  filaActual: string[];
  filasResultantes: string[][];
  descripcion: string;
}

export interface ResultadoParseoCSV {
  filas: string[][];
  pasos: PasoParseoCSV[];
}

export function generarPasosParseoCSV(contenidoCSV: string): ResultadoParseoCSV {
  const pasos: PasoParseoCSV[] = [];
  const filas: string[][] = [];
  
  let filaActual: string[] = [];
  let campoActual = '';
  let estado: 'FUERA_CAMPO' | 'EN_CAMPO_NORMAL' | 'EN_CAMPO_COMILLAS' | 'ESPERANDO_FIN_COMILLA' = 'FUERA_CAMPO';

  // Paso inicial
  pasos.push({
    pasoIdx: 0,
    charActual: 'INICIO',
    indiceChar: -1,
    estadoMaquina: estado,
    campoActual: '',
    filaActual: [],
    filasResultantes: [],
    descripcion: 'Iniciando escaneo carácter por carácter del búfer CSV.'
  });

  for (let i = 0; i < contenidoCSV.length; i++) {
    const c = contenidoCSV[i];
    let descripcion = '';

    if (estado === 'FUERA_CAMPO') {
      if (c === '"') {
        estado = 'EN_CAMPO_COMILLAS';
        descripcion = `Comilla de apertura detectada. Entrando en modo campo con comillas.`;
      } else if (c === ',') {
        filaActual.push(campoActual);
        campoActual = '';
        descripcion = `Delimitador ',' detectado. Campo vacío guardado.`;
      } else if (c === '\r' || c === '\n') {
        // Manejo de salto de línea
        if (c === '\r' && contenidoCSV[i + 1] === '\n') {
          i++; // saltar \n
        }
        filaActual.push(campoActual);
        filas.push([...filaActual]);
        filaActual = [];
        campoActual = '';
        estado = 'FUERA_CAMPO';
        descripcion = `Salto de línea detectado. Fila completada y agregada al conjunto de datos.`;
      } else {
        estado = 'EN_CAMPO_NORMAL';
        campoActual += c;
        descripcion = `Carácter normal '${c}' detectado. Iniciando campo estándar.`;
      }
    } else if (estado === 'EN_CAMPO_NORMAL') {
      if (c === ',') {
        filaActual.push(campoActual);
        campoActual = '';
        estado = 'FUERA_CAMPO';
        descripcion = `Fin de campo por coma. Campo guardado: "${filaActual[filaActual.length - 1]}".`;
      } else if (c === '\r' || c === '\n') {
        if (c === '\r' && contenidoCSV[i + 1] === '\n') {
          i++;
        }
        filaActual.push(campoActual);
        filas.push([...filaActual]);
        filaActual = [];
        campoActual = '';
        estado = 'FUERA_CAMPO';
        descripcion = `Fin de línea en campo normal. Fila completada.`;
      } else {
        campoActual += c;
        descripcion = `Acumulando carácter '${c}' al campo actual.`;
      }
    } else if (estado === 'EN_CAMPO_COMILLAS') {
      if (c === '"') {
        // Verificar si es comilla escapada ("") o fin de comillas
        if (contenidoCSV[i + 1] === '"') {
          campoActual += '"';
          i++;
          descripcion = `Comilla doble escapada ("") detectada dentro de comillas. Se añade una comilla literal.`;
        } else {
          estado = 'ESPERANDO_FIN_COMILLA';
          descripcion = `Comilla de cierre detectada. Esperando delimitador o salto de línea.`;
        }
      } else {
        campoActual += c;
        descripcion = `Carácter '${c}' dentro de comillas (respeta espacios y comas internas).`;
      }
    } else if (estado === 'ESPERANDO_FIN_COMILLA') {
      if (c === ',') {
        filaActual.push(campoActual);
        campoActual = '';
        estado = 'FUERA_CAMPO';
        descripcion = `Delimitador post-comilla detectado. Campo entrecomillado guardado.`;
      } else if (c === '\r' || c === '\n') {
        if (c === '\r' && contenidoCSV[i + 1] === '\n') {
          i++;
        }
        filaActual.push(campoActual);
        filas.push([...filaActual]);
        filaActual = [];
        campoActual = '';
        estado = 'FUERA_CAMPO';
        descripcion = `Salto de línea post-comilla. Fila completada.`;
      } else {
        // Si hay texto después de la comilla sin separador, lo acumulamos o manejamos como normal
        estado = 'EN_CAMPO_NORMAL';
        campoActual += c;
        descripcion = `Carácter tras comilla; continuando campo.`;
      }
    }

    pasos.push({
      pasoIdx: pasos.length,
      charActual: c === '\n' ? '\\n' : c === '\r' ? '\\r' : c,
      indiceChar: i,
      estadoMaquina: estado,
      campoActual,
      filaActual: [...filaActual],
      filasResultantes: filas.map(f => [...f]),
      descripcion
    });
  }

  // Si queda un campo pendiente al final del archivo sin salto de línea
  if (campoActual !== '' || filaActual.length > 0) {
    filaActual.push(campoActual);
    filas.push([...filaActual]);
    pasos.push({
      pasoIdx: pasos.length,
      charActual: 'EOF',
      indiceChar: contenidoCSV.length,
      estadoMaquina: estado,
      campoActual: '',
      filaActual: [],
      filasResultantes: filas.map(f => [...f]),
      descripcion: 'Fin de archivo (EOF) alcanzado. Última fila remanente añadida.'
    });
  }

  return { filas, pasos };
}