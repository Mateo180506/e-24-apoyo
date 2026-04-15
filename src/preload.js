const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  cargarDatos:          ()       => ipcRenderer.invoke('cargar-datos'),
  buscarComision:       (p)      => ipcRenderer.invoke('buscar-comision', p),
  obtenerDepartamentos: ()       => ipcRenderer.invoke('obtener-departamentos'),
  obtenerMunicipios:    (depId)  => ipcRenderer.invoke('obtener-municipios', depId),
  minimizar: () => ipcRenderer.send('win-min'),
  maximizar: () => ipcRenderer.send('win-max'),
  cerrar:    () => ipcRenderer.send('win-close'),
});
