import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const distDir = path.resolve('dist');
const zipFilename = 'instantsign-chrome-extension.zip';
const zipFilePath = path.resolve(zipFilename);

if (!fs.existsSync(distDir)) {
  console.error("❌ Error: dist directory does not exist. Please run 'npm run build' first.");
  process.exit(1);
}

// Ensure old zip is removed if it exists
if (fs.existsSync(zipFilePath)) {
  fs.unlinkSync(zipFilePath);
}

console.log('📦 Empaquetando la extensión desde dist/...');

let success = false;

// Attempt 1: Execute scripts/package-extension.py via Python
try {
  execSync('python scripts/package-extension.py', { stdio: 'inherit' });
  if (fs.existsSync(zipFilePath)) {
    success = true;
  }
} catch {
  // Python not available or failed
}

// Attempt 2: Try PowerShell Compress-Archive on Windows
if (!success && process.platform === 'win32') {
  try {
    execSync(
      `powershell -NoProfile -Command "$ErrorActionPreference = 'Stop'; Compress-Archive -Path '${distDir}\\*' -DestinationPath '${zipFilePath}' -Force"`,
      { stdio: 'pipe' }
    );
    if (fs.existsSync(zipFilePath)) {
      success = true;
    }
  } catch {
    // PowerShell Compress-Archive failed
  }
}

// Attempt 3: Try tar
if (!success) {
  try {
    execSync(`tar -a -c -f "${zipFilePath}" -C "${distDir}" *`, { stdio: 'pipe' });
    if (fs.existsSync(zipFilePath)) {
      success = true;
    }
  } catch {
    // Tar failed
  }
}

if (!success || !fs.existsSync(zipFilePath)) {
  console.error('❌ Error: No se pudo empaquetar el archivo .zip.');
  process.exit(1);
}

const stats = fs.statSync(zipFilePath);
const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`✅ Verificado: ${zipFilename} (${sizeMb} MB) listo para Chrome Web Store.`);
