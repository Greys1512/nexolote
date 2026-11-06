import * as fs from 'fs';
import * as path from 'path';

/**
 * Carga BACKEND/.env subiendo desde el directorio del módulo.
 * Funciona en desarrollo (apps/<app>/src/...) y en build (dist/apps/<app>),
 * donde rspack empaqueta todo en un solo main.js.
 */
export function cargarEnv(): void {
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, '.env');
    if (fs.existsSync(candidate)) {
      process.loadEnvFile(candidate);
      return;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  if (!process.env.DB_CA) return;

  const caPath = path.resolve(
    process.env.BACKEND_ROOT || process.cwd(),
    process.env.DB_CA,
  );
  if (!fs.existsSync(caPath)) {
    throw new Error(`No se encontró el certificado CA configurado en DB_CA: ${caPath}`);
  }
}
