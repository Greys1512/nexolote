import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import mysql, { Pool } from 'mysql2/promise';

/**
 * Busca BACKEND/.env subiendo desde el directorio del módulo.
 * Funciona tanto en desarrollo (apps/<svc>/src/database) como en build
 * (dist/apps/<svc>, donde todo queda empaquetado en main.js).
 */
function loadBackendEnv(): string | undefined {
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, '.env');
    if (fs.existsSync(candidate)) {
      process.loadEnvFile(candidate);
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

const BACKEND_ROOT = loadBackendEnv();

const CA_PATH =
  process.env.DB_CA
    ? path.resolve(BACKEND_ROOT || process.cwd(), process.env.DB_CA)
    : undefined;
const CA_CERT = process.env.DB_CA_CERT
  ? Buffer.from(process.env.DB_CA_CERT.replace(/\\n/g, '\n'))
  : CA_PATH
    ? fs.readFileSync(CA_PATH)
    : undefined;

/** Códigos de error que indican que la conexión estaba muerta. */
const CODIGOS_CONEXION = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'EPIPE',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  'ENOTFOUND',
  'PROTOCOL_CONNECTION_LOST',
  'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
]);

function esErrorDeConexion(error: unknown): boolean {
  const codigo = (error as { code?: string })?.code;
  return !!codigo && CODIGOS_CONEXION.has(codigo);
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  async onModuleInit() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'nexolote',
      // TiDB Cloud exige TLS con su propio CA
      ssl: CA_CERT ? { ca: CA_CERT, minVersion: 'TLSv1.2' } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // TiDB Serverless corta las conexiones idle: el keepalive y el
      // idleTimeout corto evitan que el pool reparta conexiones muertas.
      connectTimeout: 20000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10_000,
      idleTimeout: 30_000,
      maxIdle: 5,
    });

    await this.pool.query('SELECT 1');

    console.log(
      `Conexión a MySQL/TiDB establecida correctamente (${process.env.DB_HOST || 'localhost'})`,
    );
  }

  async query<T>(sql: string, values: any[] = []): Promise<T> {
    try {
      const [rows] = await this.pool.execute(sql, values);
      return rows as T;
    } catch (error) {
      // TiDB puede cerrar una conexión idle mientras estaba en el pool.
      // Se descarta y se reintenta una vez con una conexión nueva.
      if (esErrorDeConexion(error)) {
        console.warn(
          `Conexión perdida con la base de datos, reintentando... (${(error as { code?: string }).code})`,
        );
        const [rows] = await this.pool.execute(sql, values);
        return rows as T;
      }
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}
