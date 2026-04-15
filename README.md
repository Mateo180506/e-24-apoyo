# ⚖️ Comisiones Escrutadoras — Registraduría Nacional 2026

Aplicación de escritorio para buscar la **comisión escrutadora** de cualquier mesa de votación en Colombia. Soporta **Cámara** y **Senado**.

---

## 🚀 INSTALACIÓN PASO A PASO (Windows)

### Paso 1 — Instalar Node.js (solo una vez)
1. Entra a 👉 **https://nodejs.org**
2. Descarga la versión **LTS** (botón verde)
3. Ejecuta el `.msi` y acepta todo
4. ⚠️ Asegúrate de que **"Add to PATH"** esté marcado
5. **Cierra y vuelve a abrir** PowerShell

### Paso 2 — Verificar instalación
```powershell
node --version
npm --version
```
Si ves números, ¡está listo!

### Paso 3 — Ejecutar la app
```powershell
cd C:\Users\TU_NOMBRE\Documents\comisiones-app
npm install
npm start
```

---

## 📦 Generar instalador .exe
```powershell
npm run build:win
```
El `.exe` queda en la carpeta `dist/`.

---

## ❓ Errores comunes

| Error | Solución |
|-------|----------|
| `npm no se reconoce` | Instala Node.js y reinicia PowerShell |
| La app no abre | Corre `npm install` primero |

---
**Licencia:** MIT
