import * as fs from 'fs';
import * as path from 'path';
import mysql from 'mysql2/promise';

// Node >= 20.12: carga BACKEND/.env sin dependencias externas
process.loadEnvFile(path.join(__dirname, '..', '.env'));

async function main() {
  const caPath = path.resolve(__dirname, '..', process.env.DB_CA || './certs/tidb-ca.pem');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { ca: fs.readFileSync(caPath), minVersion: 'TLSv1.2' },
    connectTimeout: 20000,
  });

  const [version] = await conn.query('SELECT VERSION() AS v');
  console.log('Conectado. TiDB version:', (version as any)[0].v);

  const [dbs] = await conn.query('SHOW DATABASES');
  console.log(
    'Databases:',
    (dbs as any[]).map((d) => Object.values(d)[0]).join(', '),
  );

  const [tables] = await conn.query('SHOW TABLES');
  console.log('Tablas en nexolote:', (tables as any[]).length);
  console.log(
    (tables as any[]).map((t) => Object.values(t)[0]).join(', ') || '(vacío)',
  );

  await conn.end();
}

main().catch((err) => {
  console.error('ERROR DE CONEXIÓN:', err.message);
  process.exit(1);
});
