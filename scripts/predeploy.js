const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');
const apiDir = path.join(outDir, 'api');

// Eliminar carpeta API si existe
if (fs.existsSync(apiDir)) {
  console.log('Eliminando carpeta API para Firebase Hosting...');
  fs.rmSync(apiDir, { recursive: true, force: true });
  console.log('✅ Carpeta API eliminada');
} else {
  console.log('No se encontró carpeta API');
}