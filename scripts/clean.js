import fs from 'fs';
import path from 'path';

const targets = ['dist', 'instantsign-chrome-extension.zip'];

for (const target of targets) {
  const fullPath = path.resolve(target);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`🧹 Eliminado: ${target}`);
  }
}
console.log('✨ Limpieza completada.');
