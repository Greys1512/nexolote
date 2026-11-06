import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';
import 'dotenv/config';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor() {
    this.pool = createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  async onModuleInit() {
    try {
      await this.pool.query('SELECT 1');
      this.logger.log('Conexión a MySQL exitosa');
    } catch (error) {
      this.logger.error('No se pudo conectar a MySQL: ' + (error as Error).message);
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T> {
    const [rows] = await this.pool.query(sql, params);
    return rows as T;
  }
}