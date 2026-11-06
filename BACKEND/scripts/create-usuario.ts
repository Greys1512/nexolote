import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

process.loadEnvFile(path.join(__dirname, '..', '.env'));

const CA = fs.readFileSync(path.resolve(__dirname, '..', process.env.DB_CA!));

async function main() {
  const nombre = process.env.INITIAL_USER_NAME;
  const correo = process.env.INITIAL_USER_EMAIL;
  const password = process.env.INITIAL_USER_PASSWORD;
  const rol = process.env.INITIAL_USER_ROLE || 'Administrador';

  if (!nombre || !correo || !password) {
    throw new Error(
      'Define INITIAL_USER_NAME, INITIAL_USER_EMAIL e INITIAL_USER_PASSWORD antes de ejecutar este script.',
    );
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { ca: CA, minVersion: 'TLSv1.2' },
    multipleStatements: true,
    connectTimeout: 20000,
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS usuario (
      id_usuario INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      correo VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      rol VARCHAR(50) NOT NULL,
      estado VARCHAR(20) NOT NULL DEFAULT 'Activo'
    )
  `);
  console.log('Tabla "usuario" creada (o ya existía).');

  const hash = await bcrypt.hash(password, 10);

  const [result] = await conn.execute(
    `INSERT INTO usuario (nombre, correo, password_hash, rol, estado)
     VALUES (?, ?, ?, ?, ?)`,
    [nombre, correo, hash, rol, 'Activo'],
  );
  const id = (result as any).insertId as number;
  console.log(`Insert OK -> id_usuario = ${id}`);

  const [rows] = await conn.execute(
    'SELECT id_usuario, nombre, correo, rol, estado FROM usuario WHERE id_usuario = ?',
    [id],
  );
  console.log(JSON.stringify(rows, null, 2));

  const [ok] = await conn.execute('SELECT 1 AS ok');
  console.log('Verificación bcrypt:', await bcrypt.compare(password, hash));

  await conn.end();
}

main().catch((err) => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
