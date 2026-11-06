import * as fs from 'fs';
import * as path from 'path';
import mysql from 'mysql2/promise';

process.loadEnvFile(path.join(__dirname, '..', '.env'));

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: {
      ca: fs.readFileSync(path.resolve(__dirname, '..', process.env.DB_CA!)),
      minVersion: 'TLSv1.2',
    },
    connectTimeout: 20000,
  });

  const [tables] = (await conn.query('SHOW TABLES')) as any[];
  console.log('Tabla'.padEnd(24), 'Filas');
  console.log('-'.repeat(34));
  for (const t of tables) {
    const name = Object.values(t)[0] as string;
    const [[c]] = (await conn.query(`SELECT COUNT(*) AS c FROM \`${name}\``)) as any[];
    console.log(name.padEnd(24), c);
  }
  await conn.end();
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
