const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1150, height: 820, minWidth: 900, minHeight: 650,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false
    },
    backgroundColor: '#0a0f1e'
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

function cargarComisiones() {
  const posibles = [
    path.join(__dirname, '../assets/comisiones_escrutadoras.csv'),
    path.join(process.resourcesPath || '', 'assets/comisiones_escrutadoras.csv'),
    path.join(app.getAppPath(), 'assets/comisiones_escrutadoras.csv')
  ];
  let contenido = null;
  for (const ruta of posibles) {
    if (fs.existsSync(ruta)) { contenido = fs.readFileSync(ruta, { encoding: 'latin1' }); break; }
  }
  if (!contenido) throw new Error('No se encontró el archivo CSV.');

  const lineas = contenido.split('\n').filter(l => l.trim());
  const enc = lineas[0].split(';').map(h => h.trim());

  return lineas.slice(1).map(linea => {
    const cols = linea.split(';');
    const f = {};
    enc.forEach((col, i) => f[col] = (cols[i] || '').trim());
    f._dep    = parseInt(f['Depto ID'])     || null;
    f._mun    = parseInt(f['Mcpio ID'])     || null;
    f._zona   = parseInt(f['Zona ID'])      || null;
    f._puesto = parseInt(f['Puesto ID'])    || null;
    f._mesa_i = parseInt(f['Mesa Inicial']) || null;
    f._mesa_f = parseInt(f['Mesa Final'])   || null;
    const aux  = (f['Comisión Auxiliar']  || '').trim();
    const mpal = (f['Comisión Municipal'] || '').trim();
    const dtal = (f['Comisión Dptal']     || '').trim();
    f._nivel = aux ? 'AUXILIAR' : mpal ? 'MUNICIPAL' : dtal ? 'DEPARTAMENTAL' : 'NACIONAL';
    return f;
  });
}

function buscarComision(dep, mun, zona, puesto, mesa, datos) {
  const depI = parseInt(dep)||null, munI = parseInt(mun)||null;
  const zonaI = parseInt(zona)||null, puestoI = parseInt(puesto)||null, mesaI = parseInt(mesa)||null;
  if (!depI || !munI || !mesaI) return { encontrado: false, error: 'Departamento, municipio y mesa son obligatorios.' };
  let sub = datos.filter(f => f._dep === depI && f._mun === munI);
  if (!sub.length) return { encontrado: false, error: 'No se encontraron datos para ese departamento/municipio.' };
  if (zonaI !== null) { const sz = sub.filter(f => f._zona === zonaI); if (sz.length) sub = sz; }
  if (puestoI !== null) { const sp = sub.filter(f => f._puesto === puestoI); if (sp.length) sub = sp; }
  const subM = sub.filter(f => f._mesa_i !== null && f._mesa_f !== null && mesaI >= f._mesa_i && mesaI <= f._mesa_f);
  if (!subM.length) return { encontrado: false, error: `La mesa ${mesa} no cae en ningún rango registrado para esos filtros.` };
  const fila = subM[0];
  return {
    encontrado: true,
    nivel: fila._nivel,
    nombre_comision: fila['Nombre Comisión'] || '',
    comision_auxiliar: fila['Comisión Auxiliar'] || '',
    comision_mpal: fila['Comisión Municipal'] || '',
    comision_dptal: fila['Comisión Dptal'] || '',
    comision_nac: fila['Comisión Nacional'] || '',
    lugar: fila['lugar de escrutinios'] || '',
    direccion: fila['direccion de escrutinios'] || '',
    mesa_ini: fila._mesa_i, mesa_fin: fila._mesa_f,
    total_mesas: fila['Total Mesas'] || '',
    departamento: fila['Departamento'] || '',
    municipio: fila['Municipio'] || '',
    puesto_nombre: fila['Puesto'] || '',
    comuna: fila['Comuna'] || '',
    zona_id: fila['Zona ID'] || '',
  };
}

let datosCache = null;

ipcMain.handle('cargar-datos', () => {
  try { datosCache = cargarComisiones(); return { ok: true, total: datosCache.length }; }
  catch (e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('buscar-comision', (_, p) => {
  if (!datosCache) return { encontrado: false, error: 'Datos no cargados.' };
  return buscarComision(p.dep, p.mun, p.zona, p.puesto, p.mesa, datosCache);
});

ipcMain.handle('obtener-departamentos', () => {
  if (!datosCache) return [];
  const mapa = new Map();
  datosCache.forEach(f => { if (f._dep && f['Departamento'] && f['Departamento'].trim()) mapa.set(f._dep, f['Departamento'].trim()); });
  return [...mapa.entries()].map(([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
});

ipcMain.handle('obtener-municipios', (_, depId) => {
  if (!datosCache) return [];
  const mapa = new Map();
  datosCache.filter(f => f._dep === parseInt(depId) && f['Municipio'] && f['Municipio'].trim())
    .forEach(f => mapa.set(f._mun, f['Municipio'].trim()));
  return [...mapa.entries()].map(([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
});

ipcMain.on('win-min',   () => mainWindow?.minimize());
ipcMain.on('win-max',   () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize());
ipcMain.on('win-close', () => mainWindow?.close());

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
